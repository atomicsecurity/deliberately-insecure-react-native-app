#!/usr/bin/env bash
# scan-apk.sh — scan the built DIRNA release APK with a mobile SAST of your choice.
#
# ─────────────────────────────────────────────────────────────────────────────
# DIRNA is tool-agnostic: any mobile SAST or dynamic workflow works. This helper
# gives you two easy paths:
#
#   1. MobSF (default) — a popular open-source mobile SAST. This script starts a
#      MobSF container; you then upload the release APK through its web UI.
#
#   2. A containerized scanner of your own — set SCANNER_IMAGE and this script
#      runs it in a hardened `docker run` with the APK bind-mounted read-only at
#      /in/app.apk. Interpret the output per your scanner's docs.
#
# The per-lab ground truth (OWASP · MASVS/MASTG · which class of analysis finds
# each lab) lives in docs/detection.md — compare whatever your tool reports to it.
# ─────────────────────────────────────────────────────────────────────────────
#
# Usage:
#   ./scripts/scan-apk.sh [APK_PATH]                 # start MobSF, then upload the APK
#   SCANNER_IMAGE=<image> ./scripts/scan-apk.sh [APK_PATH]   # run your own scanner image
#
# Env knobs (all optional):
#   SCANNER_IMAGE   containerized scanner image to run against the APK
#                   (unset → launch MobSF and print upload instructions)
#   SCAN_MEMORY     container memory limit   (default: 8g)
#   SCAN_TMPFS      /tmp tmpfs size          (default: 2g)
#   SCAN_CPUS       CPU quota                (default: 1.0)
#   SCAN_ID         scan id label            (default: dirna)
set -euo pipefail

# --- resolve the APK ---------------------------------------------------------
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK_PATH="${1:-$REPO_ROOT/android/app/build/outputs/apk/release/app-release.apk}"
APK_PATH="$(cd "$(dirname "$APK_PATH")" 2>/dev/null && pwd)/$(basename "$APK_PATH")" || true
if [ ! -f "$APK_PATH" ]; then
  echo "FAIL: APK not found at: $APK_PATH" >&2
  echo "      Build it first:  bash scripts/build-release.sh" >&2
  exit 1
fi

SCAN_ID="${SCAN_ID:-dirna}"

# --- default path: MobSF -----------------------------------------------------
if [ -z "${SCANNER_IMAGE:-}" ]; then
  cat >&2 <<EOF
No SCANNER_IMAGE set — starting MobSF (open-source mobile SAST).

  1. This starts MobSF on http://localhost:8000
  2. Open that URL in a browser and upload:
       $APK_PATH
  3. Review the report and compare it to docs/detection.md.

Any other mobile SAST works too — re-run with SCANNER_IMAGE=<image> to drive a
containerized scanner of your own, or run your tool manually against the APK.

Starting MobSF (Ctrl-C to stop)…
EOF
  exec docker run -it --rm -p 8000:8000 \
    opensecurity/mobile-security-framework-mobsf
fi

# --- optional path: a containerized scanner image ----------------------------
SCAN_MEMORY="${SCAN_MEMORY:-8g}"
SCAN_TMPFS="${SCAN_TMPFS:-2g}"
SCAN_CPUS="${SCAN_CPUS:-1.0}"

echo "scan-apk: image=$SCANNER_IMAGE  apk=$APK_PATH  scan_id=$SCAN_ID" >&2

# Hardened `docker run`: the APK is untrusted input, so scan it with no network,
# a read-only root FS, dropped capabilities, an unprivileged user, and resource
# caps. Adjust to your scanner's needs; keep these boundaries where you can.
DOCKER_ARGS=(
  run --rm
  "--name=dirna-scan-${SCAN_ID}"
  --network none
  --read-only
  --cap-drop ALL
  --security-opt no-new-privileges
  --user 65534:65534
  "--memory=${SCAN_MEMORY}"
  "--cpus=${SCAN_CPUS}"
  --pids-limit=256
  "--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=${SCAN_TMPFS}"
  -v "${APK_PATH}:/in/app.apk:ro"
  -e "SCAN_ID=${SCAN_ID}"
  "${SCANNER_IMAGE}"
)

exec docker "${DOCKER_ARGS[@]}"
