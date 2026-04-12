"""
Auto-Reply Bot for FAST BUY WAVE.

This module implements an automatic email reply system using the Gmail API.
It continuously monitors the inbox for unread messages and sends a standardized
HTML reply informing senders that the address is an automated intermediary
and that replies will not be read.

Requirements:
    - ``credentials.json``: OAuth2 client credentials from Google Cloud Console.
    - ``token.json``: Auto-generated OAuth2 token (created on first run).
    - Gmail API scope: ``https://www.googleapis.com/auth/gmail.modify``.

Example:
    Run the bot directly::

        python gmail_bot.py
"""

import os.path
import base64
import time
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from datetime import datetime

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
"""list[str]: Gmail API OAuth2 scopes required by this module."""


def log(message: str) -> None:
    """Print a timestamped log message to standard output.

    Args:
        message (str): The message to log.
    """
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}")


def gmail_authenticate():
    """Authenticate with Gmail API using OAuth2.

    Loads credentials from ``token.json`` if available. If missing or expired,
    triggers a new OAuth2 flow using ``credentials.json`` and saves the new token.

    Returns:
        googleapiclient.discovery.Resource: Authenticated Gmail API service object.
    """
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=1025)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    service = build('gmail', 'v1', credentials=creds)
    return service


def list_unread_messages(service):
    """Retrieve all unread messages from the Gmail inbox.

    Args:
        service (googleapiclient.discovery.Resource): Authenticated Gmail API service.

    Returns:
        list[dict]: List of message metadata dicts with ``id`` and ``threadId``.
        Returns an empty list if no unread messages exist.
    """
    results = service.users().messages().list(userId='me', labelIds=['INBOX', 'UNREAD']).execute()
    messages = results.get('messages', [])
    return messages


def get_message(service, msg_id):
    """Fetch the full content of a specific Gmail message.

    Args:
        service (googleapiclient.discovery.Resource): Authenticated Gmail API service.
        msg_id (str): The unique Gmail message ID.

    Returns:
        dict: Full message resource including ``payload``, ``headers``, and ``body``.
    """
    msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    return msg


def create_html_message(to, subject, html_content):
    """Build a base64-encoded HTML email ready for the Gmail API.

    Args:
        to (str): Recipient email address.
        subject (str): Email subject line.
        html_content (str): HTML body content.

    Returns:
        dict: Dict with key ``raw`` containing the base64url-encoded email string,
        suitable for ``service.users().messages().send()``.
    """
    message = MIMEText(html_content, 'html')
    message['to'] = to
    message['subject'] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    return {'raw': raw}


def send_message(service, message):
    """Send an email message via the Gmail API.

    Args:
        service (googleapiclient.discovery.Resource): Authenticated Gmail API service.
        message (dict): A message dict with a ``raw`` key as returned by
            :func:`create_html_message`.

    Returns:
        dict: The sent message resource returned by the Gmail API.
    """
    sent_message = service.users().messages().send(userId='me', body=message).execute()
    return sent_message


def mark_as_read(service, msg_id):
    """Mark a Gmail message as read by removing the ``UNREAD`` label.

    Args:
        service (googleapiclient.discovery.Resource): Authenticated Gmail API service.
        msg_id (str): The unique Gmail message ID to mark as read.
    """
    service.users().messages().modify(
        userId='me', id=msg_id, body={'removeLabelIds': ['UNREAD']}
    ).execute()


