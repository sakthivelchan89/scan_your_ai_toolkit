#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
# Maiife Toolkit — Smoke Test Runner
# Runs each package CLI against fixture data and reports results.
# ──────────────────────────────────────────────────────────────

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLKIT_DIR="$(cd "$HARNESS_DIR/.." && pwd)"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
RESULTS_DIR="$HARNESS_DIR/results/$(date -u +%Y%m%d-%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Accumulators
declare -a PKG_NAMES=()
declare -a PKG_CMDS=()
declare -a PKG_STATUSES=()
declare -a PKG_DURATIONS=()
declare -a PKG_SIZES=()

TOTAL=0
PASSED=0
FAILED=0

# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

human_size() {
  local bytes=$1
  if (( bytes == 0 )); then
    echo "0 bytes"
  elif (( bytes < 1024 )); then
    echo "${bytes} bytes"
  else
    awk "BEGIN { printf \"%.1f KB\", $bytes / 1024 }"
  fi
}

# Run a single test, capture output + exit code + duration
# Usage: run_test <name> <command> <outfile>
run_test() {
  local name="$1"
  local cmd="$2"
  local sub_cmd="$3"
  local outfile="$RESULTS_DIR/${name}.out"

  TOTAL=$((TOTAL + 1))
  printf "  ${CYAN}%-22s${RESET} %-12s ... " "$name" "$sub_cmd"

  local start_ns
  start_ns=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")

  # Run the command, capture stdout+stderr, allow failure
  local exit_code=0
  eval "$cmd" > "$outfile" 2>&1 || exit_code=$?

  local end_ns
  end_ns=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")

  local duration_ms=$(( (end_ns - start_ns) / 1000000 ))
  local duration_s
  duration_s=$(awk "BEGIN { printf \"%.1f\", $duration_ms / 1000 }")

  local size_bytes
  size_bytes=$(wc -c < "$outfile" | tr -d ' ')

  local status
  local status_color

  if (( exit_code == 0 )); then
    if (( size_bytes == 0 )); then
      status="EMPTY"
      status_color="$YELLOW"
    else
      status="PASS"
      status_color="$GREEN"
      PASSED=$((PASSED + 1))
    fi
  else
    status="FAIL"
    status_color="$RED"
    FAILED=$((FAILED + 1))
  fi

  # Count EMPTY as pass for the total (it ran, just no data)
  if [[ "$status" == "EMPTY" ]]; then
    PASSED=$((PASSED + 1))
  fi

  printf "${status_color}%-6s${RESET} %6ss  %s\n" "$status" "$duration_s" "$(human_size "$size_bytes")"

  # Store results
  PKG_NAMES+=("$name")
  PKG_CMDS+=("$sub_cmd")
  PKG_STATUSES+=("$status")
  PKG_DURATIONS+=("$duration_ms")
  PKG_SIZES+=("$size_bytes")
}

# ──────────────────────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────────────────────

mkdir -p "$RESULTS_DIR"

echo ""
echo -e "${BOLD}Maiife Toolkit — Smoke Test Runner${RESET}"
echo "  Timestamp : $TIMESTAMP"
echo "  Results   : $RESULTS_DIR"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 1: Build all packages
# ──────────────────────────────────────────────────────────────

echo -e "${BOLD}[1/3] Building all packages...${RESET}"
BUILD_LOG="$RESULTS_DIR/build.out"
BUILD_START=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")

if (cd "$TOOLKIT_DIR" && pnpm build) > "$BUILD_LOG" 2>&1; then
  BUILD_END=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")
  BUILD_MS=$(( (BUILD_END - BUILD_START) / 1000000 ))
  BUILD_S=$(awk "BEGIN { printf \"%.1f\", $BUILD_MS / 1000 }")
  echo -e "  ${GREEN}Build succeeded${RESET} (${BUILD_S}s)"
else
  BUILD_END=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")
  BUILD_MS=$(( (BUILD_END - BUILD_START) / 1000000 ))
  BUILD_S=$(awk "BEGIN { printf \"%.1f\", $BUILD_MS / 1000 }")
  echo -e "  ${RED}Build FAILED${RESET} (${BUILD_S}s) — see $BUILD_LOG"
  echo -e "  ${RED}Aborting tests.${RESET}"
  exit 1
fi

echo ""

# ──────────────────────────────────────────────────────────────
# Step 2: Run tests
# ──────────────────────────────────────────────────────────────

echo -e "${BOLD}[2/3] Running smoke tests...${RESET}"
echo ""

FIX="$HARNESS_DIR/fixtures"
PKG="$TOOLKIT_DIR/packages"

# --- Group 1: Filesystem scanners ---
echo -e "  ${BOLD}Group 1: Filesystem scanners${RESET}"

run_test "probe" \
  "node '$PKG/probe/dist/cli/index.js' scan --path '$FIX/mock-project' --format json" \
  "scan"

run_test "ai-stack" \
  "node '$PKG/ai-stack/dist/cli/index.js' --path '$FIX/mock-project' --format json" \
  "profile"

run_test "mcp-audit" \
  "node '$PKG/mcp-audit/dist/cli/index.js' scan --config '$FIX/mcp-configs/claude_desktop_config.json' --format json" \
  "scan"

run_test "mcp-doctor" \
  "node '$PKG/mcp-doctor/dist/cli/index.js' check --config '$FIX/mcp-configs/claude_desktop_config.json' --format json" \
  "check"

echo ""

