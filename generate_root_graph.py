"""
Root Architecture Graph Generator for FAST BUY WAVE.

Generates a Mermaid diagram showing the full system architecture:
- 3 Podman containers (Angular FE, Spring Boot BE, Python Email Server)
- MySQL database
- External services (Gmail API, Google OAuth2, Stripe, PayPal)
- Local files (api_client.py, test_api.py)
- my-lib-inside local library

Usage:
    python generate_root_graph.py

Output:
    graphs/root-graph.mmd   (raw Mermaid, for SVG export)
    graphs/root-graph.md    (wrapped in markdown code block)
"""

from pathlib import Path

OUT_DIR = Path(r"C:\Users\popam\Desktop\FASTBUYWAVE\graphs")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_mermaid():
    lines = ["graph TD", ""]

    # ── PODMAN CONTAINERS ─────────────────────────────────────────
    lines.append("%% -- Podman Containers --")
    lines.append('subgraph CONTAINER_FE["🐳 Podman · fastbuy-frontend · :4200"]')
    lines.append('  angular["Angular 18\nSSR Express\nNode 20"]:::frontend')
    lines.append('  mylib["my-lib-inside\nUI Library"]:::library')
    lines.append('end')
    lines.append("")
    lines.append('subgraph CONTAINER_BE["🐳 Podman · fastbuy-backend · :8080"]')
    lines.append('  springboot["Spring Boot 3.4\nJava 21\n19 REST Controllers"]:::backend')
    lines.append('end')
    lines.append("")
    lines.append('subgraph CONTAINER_PY["🐳 Podman · fastbuy-email-server · :1234"]')
    lines.append('  smtp_server["SMTP Intermediary\nserver.py\naiosmtpd"]:::python')
    lines.append('  gmail_bot["Gmail Auto-Reply Bot\ngmail_auto_reply.py"]:::python')
    lines.append('end')
    lines.append("")

    # ── DATABASE ──────────────────────────────────────────────────
    lines.append("%% -- Database --")
    lines.append('mysql[("MySQL 8\nDatabase\nLiquibase migrations")]:::database')
    lines.append("")

    # ── EXTERNAL SERVICES ─────────────────────────────────────────
    lines.append("%% -- External Services --")
    lines.append('gmail_api["Gmail API v1\nOAuth2"]:::external')
    lines.append('google_oauth["Google OAuth2\nAuthentication"]:::external')
    lines.append('stripe["Stripe SDK\nPayment Gateway"]:::external')
    lines.append('paypal["PayPal SDK\nPayment Gateway"]:::external')
    lines.append("")

    # ── LOCAL SCRIPTS ─────────────────────────────────────────────
    lines.append("%% -- Local Scripts --")
    lines.append('api_client["api_client.py\nREST API client\n(testing)"]:::script')
    lines.append('test_api["test_api.py\nEndpoint tests"]:::script')
    lines.append('auth_http["authController.http\nHTTP scenarios"]:::script')
    lines.append("")

    # ── RELATIONS ─────────────────────────────────────────────────
    lines.append("%% -- Internal relations --")
    lines.append("angular --> mylib")
    lines.append("angular -->|HTTP REST :8080| springboot")
    lines.append("angular -->|WebSocket STOMP| springboot")
    lines.append("springboot --> mysql")
    lines.append("springboot -->|SMTP :1234| smtp_server")
    lines.append("")

    lines.append("%% -- Python container internal --")
    lines.append("smtp_server -->|Gmail SMTP :587| gmail_api")
    lines.append("gmail_bot -->|Gmail API polling| gmail_api")
    lines.append("")

    lines.append("%% -- Spring Boot external --")
    lines.append("springboot --> google_oauth")
    lines.append("springboot --> stripe")
    lines.append("springboot --> paypal")
    lines.append("")

    lines.append("%% -- Local scripts --")
    lines.append("api_client -->|HTTP REST| springboot")
    lines.append("test_api -->|HTTP REST| springboot")
    lines.append("auth_http -->|HTTP REST| springboot")
    lines.append("")

    # ── STYLES ───────────────────────────────────────────────────
    lines.append("classDef frontend  fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff")
    lines.append("classDef library   fill:#ea580c,stroke:#9a3412,stroke-width:2px,color:#fff")
    lines.append("classDef backend   fill:#16a34a,stroke:#166534,stroke-width:2px,color:#fff")
    lines.append("classDef python    fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff")
    lines.append("classDef database  fill:#7c3aed,stroke:#5b21b6,stroke-width:2px,color:#fff")
    lines.append("classDef external  fill:#0891b2,stroke:#164e63,stroke-width:2px,color:#fff")
    lines.append("classDef script    fill:#78716c,stroke:#44403c,stroke-width:1px,color:#fff")

    return "\n".join(lines)


def main():
    print("Generating FAST BUY WAVE root architecture graph...")

    mermaid = generate_mermaid()

    mmd_file = OUT_DIR / "root-graph.mmd"
    mmd_file.write_text(mermaid, encoding="utf-8")
    print(f"  -> {mmd_file}")

    md_file = OUT_DIR / "root-graph.md"
    md_file.write_text("```mermaid\n" + mermaid + "\n```", encoding="utf-8")
    print(f"  -> {md_file}")

    print("\nDone! Now export to SVG with:")
    print("  mmdc -i graphs/root-graph.mmd -o graphs/root-graph.svg -w 4000 -H 3000")


if __name__ == "__main__":
    main()