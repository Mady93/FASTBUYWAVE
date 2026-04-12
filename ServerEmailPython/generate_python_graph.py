"""
Python Email Server Dependency Graph Generator for FAST BUY WAVE.

Scans server.py and gmail_auto_reply.py and generates a Mermaid diagram
showing classes, functions, dependencies, and external pip libraries.

Usage:
    python generate_python_graph.py

Output:
    graphs/python-graph.mmd   (raw Mermaid, for SVG export)
    graphs/python-graph.md    (wrapped in markdown code block)
"""

from pathlib import Path

OUT_DIR = Path(r"C:\Users\popam\Desktop\FASTBUYWAVE\ServerEmailPython\graphs")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_mermaid():
    lines = ["graph TD", ""]

    # ── SERVER.PY NODES ──────────────────────────────────────────
    lines.append("%% -- server.py --")
    lines.append('main["main()"]:::func')
    lines.append('IntermediaryHandler["IntermediaryHandler"]:::cls')
    lines.append('handle_DATA["handle_DATA()"]:::method')
    lines.append('is_reply["is_reply_to_intermediary()"]:::method')
    lines.append('track_email["track_forwarded_email()"]:::method')
    lines.append('forward_protect["forward_with_protection()"]:::method')
    lines.append('send_rejection["send_rejection_message()"]:::method')
    lines.append('decode_subject["decode_subject()"]:::method')
    lines.append('extract_content["extract_content()"]:::method')
    lines.append('send_via_gmail["send_email_via_gmail()"]:::method')
    lines.append('smtp_send["_smtp_send()"]:::method')
    lines.append('force_shutdown["force_shutdown()"]:::func')
    lines.append('log_server["log()"]:::func')
    lines.append("")

    # ── GMAIL_AUTO_REPLY.PY NODES ─────────────────────────────────
    lines.append("%% -- gmail_auto_reply.py --")
    lines.append('run_daemon["run_auto_reply_daemon()"]:::func')
    lines.append('gmail_auth["gmail_authenticate()"]:::func')
    lines.append('list_unread["list_unread_messages()"]:::func')
    lines.append('get_message["get_message()"]:::func')
    lines.append('create_html["create_html_message()"]:::func')
    lines.append('send_message["send_message()"]:::func')
    lines.append('mark_read["mark_as_read()"]:::func')
    lines.append('process_unread["process_unread_messages()"]:::func')
    lines.append('log_bot["log()"]:::func')
    lines.append("")

    # ── EXTERNAL LIBRARIES ────────────────────────────────────────
    lines.append("%% -- External Libraries --")
    lines.append('aiosmtpd["aiosmtpd\nController"]:::lib')
    lines.append('smtplib["smtplib\nSMTP / STARTTLS"]:::lib')
    lines.append('dotenv["python-dotenv\nload_dotenv"]:::lib')
    lines.append('gmail_api["google-api-python-client\ngmail API v1"]:::lib')
    lines.append('google_auth["google-auth-oauthlib\nOAuth2 Flow"]:::lib')
    lines.append('asyncio_lib["asyncio\nevent loop"]:::lib')
    lines.append('email_lib["email / MIME\nMIMEMultipart / MIMEText"]:::lib')
    lines.append('signal_lib["signal\nSIGINT / SIGTERM"]:::lib')
    lines.append('threading_lib["threading\ndaemon thread"]:::lib')
    lines.append("")

    # ── CONFIG FILES ──────────────────────────────────────────────
    lines.append("%% -- Config / Secrets --")
    lines.append('env_file[".env\nRELAY_EMAIL\nRELAY_PASSWORD"]:::config')
    lines.append('credentials["credentials.json\nOAuth2 client"]:::config')
    lines.append('token["token.json\nOAuth2 token"]:::config')
    lines.append("")

    # ── RELATIONS: server.py internal ────────────────────────────
    lines.append("%% -- server.py internal relations --")
    lines.append("main --> IntermediaryHandler")
    lines.append("main --> force_shutdown")
    lines.append("main --> signal_lib")
    lines.append("IntermediaryHandler --> handle_DATA")
    lines.append("handle_DATA --> is_reply")
    lines.append("handle_DATA --> forward_protect")
    lines.append("handle_DATA --> send_rejection")
    lines.append("handle_DATA --> track_email")
    lines.append("forward_protect --> decode_subject")
    lines.append("forward_protect --> extract_content")
    lines.append("forward_protect --> send_via_gmail")
    lines.append("send_via_gmail --> smtp_send")
    lines.append("send_rejection --> send_via_gmail")
    lines.append("")

    # ── RELATIONS: gmail_auto_reply.py internal ───────────────────
    lines.append("%% -- gmail_auto_reply.py internal relations --")
    lines.append("run_daemon --> gmail_auth")
    lines.append("run_daemon --> process_unread")
    lines.append("process_unread --> list_unread")
    lines.append("process_unread --> get_message")
    lines.append("process_unread --> create_html")
    lines.append("process_unread --> send_message")
    lines.append("process_unread --> mark_read")
    lines.append("")

    # ── RELATIONS: external libs ──────────────────────────────────
    lines.append("%% -- External library relations --")
    lines.append("main --> aiosmtpd")
    lines.append("smtp_send --> smtplib")
    lines.append("IntermediaryHandler --> dotenv")
    lines.append("IntermediaryHandler --> asyncio_lib")
    lines.append("handle_DATA --> email_lib")
    lines.append("forward_protect --> email_lib")
    lines.append("gmail_auth --> google_auth")
    lines.append("gmail_auth --> gmail_api")
    lines.append("list_unread --> gmail_api")
    lines.append("get_message --> gmail_api")
    lines.append("send_message --> gmail_api")
    lines.append("mark_read --> gmail_api")
    lines.append("main --> threading_lib")
    lines.append("")

    # ── RELATIONS: config files ───────────────────────────────────
    lines.append("%% -- Config file relations --")
    lines.append("IntermediaryHandler --> env_file")
    lines.append("gmail_auth --> credentials")
    lines.append("gmail_auth --> token")
    lines.append("")

    # ── STYLES ───────────────────────────────────────────────────
    lines.append("classDef cls       fill:#7c3aed,stroke:#5b21b6,stroke-width:2px,color:#fff")
    lines.append("classDef method    fill:#a78bfa,stroke:#7c3aed,stroke-width:1px,color:#fff")
    lines.append("classDef func      fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff")
    lines.append("classDef lib       fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff")
    lines.append("classDef config    fill:#d97706,stroke:#92400e,stroke-width:2px,color:#fff")

    return "\n".join(lines)


def main():
    print("Generating Python Email Server dependency graph...")

    mermaid = generate_mermaid()

    # Raw .mmd (for SVG export)
    mmd_file = OUT_DIR / "python-graph.mmd"
    mmd_file.write_text(mermaid, encoding="utf-8")
    print(f"  -> {mmd_file}")

    # Wrapped .md (for GitHub preview)
    md_file = OUT_DIR / "python-graph.md"
    md_file.write_text("```mermaid\n" + mermaid + "\n```", encoding="utf-8")
    print(f"  -> {md_file}")

    print("\nDone! Now export to SVG with:")
    print("  mmdc -i graphs/python-graph.mmd -o graphs/python-graph.svg -w 4000 -H 3000")


if __name__ == "__main__":
    main()