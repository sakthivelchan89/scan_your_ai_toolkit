# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in any `@maiife-ai-pub/*` package, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email **security@maiife.ai** with:

1. **Package name** (e.g., `@maiife-ai-pub/probe`)
2. **Description** of the vulnerability
3. **Steps to reproduce**
4. **Impact assessment** (what an attacker could do)
5. **Suggested fix** (if you have one)

### What to Expect

- **Acknowledgement** within 48 hours
- **Assessment** within 5 business days
- **Fix timeline** communicated after assessment
- **Credit** in the release notes (unless you prefer anonymity)

### Security Design Principles

All MCP servers in this toolkit:

- Use **stdio transport only** — no network ports exposed
- Run as **non-root** in Docker containers
- Have **no external network dependencies** at runtime
- Store data **locally only** (no cloud telemetry)
- Use **read-only** file system access where possible
