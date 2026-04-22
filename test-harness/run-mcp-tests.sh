#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# run-mcp-tests.sh — MCP server integration test harness
#
# Tests all 12 MCP-enabled toolkit packages by sending JSON-RPC requests
# via stdin/stdout (stdio transport). Each server is started as a subprocess,
# receives initialize + tool call, and must respond within TIMEOUT seconds.
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
RESULTS_FILE="$RESULTS_DIR/mcp-summary.json"
TIMEOUT=10

mkdir -p "$RESULTS_DIR"

# Counters
PASS=0
FAIL=0
SKIP=0
TOTAL=0

# Accumulate JSON results
JSON_ENTRIES=""

# Colors (disabled if not a terminal)
if [[ -t 1 ]]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  GREEN="" RED="" YELLOW="" CYAN="" BOLD="" RESET=""
fi

###############################################################################
# test_mcp_server — start server, send JSON-RPC, validate response
#
# Arguments:
#   $1  package name (display label)
#   $2  server entry point (relative to SCRIPT_DIR)
#   $3  tool name
#   $4  tool arguments (JSON string)
###############################################################################
test_mcp_server() {
  local pkg="$1"
  local server_path="$2"
  local tool_name="$3"
  local tool_args="$4"

  TOTAL=$((TOTAL + 1))

  local abs_server
  abs_server="$(cd "$SCRIPT_DIR" && realpath "$server_path" 2>/dev/null || echo "$SCRIPT_DIR/$server_path")"

  # Check that the dist file exists
  if [[ ! -f "$abs_server" ]]; then
    printf "  ${YELLOW}SKIP${RESET}  %-18s  dist not found: %s\n" "$pkg" "$server_path"
    SKIP=$((SKIP + 1))
    append_json "$pkg" "skip" "dist not found" "" ""
    return
  fi

  # Build the 3-message payload: initialize, initialized notification, tool call
  local payload
  payload=$(cat <<JSONEOF
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-harness","version":"1.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"${tool_name}","arguments":${tool_args}}}
JSONEOF
)

  # Temp files for stdout and stderr capture
  local tmp_out tmp_err
  tmp_out=$(mktemp)
  tmp_err=$(mktemp)

  local start_time end_time elapsed_ms
  start_time=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")

  # Start MCP server as subprocess, feed payload via stdin
  # Use timeout (coreutils) or gtimeout (macOS) to enforce deadline
  local timeout_cmd="timeout"
  if ! command -v timeout &>/dev/null; then
    if command -v gtimeout &>/dev/null; then
      timeout_cmd="gtimeout"
    else
      # Fallback: run without timeout wrapper
      timeout_cmd=""
    fi
  fi

  local exit_code=0
  if [[ -n "$timeout_cmd" ]]; then
    echo "$payload" | $timeout_cmd "${TIMEOUT}s" node "$abs_server" >"$tmp_out" 2>"$tmp_err" || exit_code=$?
  else
    # Manual timeout with background process
    echo "$payload" | node "$abs_server" >"$tmp_out" 2>"$tmp_err" &
    local pid=$!
    local waited=0
    while kill -0 "$pid" 2>/dev/null && [[ $waited -lt $TIMEOUT ]]; do
      sleep 1
      waited=$((waited + 1))
    done
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
      exit_code=124 # timeout
    else
      wait "$pid" 2>/dev/null || exit_code=$?
    fi
  fi

  end_time=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")
  elapsed_ms=$(( (end_time - start_time) / 1000000 ))

  local raw_out raw_err
  raw_out=$(cat "$tmp_out")
  raw_err=$(cat "$tmp_err")
  rm -f "$tmp_out" "$tmp_err"

  # Parse: look for the tool call response (id:2)
  # MCP servers may emit multiple JSON objects on stdout (one per response).
  # We need the line containing "id":2 (the tool call response).
  local tool_response=""
  local status="fail"
  local detail=""

  if [[ $exit_code -eq 124 ]]; then
    detail="timeout after ${TIMEOUT}s"
  elif [[ -z "$raw_out" ]]; then
    detail="no stdout output"
  else
    # Extract the JSON line with id:2 (tool call response)
    tool_response=$(echo "$raw_out" | tr '\r' '\n' | grep -E '"id"\s*:\s*2' | head -1 || true)

    if [[ -z "$tool_response" ]]; then
      # Maybe server returned a single merged output; try to find any response with result
      tool_response=$(echo "$raw_out" | tr '\r' '\n' | grep -E '"result"' | tail -1 || true)
    fi

    if [[ -z "$tool_response" ]]; then
      # Check if there's an error response for id:2
      local err_response
      err_response=$(echo "$raw_out" | tr '\r' '\n' | grep -E '"error"' | head -1 || true)
      if [[ -n "$err_response" ]]; then
        detail="server returned error"
        # Try to extract error message
        local err_msg
        err_msg=$(echo "$err_response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message','unknown'))" 2>/dev/null || echo "parse-failed")
        detail="error: $err_msg"
      else
        detail="no tool response found in output"
      fi
    else
      # Validate: response should have "result" key (not "error")
      if echo "$tool_response" | grep -q '"error"'; then
        local err_msg
        err_msg=$(echo "$tool_response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message','unknown'))" 2>/dev/null || echo "parse-failed")
        detail="error: $err_msg"
      elif echo "$tool_response" | grep -q '"result"'; then
        status="pass"
        detail="ok (${elapsed_ms}ms)"
      else
        detail="unexpected response shape"
      fi
    fi
  fi

  # Check for non-timeout process errors (e.g. module not found)
  if [[ "$status" == "fail" && -z "$detail" ]]; then
    if [[ -n "$raw_err" ]]; then
      # First line of stderr usually has the key error
      detail="crash: $(echo "$raw_err" | head -1 | cut -c1-80)"
    else
      detail="unknown failure (exit=$exit_code)"
    fi
  fi

  # Also check stderr for crashes even on "pass" — some servers log warnings
  if [[ "$status" == "fail" && -n "$raw_err" && "$detail" != "crash:"* && "$detail" != "timeout"* ]]; then
    local first_err
    first_err=$(echo "$raw_err" | head -1 | cut -c1-60)
    if [[ -n "$first_err" ]]; then
      detail="$detail | stderr: $first_err"
    fi
  fi

  # Record
  if [[ "$status" == "pass" ]]; then
    PASS=$((PASS + 1))
    printf "  ${GREEN}PASS${RESET}  %-18s  %s\n" "$pkg" "$detail"
  else
    FAIL=$((FAIL + 1))
    printf "  ${RED}FAIL${RESET}  %-18s  %s\n" "$pkg" "$detail"
  fi

  append_json "$pkg" "$status" "$detail" "$tool_name" "$elapsed_ms"
}

