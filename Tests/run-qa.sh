#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  Torgor & Tweed — QA Test Runner
#  Usage:
#    bash tests/run-qa.sh                    # run all tests vs localhost:3000
#    BASE_URL=https://torgorandtweed.com bash tests/run-qa.sh   # vs production
#    bash tests/run-qa.sh --spec TC-035      # run specific test file
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
SPEC="${1:-}"
REPORT_DIR="tests/reports"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log()  { echo -e "${GREEN}[QA]${NC} $1"; }
warn() { echo -e "${YELLOW}[QA]${NC} $1"; }

log "=== Torgor & Tweed QA Run ==="
log "Target: $BASE_URL"
log "Date:   $(date)"
echo ""

# Install deps if needed
if [[ ! -d "node_modules/@playwright" ]]; then
  log "Installing Playwright..."
  npm install -D @playwright/test
  npx playwright install --with-deps chromium firefox
fi

mkdir -p "$REPORT_DIR"

# Build Playwright command
CMD="npx playwright test"
CMD="$CMD --config=tests/playwright.config.ts"
CMD="$CMD --reporter=html,json"

if [[ -n "$SPEC" ]]; then
  CMD="$CMD --grep $SPEC"
  warn "Running tests matching: $SPEC"
fi

# Run
export BASE_URL
eval "$CMD" | tee "$REPORT_DIR/run-$(date +%Y%m%d-%H%M%S).log" || true

log ""
log "=== QA Run Complete ==="
log "HTML Report: $REPORT_DIR/html/index.html"
log "JSON Report: $REPORT_DIR/results.json"

# Parse pass/fail from JSON
if [[ -f "$REPORT_DIR/results.json" ]]; then
  node -e "
    const r = require('./$REPORT_DIR/results.json');
    const pass  = r.suites.flatMap(s=>s.specs).filter(s=>s.ok).length;
    const fail  = r.suites.flatMap(s=>s.specs).filter(s=>!s.ok).length;
    const total = pass + fail;
    console.log(\`\nResults: \${pass}/\${total} passed | \${fail} failed\`);
    process.exit(fail > 0 ? 1 : 0);
  " 2>/dev/null || true
fi
