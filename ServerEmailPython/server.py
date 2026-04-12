"""
SMTP Intermediary Server for FAST BUY WAVE.

This module implements an asynchronous SMTP intermediary server that receives
incoming emails, detects whether they are replies to previously forwarded messages,
and either forwards them to the intended recipient via Gmail or blocks them.

Every forwarded email is enriched with anti-reply protection headers.
If a reply is detected, a rejection message is sent back to the sender.

Configuration:
    Requires a ``.env`` file in the project root::

        RELAY_EMAIL=youraccount@gmail.com
        RELAY_PASSWORD=your_app_password

Example:
    Start the server::

        python server.py
"""

import asyncio
import signal
import sys
import os
import threading
import time
from aiosmtpd.controller import Controller
import smtplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import decode_header
from datetime import datetime, timedelta

from dotenv import load_dotenv

load_dotenv()


def log(message: str) -> None:
    """Print a timestamped log message to standard output.

    Args:
        message (str): The message to log.
    """
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}")


class IntermediaryHandler:
    """Async SMTP handler that forwards or blocks incoming emails.

    Maintains an in-memory registry of forwarded emails to detect future replies.
    All forwarded messages are modified to include anti-reply headers before
    being relayed via Gmail SMTP.

    Attributes:
        relay_email (str): Gmail address used to relay outgoing emails.
        relay_password (str): Gmail app password for SMTP authentication.
        forwarded_emails (dict): Registry of forwarded emails keyed by a unique
            composite string. Each value contains sender, recipient, and timestamp.
        stats (dict): Running counters with keys ``forwarded`` and ``blocked_replies``.
    """

    def __init__(self):
        self.relay_email = os.getenv("RELAY_EMAIL")
        self.relay_password = os.getenv("RELAY_PASSWORD")

        # Tracks emails forwarded by this server to identify future replies
        self.forwarded_emails = {}

        # Running statistics counters
        self.stats = {
            "forwarded": 0,
            "blocked_replies": 0
        }

    async def handle_DATA(self, server, session, envelope):
        """Handle an incoming SMTP DATA command.

        Main entry point called by ``aiosmtpd`` for every received email.
        Checks whether the email is a reply to the intermediary system —
        if so, blocks it and sends a rejection notice. Otherwise, forwards
        the email with anti-reply protection headers.

        Args:
            server: The ``aiosmtpd`` server instance.
            session: The current SMTP client session.
            envelope: The SMTP envelope containing ``mail_from``, ``rcpt_tos``,
                and ``content`` (raw email bytes).

        Returns:
            str: SMTP response string — ``'250 Message forwarded'``,
            ``'550 Replies not accepted'``, or ``'451 Temporary failure'``.
        """
        try:
            sender = envelope.mail_from
            recipients = envelope.rcpt_tos
            email_data = envelope.content

            log(f"Incoming email from: {sender}")
            log(f"Recipients: {recipients}")

            # Step 1: Check if this is a reply to the intermediary system
            if self.is_reply_to_intermediary(sender, email_data):
                log(f"Reply detected from {sender} - blocking message")
                self.stats["blocked_replies"] += 1
                await self.send_rejection_message(sender)
                return '550 Replies to automated messages are not accepted'

            # Step 2: Forward legitimate email with anti-reply protection
            success_count = 0
            for recipient in recipients:
                if await self.forward_with_protection(sender, recipient, email_data):
                    success_count += 1
                    self.track_forwarded_email(sender, recipient)

            if success_count > 0:
                self.stats["forwarded"] += success_count
                log(f"Email forwarded to {success_count} recipient(s)")
                return '250 Message forwarded with anti-reply protection'
            else:
                return '451 Temporary failure - unable to forward'

        except Exception as e:
            log(f"ERROR - Handler exception: {e}")
            return '451 Temporary failure'

    def is_reply_to_intermediary(self, sender, email_data):
        """Determine whether an incoming email is a reply to this intermediary.

        Checks three independent signals:

        1. Subject line contains common reply prefixes (``Re:``, ``Risposta:``, etc.).
        2. Sender address matches a recipient of a previously forwarded email.
        3. Reply-related headers (``In-Reply-To``, ``References``) are present.

        Args:
            sender (str): The envelope sender address (``MAIL FROM``).
            email_data (bytes): Raw email content.

        Returns:
            bool: ``True`` if the email appears to be a reply, ``False`` otherwise.
        """
        try:
            msg = email.message_from_bytes(email_data)
            subject = msg.get('Subject', '').lower()

            reply_indicators = [
                're:', 'reply:', 'risposta:', 'fwd:', 'fw:',
                '[auto-forward]', '[no-reply]', 'sistema automatico',
                'automated system', 'do not reply'
            ]

            is_reply_subject = any(indicator in subject for indicator in reply_indicators)

            is_known_recipient = any(
                sender.lower() == data.get('original_recipient', '').lower()
                for data in self.forwarded_emails.values()
            )

            reply_to = msg.get('Reply-To', '').lower()
            references = msg.get('References', '').lower()
            in_reply_to = msg.get('In-Reply-To', '').lower()

            has_reply_headers = any([
                'noreply' in reply_to,
                'sistema' in reply_to or 'system' in reply_to,
                references, in_reply_to
            ])

            result = is_reply_subject or is_known_recipient or has_reply_headers

            if result:
                log(f"Reply detection breakdown - Subject match: {is_reply_subject} | Known recipient: {is_known_recipient} | Reply headers: {has_reply_headers}")

            return result

        except Exception as e:
            log(f"WARNING - Reply detection error: {e}")
            return False

    def track_forwarded_email(self, original_sender, recipient):
        """Register a forwarded email in the tracking registry.

        Creates a unique key from sender, recipient, and timestamp, then stores
        metadata for future reply detection. Automatically removes entries
        older than 30 days to prevent unbounded memory growth.

        Args:
            original_sender (str): The original sender's email address.
            recipient (str): The forwarded-to recipient's email address.
        """
        key = f"{original_sender}:{recipient}:{int(datetime.now().timestamp())}"
        self.forwarded_emails[key] = {
            "original_sender": original_sender,
            "recipient": recipient,
            "timestamp": datetime.now(),
            "original_recipient": recipient
        }

        # Remove entries older than 30 days
        cutoff = datetime.now() - timedelta(days=30)
        keys_to_remove = [
            k for k, v in self.forwarded_emails.items()
            if v["timestamp"] < cutoff
        ]
        for k in keys_to_remove:
            del self.forwarded_emails[k]

    async def forward_with_protection(self, original_sender, recipient, email_data):
        """Forward an email to its recipient with anti-reply protection headers.

        Reconstructs the email as a new ``MIMEMultipart`` message, injects
        protection headers (``Reply-To``, ``Return-Path``, ``Auto-Submitted``, etc.),
        wraps the original content in an HTML container with an intermediary notice,
        and sends it via Gmail SMTP.

        Args:
            original_sender (str): The original sender address (for logging).
            recipient (str): The destination email address.
            email_data (bytes): Raw original email content.

        Returns:
            bool: ``True`` if sent successfully, ``False`` on error.
        """
        try:
            original_msg = email.message_from_bytes(email_data)
            new_msg = MIMEMultipart()

            new_msg['From'] = "FAST BUY WAVE System"
            new_msg['To'] = recipient

            # Reply-To points to an invalid address to prevent replies
            fake_reply = f"noreply-blocked-{int(datetime.now().timestamp())}@invalid-domain.local"
            new_msg['Reply-To'] = fake_reply
            new_msg['Return-Path'] = "<>"

            original_subject = self.decode_subject(original_msg.get('Subject', ''))
            new_msg['Subject'] = original_subject

            # Anti-reply technical headers
            new_msg['Auto-Submitted'] = 'auto-generated'
            new_msg['X-Auto-Response-Suppress'] = 'All'
            new_msg['Precedence'] = 'bulk'
            new_msg['X-Intermediary-System'] = 'true'
            new_msg['X-Block-Replies'] = 'true'

            original_content = self.extract_content(original_msg)

            intermediary_warning = f"""
<div style="font-family: 'Segoe UI', sans-serif; color: #1f2937; background-color: #f3f4f6; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h2 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 600; color: #111827; text-align: center;">
        Message
    </h2>
    {original_content}
    <div style="margin-top: 30px; background-color: #fefce8; border: 2px dashed #facc15; padding: 24px; border-radius: 12px; text-align: center;">
        <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #b45309;">FAST BUY WAVE</h3>
        <div style="margin-top: 18px; background-color: #fff7ed; padding: 16px; border-radius: 8px; border: 1px solid #fde68a;">
            <p style="margin: 0; font-weight: 500; font-size: 14px;">This message was forwarded by an automatic intermediary server.</p>
            <p style="margin: 4px 0 0 0; font-weight: 500; font-size: 14px;">Replies are disabled and will not be delivered.</p>
        </div>
    </div>
</div>
"""

            new_msg.attach(MIMEText(intermediary_warning, 'html'))

            await self.send_email_via_gmail(new_msg, recipient)
            return True

        except Exception as e:
            log(f"ERROR - Failed to forward email to {recipient}: {e}")
            return False

    async def send_rejection_message(self, blocked_sender):
        """Send a rejection notice to an address that attempted to reply.

        Args:
            blocked_sender (str): The email address to notify.
        """
        try:
            rejection_html = """
<div style="font-family: 'Segoe UI', sans-serif; color: #1f2937; padding: 20px;">
    <h2 style="color: #dc2626;">Email Rejected</h2>
    <p>Your reply could not be delivered.</p>
    <p>This address belongs to an automated intermediary server managed by
    <strong>FAST BUY WAVE</strong> and does not accept incoming replies.</p>
    <p>If you need to contact the original sender, please use their email address
    provided in the original message.</p>
    <p>Best regards,<br>FAST BUY WAVE Support System</p>
</div>
"""
            rejection = MIMEMultipart()
            rejection['From'] = "FAST BUY WAVE System"
            rejection['To'] = blocked_sender
            rejection['Subject'] = "Email Rejected - Reply to intermediary system not accepted"
            rejection['Auto-Submitted'] = 'auto-replied'
            rejection.attach(MIMEText(rejection_html, 'html'))

            await self.send_email_via_gmail(rejection, blocked_sender)
            log(f"Rejection notice sent to: {blocked_sender}")

        except Exception as e:
            log(f"ERROR - Failed to send rejection notice: {e}")

    def decode_subject(self, subject):
        """Decode a MIME-encoded email subject line to a plain string.

        Args:
            subject (str): Raw subject value, possibly RFC 2047 encoded.

        Returns:
            str: Decoded subject string, or ``'No subject'`` if empty.
        """
        if not subject:
            return "No subject"
        try:
            decoded_parts = decode_header(subject)
            result = ""
            for part, encoding in decoded_parts:
                if isinstance(part, bytes):
                    result += part.decode(encoding if encoding else 'utf-8')
                else:
                    result += part
            return result
        except Exception:
            return subject

    def extract_content(self, msg):
        """Extract the HTML or plain-text body from an email message.

        For multipart messages, prefers ``text/html`` over ``text/plain``.
        Plain text is converted to HTML by replacing newlines with ``<br>``.

        Args:
            msg (email.message.Message): A parsed email message object.

        Returns:
            str: The email body as an HTML string, or ``'[Content unreadable]'``
            if extraction fails.
        """
        try:
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/html":
                        return part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    elif part.get_content_type() == "text/plain":
                        content = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        return content.replace('\n', '<br>')
            else:
                content = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                return content.replace('\n', '<br>')
        except Exception:
            return "[Content unreadable]"

    async def send_email_via_gmail(self, message, recipient):
        """Dispatch an email asynchronously using Gmail SMTP in a thread executor.

        Wraps the synchronous :meth:`_smtp_send` in ``loop.run_in_executor``
        to avoid blocking the asyncio event loop.

        Args:
            message (email.mime.base.MIMEBase): The fully constructed MIME message.
            recipient (str): The destination email address.
        """
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._smtp_send, message, recipient)
        except Exception as e:
            log(f"ERROR - SMTP dispatch failed: {e}")

    def _smtp_send(self, message, recipient):
        """Send an email synchronously via Gmail SMTP with STARTTLS.

        Connects to ``smtp.gmail.com:587``, upgrades with STARTTLS,
        authenticates, and sends the message.

        Args:
            message (email.mime.base.MIMEBase): The fully constructed MIME message.
            recipient (str): The destination email address.

        Raises:
            smtplib.SMTPException: If authentication or sending fails.
        """
        server = None
        try:
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(self.relay_email, self.relay_password)
            server.sendmail(self.relay_email, recipient, message.as_string())
        finally:
            if server:
                server.quit()


