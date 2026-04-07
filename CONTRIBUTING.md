# Contributing to scan_your_ai_toolkit

Thanks for your interest in improving Maiife's open-source AI governance toolkit. This document explains how to file issues, propose changes, and what response timelines you can expect from maintainers.

---

## Quick links

- **Bug reports**: [open an issue](https://github.com/sakthivelchan89/scan_your_ai_toolkit/issues/new?labels=bug)
- **Feature requests**: [open an issue](https://github.com/sakthivelchan89/scan_your_ai_toolkit/issues/new?labels=enhancement)
- **Security vulnerabilities**: see [SECURITY.md](./SECURITY.md) — **do not file public issues**
- **Discussions**: [GitHub Discussions](https://github.com/sakthivelchan89/scan_your_ai_toolkit/discussions)

---

## Maintainer response SLAs

We commit to the following response times for inbound work, measured in **business days** (Mon–Fri, IST timezone, excluding Indian public holidays):

| Type                              | First response | Triage / labelling | Resolution target            |
| --------------------------------- | -------------- | ------------------ | ---------------------------- |
| **Security vulnerability**        | 24 hours       | 24 hours           | Patch within **7 days**      |
| **Critical bug** (crash, data loss, regression in latest release) | 1 business day | 1 business day     | Fix within **5 business days** |
| **Standard bug**                  | 2 business days | 2 business days   | Fix within next minor release |
| **Feature request**               | 2 business days | 5 business days    | Roadmap decision communicated |
| **Pull request review**           | 2 business days | —                  | Merge or actionable feedback within 5 business days |
| **Documentation issue**           | 2 business days | 2 business days    | Fix within next release      |

If we miss these targets, please ping `@sakthivelchan89` on the issue, or email `contact@maiife.ai` for escalation.

---

## Reporting bugs

Before opening a bug report:

1. Confirm you're on the **latest published version** (`npm view @maiife-ai-pub/<package> version`)
2. Search [existing issues](https://github.com/sakthivelchan89/scan_your_ai_toolkit/issues?q=is%3Aissue) for duplicates
3. Reproduce on a clean environment if possible

A good bug report includes:

- **Package and version**: e.g. `@maiife-ai-pub/probe@0.1.3`
- **Environment**: OS, Node version (`node --version`), MCP client (Claude Desktop, Cursor, etc.)
- **What you did**: exact command or MCP tool call
- **What you expected**: 1–2 sentences
- **What happened**: error messages, stack traces, screenshots
- **Minimal repro**: smallest config / project that triggers it

---

## Proposing changes

### Small changes (typo, doc fix, single-file bugfix)

Open a PR directly against `main`. No need to file an issue first.

### Larger changes (new feature, API change, new package)

1. **Open an issue first** describing the problem and proposed solution
2. Wait for maintainer ack (within 2 business days per SLA above)
3. Once aligned, open a PR referencing the issue (`Closes #123`)

This avoids wasted work on changes we can't accept.

---

## Development setup

```bash
git clone https://github.com/sakthivelchan89/scan_your_ai_toolkit.git
cd scan_your_ai_toolkit
pnpm install
pnpm build
pnpm test
```

Per-package commands:

```bash
cd packages/probe
pnpm test                # unit tests (vitest)
pnpm test:coverage       # unit tests + coverage report
pnpm test:conformance    # MCP protocol conformance tests
pnpm lint                # TypeScript type-check
pnpm build               # compile to dist/
```

---

## Coding standards

- **TypeScript**: strict mode enforced (`tsconfig.base.json`)
- **Style**: 2-space indent, double quotes, trailing commas
- **No ESLint config yet** — type-check via `tsc --noEmit` is the lint
- **Tests**: vitest. New features must include tests. Bug fixes must include a failing-test-first reproduction.
- **MCP servers**: must pass conformance suite (`pnpm test:conformance`)
- **Security**: no `execSync`/`exec` with string interpolation; use `execFileSync` with array args. No `eval`. No regex on unbounded user input without anchors.
- **Commit style**: imperative, ≤72 chars (`fix: handle missing config in probe scanner`)

---

## Testing requirements for PRs

| PR type        | Required tests                                              |
| -------------- | ----------------------------------------------------------- |
| Bug fix        | Regression test (must fail before fix, pass after)          |
| New feature    | Unit tests covering happy + 2 error paths                   |
| New MCP server | Unit + conformance tests + Dockerfile + README              |
| Refactor       | Existing tests must still pass; coverage must not decrease  |
| Docs only      | None — but verify links + code blocks                       |

---

## Pull request checklist

Before requesting review:

- [ ] `pnpm build` succeeds at the workspace root
- [ ] `pnpm lint` passes (type-check)
- [ ] `pnpm test` passes for the affected package(s)
- [ ] `pnpm test:conformance` passes for MCP server changes
- [ ] New code has tests (see table above)
- [ ] CHANGELOG.md updated under `## [Unreleased]`
- [ ] PR description explains **why**, not just what
- [ ] Linked to an issue if larger than ~50 LOC

---

## Releases

We follow [Semantic Versioning](https://semver.org/):

- **PATCH** (0.1.x): bugfixes, security patches, doc fixes
- **MINOR** (0.x.0): new tools, new MCP servers, additive API changes
- **MAJOR** (x.0.0): breaking API changes, removed tools, schema changes

Releases are cut by maintainers via git tag (`v0.1.4`) which triggers the container release workflow. Published versions land on npm under `@maiife-ai-pub/*` and on GHCR as `ghcr.io/sakthivelchan89/maiife-<package>`.

See [CHANGELOG.md](./CHANGELOG.md) for the version history.

---

## Code of conduct

Be respectful. Be patient. Assume good intent. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) — violations can be reported to `contact@maiife.ai`.

---

## License

By contributing, you agree your contributions are licensed under the [Apache License 2.0](./LICENSE), the same license as the project.
