#!/usr/bin/env bash
# Build the DIRNA release APK (signed with the education keystore) and assert the
# intentionally-shipped Hermes bundle + source map are inside it.
set -euo pipefail
source ~/.dirna-env
cd "$(dirname "$0")/../android"
./gradlew assembleRelease
APK=app/build/outputs/apk/release/app-release.apk
unzip -l "$APK" | grep -E 'assets/index\.android\.bundle(\.map)?' \
  || { echo "FAIL: release bundle/source-map missing from APK"; exit 1; }
echo "OK release APK: $(readlink -f "$APK")"