def force_shutdown():
    """Force-terminate the process after a 5-second timeout.

    Runs in a daemon thread. If graceful shutdown does not complete within
    5 seconds, calls ``os._exit(1)`` to hard-kill the process.
    """
    time.sleep(5)
    log("FORCED SHUTDOWN - Server did not stop gracefully, terminating process")
    os._exit(1)


def main():
    """Start the SMTP intermediary server and run the main event loop.

    Initialises :class:`IntermediaryHandler`, starts the ``aiosmtpd``
    controller on ``localhost:1234``, registers ``SIGINT``/``SIGTERM`` handlers
    for graceful shutdown, and prints periodic statistics every 5 minutes.
    """
    print("-" * 60)
    print(" FAST BUY WAVE - SMTP Intermediary Server")
    print("-" * 60)

    handler = IntermediaryHandler()
    controller = None
    shutdown_initiated = False

    def signal_handler(signum, frame):
        nonlocal shutdown_initiated
        if shutdown_initiated:
            log("Second interrupt received - forcing exit")
            os._exit(1)

        shutdown_initiated = True
        log(f"Signal {signum} received - initiating shutdown...")

        # Start forced shutdown watchdog thread
        force_thread = threading.Thread(target=force_shutdown, daemon=True)
        force_thread.start()

        try:
            if controller:
                log("Stopping controller...")
                controller.stop()
                log("Controller stopped")

            log(f"Final statistics - Forwarded: {handler.stats['forwarded']} | Blocked replies: {handler.stats['blocked_replies']}")
            log("Shutdown complete")

        except Exception as e:
            log(f"ERROR - Exception during shutdown: {e}")
        finally:
            sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        controller = Controller(handler, hostname='localhost', port=1234)
        controller.start()

        log("Server listening on localhost:1234")
        log("Statistics: Forwarded=0 | Blocked replies=0")
        log("Press Ctrl+C to stop (double Ctrl+C to force exit)")
        print("-" * 60)

        last_stats_time = time.time()
        while True:
            time.sleep(1)

            # Print statistics every 5 minutes
            if time.time() - last_stats_time > 300:
                log(f"Statistics - Forwarded: {handler.stats['forwarded']} | Blocked: {handler.stats['blocked_replies']} | Tracked: {len(handler.forwarded_emails)}")
                last_stats_time = time.time()

    except KeyboardInterrupt:
        # Handled by signal_handler
        pass
    except Exception as e:
        log(f"CRITICAL ERROR: {e}")
        if controller:
            controller.stop()
        sys.exit(1)


if __name__ == "__main__":
    main()