###############################################################################
# append_json — add a result entry to the JSON accumulator
###############################################################################
append_json() {
  local pkg="$1" status="$2" detail="$3" tool="$4" ms="$5"

  # Escape double quotes in detail for JSON safety
  detail=$(echo "$detail" | sed 's/"/\\"/g' | tr -d '\n')

  local entry
  entry=$(cat <<JEOF
    {
      "package": "${pkg}",
      "status": "${status}",
      "tool": "${tool}",
      "detail": "${detail}",
      "elapsed_ms": ${ms:-0}
    }
JEOF
)

  if [[ -n "$JSON_ENTRIES" ]]; then
    JSON_ENTRIES="${JSON_ENTRIES},
${entry}"
  else
    JSON_ENTRIES="$entry"
  fi
}

###############################################################################
# Main
###############################################################################
echo ""
printf "${BOLD}MCP Server Test Harness${RESET}\n"
printf "Testing 12 toolkit MCP servers via JSON-RPC stdio\n"
printf "Timeout: ${TIMEOUT}s per server\n"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── probe ─────────────────────────────────────────────────────
test_mcp_server "probe" \
  "../packages/probe/dist/mcp/index.js" \
  "probe_scan" \
  '{"scope":"quick","path":"./fixtures/mock-project"}'

# ── ai-stack ──────────────────────────────────────────────────
test_mcp_server "ai-stack" \
  "../packages/ai-stack/dist/mcp/index.js" \
  "ai_stack_generate" \
  '{"path":"./fixtures/mock-project","format":"json"}'

