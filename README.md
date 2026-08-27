# DIRNA — Deliberately Insecure React Native

DIRNA is an intentionally-vulnerable **React Native (TypeScript, Hermes) Android**
app: a menu-of-labs catalog of ~18 OWASP-Mobile-Top-10-mapped weaknesses, each
isolated in its own `src/labs/<slug>/` folder and marked with a
`// DIRNA-VULN:<slug>` comment so it is greppable and unmistakably intentional. It
exists to teach mobile-security concepts and to benchmark scanners (static and
dynamic) against a known ground truth.

## ⚠️ Educational use only
DIRNA is DELIBERATELY INSECURE. It exists to teach and to benchmark mobile-security
tools. Do **not** publish it to any app store, do **not** reuse its code, and do
**not** run it against real accounts, endpoints, or networks. All secrets, hosts,
and the signing key are obvious throwaways. Run only on a device/emulator you own.
See [`DISCLAIMER.md`](DISCLAIMER.md).

## Labs

18 labs across the OWASP Mobile Top 10 (2024). The **Detection** column names the
class of analysis that surfaces each lab — **static** (a manifest/bytecode/bundle
scan can find it) or **needs-dataflow** (surrounding posture is statically flaggable, but
the labelled weakness needs dataflow/taint or a manual read). See
[`docs/detection.md`](docs/detection.md) for the full OWASP · MASVS/MASTG map.

| # | Lab | OWASP | Detection |
|---|---|---|---|
| 1 | [Hardcoded secret in the bundle](docs/vulns/m1_hardcoded_secret.md) | M1 | static |
| 2 | [Auth token in plaintext AsyncStorage](docs/vulns/m1_asyncstorage_token.md) | M1/M9 | static |
| 3 | [Client-side hardcoded credential check](docs/vulns/m1_client_cred_check.md) | M1/M3 | needs-dataflow |
| 4 | [Vulnerable npm dependency (lodash 4.17.11)](docs/vulns/m2_vuln_npm_dep.md) | M2 | static (SCA) |
| 5 | [Client-side JWT role trust](docs/vulns/m3_client_jwt_trust.md) | M3 | needs-dataflow |
| 6 | [Insecure deep-link handler](docs/vulns/m4_deeplink_sink.md) | M4 | needs-dataflow |
| 7 | [WebView injectedJavaScript + file access](docs/vulns/m4_webview_injection.md) | M4 | needs-dataflow |
| 8 | [Insecure native module (exec / readFile)](docs/vulns/m4_insecure_native_module.md) | M4/M8 | static |
| 9 | [Cleartext HTTP endpoint](docs/vulns/m5_cleartext_http.md) | M5 | static |
| 10 | [Secret exfil to cleartext](docs/vulns/m5_secret_exfil.md) | M5 | needs-dataflow |
| 11 | [Trust-all TLS / no certificate pinning](docs/vulns/m5_trust_all_tls.md) | M5 | static |
| 12 | [Secret logged](docs/vulns/m6_pii_logged.md) | M6 | needs-dataflow |
| 13 | [Secret to clipboard](docs/vulns/m6_secret_clipboard.md) | M6 | needs-dataflow |
| 14 | [Source map shipped in the release build](docs/vulns/m7_sourcemap_shipped.md) | M7 | static |
| 15 | [Debuggable + no root detection + no obfuscation](docs/vulns/m7_no_hardening.md) | M7 | static |
| 16 | [Exported component + insecure deep-link intent-filter](docs/vulns/m8_exported_deeplink.md) | M8 | static |
| 17 | [allowBackup=true + cleartext-permitted NSC](docs/vulns/m8_backup_cleartext.md) | M8 | static |
| 18 | [Weak JS crypto](docs/vulns/m10_weak_crypto.md) | M10 | needs-dataflow |

See [`docs/detection.md`](docs/detection.md) for the per-lab OWASP · MASVS/MASTG
mapping and notes on what class of analysis finds each lab.

## Quick start

```bash
# 1. One-time: install JDK 17 + Android SDK (idempotent), then load the env
bash scripts/setup-android-sdk.sh
source ~/.dirna-env

# 2. Build the debug APK
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Or grab the prebuilt **release APK** from the GitHub Releases page once published.

## Building

```bash
# 1. One-time: install JDK 17 + Android SDK (idempotent)
bash scripts/setup-android-sdk.sh

# 2. Build the signed release APK
bash scripts/build-release.sh
# → android/app/build/outputs/apk/release/app-release.apk
```

`scripts/build-release.sh` lands in a later phase; until then build the release
APK directly:

```bash
source ~/.dirna-env
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

The release APK is signed with the checked-in **education keystore** (see below),
so the build is reproducible by anyone.

## Using with a scanner

DIRNA is tool-agnostic. Scan the release APK with any mobile SAST (e.g.
[MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF)), or install it on
a device/emulator you own for dynamic analysis, then compare what your tool reports
to DIRNA's known ground truth in [`docs/detection.md`](docs/detection.md) — the
OWASP/MASVS map and the class of analysis (static / dynamic / manual / needs-dataflow) that
finds each lab.

The helper script starts MobSF by default, or runs a containerized scanner image of
your own:

```bash
# default: start MobSF, then upload the release APK through its web UI
./scripts/scan-apk.sh

# or drive your own containerized scanner (APK bind-mounted read-only)
SCANNER_IMAGE=<your-scanner-image> ./scripts/scan-apk.sh
```

You can also sideload the APK with `adb install app-release.apk` and exercise the
labs on an emulator you own.

## Signing key

The app is signed with `android/app/dirna-education.keystore` — an **intentionally
published / compromised** throwaway education key (store & key password
`dirnadirna`, alias `dirna`). It is checked into this repo on purpose so the release
build is reproducible. **Never use this key for a real app.**
