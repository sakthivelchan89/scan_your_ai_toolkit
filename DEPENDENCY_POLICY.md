# Dependency Policy

This document describes how `scan_your_ai_toolkit` selects, audits, and maintains its third-party dependencies. It exists so users, security reviewers, and downstream consumers can understand the supply chain risk posture of the toolkit.

---

## Goals

1. **Minimize attack surface** — fewer dependencies = fewer CVEs
2. **Prefer well-maintained packages** — active commits, security patches, real maintainers
3. **Patch vulnerabilities fast** — within 7 days for critical, 14 days for high
4. **Pin reproducibly** — `pnpm-lock.yaml` is committed and CI uses `--frozen-lockfile`
5. **Keep transitively-linked code minimal** — bundle size matters for CLI install time

---

## Selection criteria

Before adding a new dependency, maintainers must verify:

| Criterion                          | Requirement                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| **License**                        | OSI-approved permissive (Apache 2.0, MIT, BSD, ISC). No GPL, AGPL, SSPL.     |
| **Last published**                 | Within the last **12 months** (with rare exceptions for stable utilities)    |
| **GitHub stars / weekly downloads**| ≥1k weekly downloads OR ≥500 GitHub stars OR maintained by a known org       |
| **Open issues / PRs**              | Reasonable triage activity (not abandoned)                                   |
| **Security advisories**            | Zero unpatched HIGH or CRITICAL CVEs at time of adoption                     |
| **Bundle size**                    | <50 KB minified for runtime deps; no constraint for devDeps                  |
| **Native bindings**                | Avoid where possible (cross-platform install pain)                           |
| **Type definitions**               | Native TypeScript or `@types/*` available                                    |
| **Alternatives evaluated**         | Considered ≥2 alternatives; document why this one was chosen                 |

---

## Allowed runtime dependencies

The toolkit's runtime dependencies are intentionally minimal. Current allowed list:

| Package                          | Purpose                              | Why it's allowed                                              |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `@modelcontextprotocol/sdk`      | MCP protocol implementation         | Official MCP SDK from Anthropic; required for MCP servers    |
| `commander`                      | CLI argument parsing                | Industry standard, zero CVEs in the last 5 years              |
| `chalk`                          | Terminal color output               | Tiny, pure JS, widely audited                                 |

That's it. **No other runtime dependencies are permitted** without a maintainer ADR (architecture decision record) in `docs/adr/`.

---

## Allowed dev dependencies

| Package                  | Purpose                       |
| ------------------------ | ----------------------------- |
| `typescript`             | Compiler                      |
| `vitest`                 | Test runner                   |
| `@vitest/coverage-v8`    | Coverage reporting            |
| `@types/node`            | Node.js type definitions      |
| `turbo`                  | Monorepo task orchestration   |

Adding a new devDep requires the same review as a runtime dep, but the bar is slightly lower (devDeps don't ship to users).

---

## Update cadence

| Update type        | Frequency           | Triggered by                              |
| ------------------ | ------------------- | ----------------------------------------- |
| **Security patches** | Immediate         | Dependabot alert, GitHub advisory         |
| **Patch versions**   | Weekly            | Dependabot weekly batch (auto-merged if CI green) |
| **Minor versions**   | Monthly           | Manual review, batched in maintenance PRs |
| **Major versions**   | Quarterly         | Manual review with breaking-change audit   |

Dependabot is configured to:

- Run weekly for `npm` ecosystem
- Group patch updates into a single PR
- Auto-merge if CI passes and no breaking change indicators
- Open separate PRs for minor / major bumps

---

## Security patch SLA

| Severity        | Patch within           |
| --------------- | ---------------------- |
| **CRITICAL** (CVSS ≥9.0) | **48 hours** of disclosure |
| **HIGH** (CVSS 7.0–8.9)  | **7 days**                  |
| **MEDIUM** (CVSS 4.0–6.9) | Next minor release         |
| **LOW** (CVSS <4.0)       | Next minor release         |

Definition of "patched": new version published to npm with the fix, and a CVE/GHSA reference in the CHANGELOG.

---

## Vulnerability monitoring

We rely on the following automated and manual processes:

1. **GitHub Dependabot** — alerts and auto-PRs for known vulnerabilities
2. **GitHub CodeQL** — weekly static analysis on push to `main` and on every PR
3. **`pnpm audit`** — run in CI on every push (fails build on HIGH+)
4. **Manual review** — quarterly audit of `pnpm-lock.yaml` for stale or unmaintained packages

---

## Removing dependencies

Maintainers should periodically evaluate whether existing dependencies can be removed. Triggers for removal:

- Package is unmaintained (>12 months without commits)
- Package introduces an incompatible license change
- Package's only consumers in our codebase can be replaced with ~50 LOC of in-house code
- Package has unpatched HIGH/CRITICAL CVE for >30 days

Removal is treated as a breaking change if it changes a package's exported API.

---

## Pinned versions and lockfile

- `pnpm-lock.yaml` is **committed** and **never edited by hand**
- CI uses `pnpm install --frozen-lockfile` (build fails if lockfile is out of date)
- All packages declare a minimum Node version of `>=18` in `engines.node`
- The `packageManager` field in root `package.json` pins pnpm to `9.15.0`

---

## Reporting a supply chain concern

If you identify a malicious package, license issue, or dependency that violates this policy, please email `security@maiife.ai` (see [SECURITY.md](./SECURITY.md)). We'll investigate within 48 hours.

---

## Changelog

| Date       | Change                                    |
| ---------- | ----------------------------------------- |
| 2026-04-07 | Initial version published with v0.1.3+    |
