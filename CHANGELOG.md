# Changelog

All notable changes to `scan_your_ai_toolkit` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Version numbers apply to **all `@maiife-ai-pub/*` packages** in this monorepo — they are released in lockstep.

---

## [Unreleased]

### Added

- GitHub Actions CI workflow (`ci.yml`) running lint + type-check + tests on every PR across Node 18, 20, 22
- Code coverage reporting via `@vitest/coverage-v8` (`pnpm test:coverage`)
- MCP protocol conformance test suite (`pnpm test:conformance`) for all 12 MCP servers, validating:
  - stdio transport behavior (no non-JSON on stdout)
  - `initialize` handshake
  - `tools/list` returns expected tools
  - all tool `inputSchema` fields are valid JSON Schema objects
  - unknown tool calls return structured errors
- `CONTRIBUTING.md` documenting maintainer response SLAs (24h security, 2 business day triage)
- `DEPENDENCY_POLICY.md` documenting dependency selection criteria, supply chain practices, and update cadence
- `CodeQL` security scanning workflow (weekly + on every PR)
- Shared MCP test harness exported from `@maiife-ai-pub/shared/testing/conformance`

### Changed

- All package `package.json` files now declare `test:coverage` and `test:conformance` scripts
- `turbo.json` adds `test:coverage` and `test:conformance` task definitions

---

## [0.1.3] — 2026-04-07

### Fixed

- **mcp-doctor**: replaced `execSync` with string interpolation by `execFileSync` with array args (CodeQL: command injection)
- **mcp-audit**: anchored regex per-arg instead of running on joined string (CodeQL: ReDoS)
- **vite**: bumped to 7.3.2 to patch path traversal, `fs.deny` bypass, and WebSocket arbitrary file read (Dependabot)
- **container-release.yml**: added top-level `permissions: { contents: read, packages: write }` block (workflow hardening)
- **workspace protocol**: republished with `pnpm publish` (instead of `npm publish`) so `workspace:*` resolves to actual published versions
- **LICENSE**: synced to canonical Apache 2.0 with Maiife copyright attribution

### Added

- `SECURITY.md` with vulnerability reporting policy
- Glama MCP registry quality and score badges in README

### Removed

- Root `Dockerfile` (Glama auto-generates its own; the root file was being misread as build instructions)

---

## [0.1.2] — 2026-04-06

### Added

- Initial public release of 12 MCP servers:
  - `probe` — environment scanner (IDE extensions, MCP servers, agent frameworks, API keys, local models)
  - `mcp-audit` — MCP server security scanner with 5-dimension scoring
  - `mcp-doctor` — MCP server health checks and config validation
  - `eval` — LLM evaluation runner with batch + comparison modes
  - `prompt-score` — prompt quality analyzer
  - `prompt-craft` — prompt improvement and gamification
  - `cost` — token spend reporter and optimizer
  - `model-match` — model recommendation engine
  - `ai-stack` — AI stack profile generator
  - `context-sync` — cross-tool context synchronization
  - `sub-audit` — subscription audit
  - `trace` — LLM call tracing
- 3 CLI tools without MCP transport:
  - `ai-journal`
  - `weekly-ai-report`
  - Internal `shared` library
- Apache 2.0 license
- Published to npm under `@maiife-ai-pub/*`
- Published to GHCR as `ghcr.io/sakthivelchan89/maiife-*`

---

## Conventions

- **Added**: new features, new packages, new tools
- **Changed**: changes in existing functionality
- **Deprecated**: features marked for removal in a future release
- **Removed**: features removed in this release
- **Fixed**: bug fixes, including security patches
- **Security**: vulnerability disclosures and CVE references

[Unreleased]: https://github.com/sakthivelchan89/scan_your_ai_toolkit/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/sakthivelchan89/scan_your_ai_toolkit/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/sakthivelchan89/scan_your_ai_toolkit/releases/tag/v0.1.2