# ── mcp-audit ─────────────────────────────────────────────────
test_mcp_server "mcp-audit" \
  "../packages/mcp-audit/dist/mcp/index.js" \
  "mcp_audit_scan" \
  '{"configPath":"./fixtures/mcp-configs/claude_desktop_config.json"}'

# ── mcp-doctor ────────────────────────────────────────────────
test_mcp_server "mcp-doctor" \
  "../packages/mcp-doctor/dist/mcp/index.js" \
  "mcp_doctor_checkup" \
  '{"configPath":"./fixtures/mcp-configs/claude_desktop_config.json"}'

# ── cost ──────────────────────────────────────────────────────
test_mcp_server "cost" \
  "../packages/cost/dist/mcp/index.js" \
  "cost_report" \
  '{"period":"last-30d"}'

# ── eval ──────────────────────────────────────────────────────
test_mcp_server "eval" \
  "../packages/eval/dist/mcp/index.js" \
  "eval_score" \
  '{"output":"The quarterly revenue grew 15% YoY.","rubric":"summary"}'

# ── context-sync ──────────────────────────────────────────────
test_mcp_server "context-sync" \
  "../packages/context-sync/dist/mcp/index.js" \
  "context_sync_read" \
  '{}'

# ── model-match ───────────────────────────────────────────────
test_mcp_server "model-match" \
  "../packages/model-match/dist/mcp/index.js" \
  "model_match_compare" \
  '{"task":"code review"}'

# ── prompt-craft ──────────────────────────────────────────────
test_mcp_server "prompt-craft" \
  "../packages/prompt-craft/dist/mcp/index.js" \
  "prompt_craft_score" \
  '{"prompt":"Write a function that sorts an array"}'

# ── prompt-score ──────────────────────────────────────────────
test_mcp_server "prompt-score" \
  "../packages/prompt-score/dist/mcp/index.js" \
  "prompt_score_analyze" \
  '{"prompt":"Write a function that sorts an array"}'

# ── sub-audit ─────────────────────────────────────────────────
test_mcp_server "sub-audit" \
  "../packages/sub-audit/dist/mcp/index.js" \
  "sub_audit_run" \
  '{}'

# ── trace ─────────────────────────────────────────────────────
test_mcp_server "trace" \
  "../packages/trace/dist/mcp/index.js" \
  "trace_list" \
  '{}'

###############################################################################
# Summary table
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
printf "${BOLD}Summary${RESET}\n"
printf "  ${GREEN}Pass:${RESET}  %d\n" "$PASS"
printf "  ${RED}Fail:${RESET}  %d\n" "$FAIL"
if [[ $SKIP -gt 0 ]]; then
  printf "  ${YELLOW}Skip:${RESET}  %d\n" "$SKIP"
fi
printf "  Total: %d\n" "$TOTAL"
echo ""

###############################################################################
# Write JSON summary
###############################################################################
cat > "$RESULTS_FILE" <<JSONEOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "total": ${TOTAL},
    "pass": ${PASS},
    "fail": ${FAIL},
    "skip": ${SKIP}
  },
  "results": [
${JSON_ENTRIES}
  ]
}
JSONEOF

printf "Results saved to ${CYAN}%s${RESET}\n" "$RESULTS_FILE"
echo ""

# Exit with failure if any tests failed
if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
