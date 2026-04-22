# Maiife Toolkit — Test Harness

End-to-end smoke testing for all 15 toolkit packages. Tests CLIs, MCP servers, and unit logic against realistic seed data.

## Directory Structure

```
test-harness/
├── README.md                   ← you are here
├── run-all.sh                  ← CLI smoke test runner (16 tests)
├── run-mcp-tests.sh            ← MCP server integration runner (12 tests)
├── fixtures/                   ← seed data (checked in, never contains real secrets)
│   ├── mock-project/           ← fake AI-enabled Node.js project
│   │   ├── package.json        ← AI SDK deps (openai, anthropic, langchain, etc.)
│   │   ├── .env                ← fake API keys (sk-fake-...)
│   │   ├── .vscode/            ← Copilot, Continue, Cody extensions
│   │   └── .cursor/mcp.json    ← 3 MCP servers (filesystem, postgres, github)
│   ├── mcp-configs/
│   │   └── claude_desktop_config.json  ← Claude Desktop MCP config (3 servers)
│   ├── prompts/                ← prompt fixtures for eval, prompt-score, prompt-craft
│   │   ├── good-prompt.txt     ← well-structured code review prompt
│   │   ├── bad-prompt.txt      ← vague one-liner
│   │   ├── medium-prompt.txt   ← average quality
│   │   ├── batch-eval.jsonl    ← 5 outputs for batch eval scoring
│   │   ├── compare-baseline.jsonl   ← baseline for A/B compare
│   │   └── compare-candidate.jsonl  ← candidate for A/B compare
│   ├── context/
│   │   └── seed-context.json   ← 6 context entries for context-sync
│   ├── journal/
│   │   └── seed-entries.json   ← 5 AI journal entries across tools
│   ├── traces/
│   │   └── sample-traces.json  ← 3 agent execution traces (2 pass, 1 fail)
│   └── subscriptions/
│       └── .env                ← 8 fake subscription credentials for sub-audit
└── results/                    ← generated output (gitignored)
    └── YYYYMMDD-HHMMSS/
        ├── build.out           ← pnpm build log
        ├── summary.json        ← machine-readable results
        ├── mcp-summary.json    ← MCP test results
        └── {package}.out       ← per-package CLI output
```

## Prerequisites

```bash
cd toolkit
pnpm install       # install all dependencies
pnpm build         # build all packages (run-all.sh does this too)
```

## Running Tests

### CLI Smoke Tests (all 16 tests)

```bash
cd toolkit/test-harness
bash run-all.sh
```

What it does:
1. Builds all 15 packages via `pnpm build`
2. Runs each CLI against fixture data
3. Captures output + exit code + duration
4. Prints a color-coded summary table
5. Writes `results/<timestamp>/summary.json`

### MCP Server Tests (all 12 servers)

```bash
cd toolkit/test-harness
bash run-mcp-tests.sh
```

What it does:
1. Starts each MCP server as a subprocess
2. Sends JSON-RPC: initialize → initialized → tool call
3. Validates the tool response (has `result`, not `error`)
4. 10-second timeout per server
5. Writes `results/mcp-summary.json`

### Unit Tests (vitest)

```bash
cd toolkit
pnpm test          # all packages via turbo
```

### All Three

```bash
cd toolkit/test-harness
bash run-all.sh && bash run-mcp-tests.sh && cd .. && pnpm test
```

## Test Coverage by Package

| Package | CLI Tests | MCP Tests | Unit Tests | Fixture Data |
|---------|-----------|-----------|------------|-------------|
| probe | `scan` | `probe_scan` | 5 files | mock-project/ |
| ai-stack | `profile` | `ai_stack_generate` | 3 files | mock-project/ |
| mcp-audit | `scan` | `mcp_audit_scan` | 2 files | mcp-configs/ |
| mcp-doctor | `check` | `mcp_doctor_checkup` | 1 file | mcp-configs/ |
| cost | `report` | `cost_report` | 2 files | (offline) |
| eval | `score`, `batch` | `eval_score` | 2 files | prompts/*.jsonl |
| context-sync | `list` | `context_sync_read` | 2 files | context/ |
| model-match | `compare`, `recommend` | `model_match_compare` | 1 file | (built-in data) |
| prompt-score | `analyze` | `prompt_score_analyze` | 2 files | prompts/ |
| prompt-craft | `score` | `prompt_craft_score` | 1 file | prompts/ |
| ai-journal | `digest` | — | 2 files | journal/ |
| sub-audit | `scan` | `sub_audit_run` | 1 file | subscriptions/ |
| trace | `list` | `trace_list` | 1 file | traces/ |
| weekly-ai-report | `generate` | — | 1 file | (offline) |
| shared | — | — | 0 files | — |

## Test Groups

### Group 1: Filesystem Scanners
**probe, ai-stack, mcp-audit, mcp-doctor** — scan `fixtures/mock-project/` and `fixtures/mcp-configs/`. These run fully offline and produce deterministic output.

### Group 2: Prompt/Eval Processors
**eval, prompt-score, prompt-craft** — process text from `fixtures/prompts/`. These use local scoring rubrics (no LLM API calls).

### Group 3: Comparison/Recommendation
**model-match** — uses built-in model data. Fully offline, deterministic.

### Group 4: Data Store Tools
**ai-journal, context-sync, sub-audit, trace, cost, weekly-ai-report** — these may return empty results on first run (no local data store populated). Status `EMPTY` is expected and counts as pass.

## Interpreting Results

| Status | Meaning |
|--------|---------|
| **PASS** | Exit code 0, produced output |
| **EMPTY** | Exit code 0, no output (expected for data-store tools on first run) |
| **FAIL** | Non-zero exit code (crash, missing dependency, bad args) |
| **SKIP** | dist/ not found (package not built) |

## Seed Data

All fixture data uses clearly fake values:
- API keys: `sk-fake-test-key-*`, `sk-ant-fake-*`, `AIza-fake-*`
- Tokens: `ghp_fake*`, `xoxb-fake-*`
- URLs: `localhost` only
- No real credentials, no real API calls

To add new seed data:
1. Create files in the appropriate `fixtures/` subdirectory
2. Add a test command to `run-all.sh` using `run_test`
3. For MCP servers, add a `test_mcp_server` call to `run-mcp-tests.sh`

## Publishing Results

Results are saved to `results/` (gitignored). To share:

```bash
# Print last run summary
cat results/$(ls results/ | sort | tail -1)/summary.json | python3 -m json.tool

# Compare two runs
diff <(cat results/run1/summary.json | python3 -c "import sys,json; [print(r['package'],r['status']) for r in json.load(sys.stdin)['results']]") \
     <(cat results/run2/summary.json | python3 -c "import sys,json; [print(r['package'],r['status']) for r in json.load(sys.stdin)['results']]")
```

## CI Integration

Both scripts exit with code 1 if any test fails. Use in GitHub Actions:

```yaml
- name: Smoke test toolkit
  run: |
    cd toolkit/test-harness
    bash run-all.sh
    bash run-mcp-tests.sh

- name: Unit tests
  run: |
    cd toolkit
    pnpm test
```
