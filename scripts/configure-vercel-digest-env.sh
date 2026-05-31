#!/usr/bin/env bash
# Requires: vercel login, access to api.vercel.com
# Usage:
#   cp scripts/env.digest.example scripts/.env.digest.local
#   # edit .env.digest.local
#   bash scripts/configure-vercel-digest-env.sh
#
# Optional env:
#   VERCEL_SCOPE     default aldohemsncoms-projects
#   DIGEST_ENV_FILE  override env file path

set -euo pipefail

VERCEL="${VERCEL:-vercel}"
SCOPE="${VERCEL_SCOPE:-aldohemsncoms-projects}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${DIGEST_ENV_FILE:-$ROOT/scripts/.env.digest.local}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  echo "Run: cp \"$ROOT/scripts/env.digest.example\" \"$ENV_FILE\" and fill in values." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

need() {
  local n="$1"
  if [[ -z "${!n:-}" ]]; then
    echo "Missing $n (set in $ENV_FILE)" >&2
    exit 1
  fi
}

need DIGEST_SMTP_USER
need DIGEST_SMTP_PASS
need DIGEST_TO_EMAIL

if [[ -z "${CRON_SECRET:-}" ]]; then
  CRON_SECRET="$(openssl rand -hex 24)"
  echo ">>> Generated CRON_SECRET (saved to Vercel; store in your password manager): $CRON_SECRET"
fi

upsert() {
  local name="$1"
  local value="$2"
  $VERCEL env remove "$name" production -y --scope "$SCOPE" 2>/dev/null || true
  $VERCEL env add "$name" production --scope "$SCOPE" --yes --sensitive --value "$value"
}

echo ">>> Writing Vercel Production env (scope=$SCOPE)…"
upsert CRON_SECRET "$CRON_SECRET"
upsert DIGEST_SMTP_USER "$DIGEST_SMTP_USER"
upsert DIGEST_SMTP_PASS "$DIGEST_SMTP_PASS"
upsert DIGEST_TO_EMAIL "$DIGEST_TO_EMAIL"

if [[ -n "${DIGEST_FROM_EMAIL:-}" ]]; then
  upsert DIGEST_FROM_EMAIL "$DIGEST_FROM_EMAIL"
else
  $VERCEL env remove DIGEST_FROM_EMAIL production -y --scope "$SCOPE" 2>/dev/null || true
fi

for opt in DIGEST_SMTP_HOST DIGEST_SMTP_PORT DIGEST_SMTP_SECURE DIGEST_SMTP_MULTIPART_ALTERNATIVE; do
  if [[ -n "${!opt:-}" ]]; then
    upsert "$opt" "${!opt}"
  else
    $VERCEL env remove "$opt" production -y --scope "$SCOPE" 2>/dev/null || true
  fi
done

echo ">>> Deploying Production …"
cd "$ROOT"
$VERCEL deploy --prod --yes --scope "$SCOPE"

PROD_URL="${DIGEST_TEST_URL:-https://official-english-digest.vercel.app}"

echo ">>> Triggering digest (email to $DIGEST_TO_EMAIL)…"
curl -sS --max-time 600 -H "Authorization: Bearer ${CRON_SECRET}" "${PROD_URL}/api/cron/daily-digest"
echo ""
echo ">>> Done. Check inbox (and spam). On failure: Vercel → official-english-digest → Logs."
