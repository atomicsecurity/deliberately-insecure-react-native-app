#!/usr/bin/env bash
# verify-vulns.sh — the "vulns are actually present" gate.
#
# A refactor must never silently REMOVE a planted vulnerability, so CI runs this
# before every build. It asserts:
#   (1) >=18 distinct `DIRNA-VULN:<slug>` markers exist across src/ + android/;
#   (2) every lab listed in src/labs/registry.ts has BOTH a marker AND a
#       docs/vulns/<slug>.md writeup.
# Prints "OK: ..." and exits 0 on success; a clear "FAIL: ..." + non-zero otherwise.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

# (1) Distinct DIRNA-VULN markers across the JS source and the Android shell.
SLUGS=$(grep -rhoE 'DIRNA-VULN:[a-z0-9_]+' src android | sed 's/.*://' | sort -u)
COUNT=$(printf '%s\n' "$SLUGS" | grep -c . || true)
echo "markers found: $COUNT"
printf '%s\n' "$SLUGS" | sed 's/^/  - /'
[ "$COUNT" -ge 18 ] || fail "expected >=18 distinct DIRNA-VULN markers, found $COUNT"

# (2) Every registry slug must have a marker + a doc.
# registry.ts writes entries as `slug:'m1_hardcoded_secret'`; tolerate optional
# whitespace after the colon in case the file is reformatted.
REG=src/labs/registry.ts
[ -f "$REG" ] || fail "missing $REG"
REG_SLUGS=$(grep -oE "slug:[[:space:]]*'[a-z0-9_]+'" "$REG" | grep -oE "'[a-z0-9_]+'" | tr -d "'" | sort -u)
[ -n "$REG_SLUGS" ] || fail "parsed 0 slugs from $REG — has the registry format changed? (expected slug:'<slug>')"
REG_COUNT=$(printf '%s\n' "$REG_SLUGS" | grep -c .)
echo "registry slugs: $REG_COUNT"

for s in $REG_SLUGS; do
  printf '%s\n' "$SLUGS" | grep -qxF "$s" || fail "no DIRNA-VULN:$s marker for registry lab '$s'"
  [ -f "docs/vulns/$s.md" ] || fail "missing docs/vulns/$s.md for registry lab '$s'"
done

echo "OK: $COUNT markers (>=18); all $REG_COUNT registry labs have a marker + a doc"