def process_unread_messages(service):
    """Process all unread inbox messages and send automated HTML replies.

    For each unread message, extracts the sender address and subject,
    sends a standardized HTML reply explaining that this address is an
    automated intermediary, then marks the message as read.

    Args:
        service (googleapiclient.discovery.Resource): Authenticated Gmail API service.

    Returns:
        int: Number of messages successfully processed and replied to.
    """
    messages = list_unread_messages(service)

    if not messages:
        return 0

    html_reply = """
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2b6cb0 100%); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 2px;">FAST BUY WAVE</h1>
        <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; letter-spacing: 1px;">AUTOMATED NOTIFICATION SYSTEM</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px 24px; background-color: #f9fafb;">
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151;">Dear sender,</p>
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151;">
          This is an <strong>automated reply</strong> generated by the FAST BUY WAVE notification system.
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151;">
          Please note that this email address is used solely as an <strong>intermediary server</strong> and is <strong>not monitored</strong> by a human operator. Any message sent to this address <strong>will not be read or responded to</strong>.
        </p>
        <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151;">
          If you wish to contact the user who reached out to you, please reply directly to the email address provided in the original message.
        </p>

        <!-- Notice box -->
        <div style="background-color: #eff6ff; border-left: 4px solid #2b6cb0; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #1e40af; font-weight: 600;">IMPORTANT NOTICE</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #1e3a5f;">Replies to this address are automatically blocked and will not be delivered to any recipient.</p>
        </div>

        <p style="margin: 0; font-size: 15px; color: #374151;">Thank you for your understanding.</p>
        <p style="margin: 8px 0 0 0; font-size: 15px; color: #374151;">
          Best regards,<br>
          <strong>FAST BUY WAVE Support System</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #1e3a5f; padding: 16px 24px; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #93c5fd; letter-spacing: 0.5px;">
          This is an automated message. Please do not reply to this email.
        </p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #60a5fa;">
          &copy; FAST BUY WAVE &mdash; All rights reserved
        </p>
      </div>

    </div>
    """

    processed_count = 0

    for msg in messages:
        try:
            msg_id = msg['id']
            message = get_message(service, msg_id)
            headers = message['payload']['headers']

            from_email = None
            subject = None

            for header in headers:
                if header['name'] == 'From':
                    from_email = header['value']
                if header['name'] == 'Subject':
                    subject = header['value']

            if from_email:
                log(f"Sending reply to: {from_email} | Subject: {subject}")

                reply = create_html_message(
                    to=from_email,
                    subject="Re: " + (subject or ""),
                    html_content=html_reply
                )
                send_message(service, reply)
                mark_as_read(service, msg_id)

                processed_count += 1
                log(f"Reply sent successfully to: {from_email}")

        except Exception as e:
            log(f"ERROR - Failed to process message {msg_id}: {e}")
            continue

    return processed_count


def run_auto_reply_daemon(check_interval=60):
    """Run the auto-reply bot in daemon mode.

    Authenticates once with Gmail, then enters an infinite loop checking
    for unread messages at the specified interval and sending automated replies.
    Handles ``KeyboardInterrupt`` for graceful shutdown.

    Args:
        check_interval (int): Seconds between inbox checks. Defaults to ``60``.

    Example:
        Run with a 5-minute interval::

            run_auto_reply_daemon(check_interval=300)
    """
    log("FAST BUY WAVE Auto-Reply Bot starting...")
    log(f"Inbox check interval: {check_interval} seconds")
    log("Press Ctrl+C to stop the bot")
    print("-" * 60)

    try:
        service = gmail_authenticate()
        log("Gmail authentication successful")

        while True:
            try:
                processed = process_unread_messages(service)

                if processed > 0:
                    log(f"{processed} message(s) processed and replied to")
                else:
                    log("No new unread messages found")

                log(f"Next check in {check_interval} seconds...")
                time.sleep(check_interval)

            except Exception as e:
                log(f"ERROR - Unexpected error during inbox check: {e}")
                log(f"Retrying in {check_interval} seconds...")
                time.sleep(check_interval)

    except KeyboardInterrupt:
        log("Bot stopped by user")
        log("Goodbye!")
    except Exception as e:
        log(f"CRITICAL ERROR: {e}")
        log("Check your configuration and try again")


if __name__ == '__main__':
    # Adjust the check interval as needed (in seconds):
    # 30  = every 30 seconds
    # 60  = every minute
    # 300 = every 5 minutes
    run_auto_reply_daemon(check_interval=60)