# --- Group 2: Prompt/eval processors ---
echo -e "  ${BOLD}Group 2: Prompt/eval processors${RESET}"

run_test "prompt-score" \
  "node '$PKG/prompt-score/dist/cli/index.js' analyze --input '$FIX/prompts/good-prompt.txt' --format json" \
  "analyze"

run_test "prompt-craft" \
  "node '$PKG/prompt-craft/dist/cli/index.js' score --input '$FIX/prompts/good-prompt.txt'" \
  "score"

run_test "eval-score" \
  "cat '$FIX/prompts/batch-eval.jsonl' | head -1 | node '$PKG/eval/dist/cli/index.js' score --rubric summary --format json" \
  "score"

run_test "eval-batch" \
  "node '$PKG/eval/dist/cli/index.js' batch --input '$FIX/prompts/batch-eval.jsonl' --rubric summary" \
  "batch"

echo ""

# --- Group 3: Comparison/recommendation ---
echo -e "  ${BOLD}Group 3: Comparison/recommendation${RESET}"

run_test "model-match-cmp" \
  "node '$PKG/model-match/dist/cli/index.js' compare --task coding" \
  "compare"

run_test "model-match-rec" \
  "node '$PKG/model-match/dist/cli/index.js' recommend --task coding" \
  "recommend"

echo ""

# --- Group 4: Data store tools ---
echo -e "  ${BOLD}Group 4: Data store tools${RESET}"

run_test "ai-journal" \
  "node '$PKG/ai-journal/dist/cli/index.js' digest --format json" \
  "digest"

run_test "context-sync" \
  "node '$PKG/context-sync/dist/cli/index.js' list --format json" \
  "list"

run_test "sub-audit" \
  "node '$PKG/sub-audit/dist/cli/index.js' --format json" \
  "scan"

run_test "trace" \
  "node '$PKG/trace/dist/cli/index.js' list" \
  "list"

run_test "cost" \
  "node '$PKG/cost/dist/cli/index.js' report --format json" \
  "report"

run_test "weekly-ai-report" \
  "node '$PKG/weekly-ai-report/dist/cli/index.js' generate --format json" \
  "generate"

echo ""

# ──────────────────────────────────────────────────────────────
# Step 3: Summary
# ──────────────────────────────────────────────────────────────

echo -e "${BOLD}[3/3] Results summary${RESET}"
echo ""

# Table header
printf "╔═══════════════════════╦════════╦══════════╦═════════════════╗\n"
printf "║ %-21s ║ %-6s ║ %-8s ║ %-15s ║\n" "Package" "Status" "Duration" "Output Size"
printf "╠═══════════════════════╬════════╬══════════╬═════════════════╣\n"

for i in "${!PKG_NAMES[@]}"; do
  local_name="${PKG_NAMES[$i]}"
  local_status="${PKG_STATUSES[$i]}"
  local_dur_ms="${PKG_DURATIONS[$i]}"
  local_size="${PKG_SIZES[$i]}"
  local_dur_s=$(awk "BEGIN { printf \"%.1fs\", $local_dur_ms / 1000 }")
  local_size_h=$(human_size "$local_size")

  # Color the status
  case "$local_status" in
    PASS)  local_color="$GREEN" ;;
    FAIL)  local_color="$RED" ;;
    EMPTY) local_color="$YELLOW" ;;
    *)     local_color="$RESET" ;;
  esac

  printf "║ %-21s ║ ${local_color}%-6s${RESET} ║ %8s ║ %-15s ║\n" \
    "$local_name" "$local_status" "$local_dur_s" "$local_size_h"
done

printf "╚═══════════════════════╩════════╩══════════╩═════════════════╝\n"

echo ""
echo -e "  Total: ${BOLD}$TOTAL${RESET}  Passed: ${GREEN}$PASSED${RESET}  Failed: ${RED}$FAILED${RESET}"
echo ""

# ──────────────────────────────────────────────────────────────
# Generate summary.json
# ──────────────────────────────────────────────────────────────

SUMMARY_FILE="$RESULTS_DIR/summary.json"

{
  echo '{'
  echo "  \"timestamp\": \"$TIMESTAMP\","
  echo "  \"totalTests\": $TOTAL,"
  echo "  \"passed\": $PASSED,"
  echo "  \"failed\": $FAILED,"
  echo '  "results": ['

  for i in "${!PKG_NAMES[@]}"; do
    local_name="${PKG_NAMES[$i]}"
    local_cmd="${PKG_CMDS[$i]}"
    local_status="${PKG_STATUSES[$i]}"
    local_dur_ms="${PKG_DURATIONS[$i]}"
    local_size="${PKG_SIZES[$i]}"

    # Lowercase status for JSON
    local_status_lc=$(echo "$local_status" | tr '[:upper:]' '[:lower:]')

    comma=","
    if (( i == ${#PKG_NAMES[@]} - 1 )); then
      comma=""
    fi

    echo "    {\"package\": \"$local_name\", \"command\": \"$local_cmd\", \"status\": \"$local_status_lc\", \"durationMs\": $local_dur_ms, \"outputBytes\": $local_size}$comma"
  done

  echo '  ]'
  echo '}'
} > "$SUMMARY_FILE"

echo -e "  Summary written to: ${CYAN}$SUMMARY_FILE${RESET}"
echo -e "  Output logs in:     ${CYAN}$RESULTS_DIR/${RESET}"
echo ""

# Exit with failure if any tests failed
if (( FAILED > 0 )); then
  exit 1
fi
