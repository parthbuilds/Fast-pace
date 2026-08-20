#!/usr/bin/env bash
# ============================================================
#  Fast Pace — One-Command Stack Launcher
#  Usage: ./start.sh [--skip-install] [--skip-seed] [--prod]
# ============================================================
set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${CYAN}${BOLD}[fast-pace]${NC} $*"; }
ok()   { echo -e "${GREEN}✔${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; }
err()  { echo -e "${RED}✘${NC}  $*" >&2; exit 1; }

# ── Flags ──────────────────────────────────────────────────
SKIP_INSTALL=false
SKIP_SEED=false
PROD=false

for arg in "$@"; do
  case $arg in
    --skip-install) SKIP_INSTALL=true ;;
    --skip-seed)    SKIP_SEED=true    ;;
    --prod)         PROD=true         ;;
    *) warn "Unknown flag: $arg" ;;
  esac
done

# ── Working directory ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  🚀  Fast Pace — Starting the Stack       ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Node version check ─────────────────────────────
log "Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
if [ "$NODE_VERSION" -lt 18 ]; then
  err "Node.js 18+ is required (found v${NODE_VERSION}). Install from https://nodejs.org"
fi
ok "Node.js $(node -v)"

# ── Step 2: Yarn check ────────────────────────────────────
log "Checking Yarn..."
if ! command -v yarn &>/dev/null; then
  warn "Yarn not found — installing globally via npm..."
  npm install -g yarn
fi
ok "Yarn $(yarn -v)"

# ── Step 3: .env check ────────────────────────────────────
log "Checking .env file..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    ok "Created .env from .env.example"
  else
    err ".env file missing and no .env.example found. Please create .env manually."
  fi
else
  ok ".env file present"
fi

# ── Step 4: Install dependencies ──────────────────────────
if [ "$SKIP_INSTALL" = false ]; then
  log "Installing dependencies (yarn install)..."
  yarn install --frozen-lockfile
  ok "Dependencies installed"
else
  warn "Skipping dependency install (--skip-install)"
fi

# ── Step 5: Prisma — DB push ──────────────────────────────
log "Pushing Prisma schema to SQLite database (prisma/dev.db)..."
npx prisma db push --skip-generate
ok "Database schema synced"

# ── Step 6: Prisma — generate client ──────────────────────
log "Generating Prisma client..."
npx prisma generate
ok "Prisma client generated"

# ── Step 7: Seed database ────────────────────────────────
if [ "$SKIP_SEED" = false ]; then
  DB_PATH="prisma/dev.db"
  BUSINESS_COUNT=0
  if command -v sqlite3 &>/dev/null; then
    BUSINESS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM Business;" 2>/dev/null || echo "0")
  fi
  if [ "$BUSINESS_COUNT" -gt 0 ]; then
    warn "Database already has ${BUSINESS_COUNT} businesses — skipping seed"
    warn "Delete prisma/dev.db and re-run to get fresh demo data"
  else
    log "Seeding demo data (Bangalore/HSR Layout prospects)..."
    yarn seed
    ok "Demo data seeded"
  fi
else
  warn "Skipping seed (--skip-seed)"
fi

# ── Step 8: Start server ──────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
if [ "$PROD" = true ]; then
  echo -e "${BOLD}║  🏗️   Building production bundle…         ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
  echo ""
  log "Building for production..."
  yarn build
  ok "Production build complete"
  echo ""
  log "Starting production server on http://localhost:3000"
  exec yarn start
else
  echo -e "${BOLD}║  🌐  App → http://localhost:3000           ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
  echo ""
  log "Starting Next.js development server..."
  exec yarn dev
fi
