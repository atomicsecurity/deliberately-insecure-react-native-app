# Deliberately Insecure React Native (DIRNA) — Design

**Status:** approved design, pending implementation plan
**Date:** 2026-08-26
**License:** MIT · **Audience:** mobile app-sec learners, researchers, tool authors

---

## 1. What this is

**DIRNA** is a purpose-built, intentionally-**insecure** React Native (TypeScript,
Hermes) **Android** application — the RN-shaped gap in the "vulnerable app"
ecosystem. The well-known deliberately-insecure apps (DIVA, OVAA, InsecureBankv2,
InsecureShop, Vuldroid) are all **native** Android; RN teams are pointed at OWASP
MASVS / Mobile Top 10 but have no hands-on **React Native** target to practice on.
DIRNA fills that gap.

It is a genuine standalone OWASP-MAS-aligned educational tool for the community,
organized so each planted vulnerability is **tagged with the class of analysis that
detects it** (static SAST / dynamic / manual) — making DIRNA double as a **benchmark /
regression corpus** for mobile-security tooling: any mobile SAST (such as MobSF) or
MASVS-based assessment can be run against it and compared to a known ground truth.

> ⚠️ **Educational use only.** DIRNA is deliberately insecure. Do not ship it, do
> not reuse its code, do not run it against real accounts/services. See
> `DISCLAIMER.md`.

## 2. Shape & positioning (decided)

| Decision | Choice |
|---|---|
| Positioning | Community education tool **+** a benchmark for mobile-security tools |
| Platform | **Android-only** (the JS/RN code is cross-platform; we ship/document only the Android APK) |
| Toolchain | **Bare React Native (CLI) + Hermes + TypeScript** (full control over native modules; reproducible local + CI APK builds; Hermes bytecode is what RN scanners analyze) |
| Backend | **Self-contained** — no server; cleartext/exfil targets are placeholder hosts; every vuln is reproducible offline / statically |
| App architecture | **Menu-of-labs catalog** with a light fake-app veneer — a home screen lists ~18 labs, each an **isolated** screen for **one** vuln (individually greppable + toggleable); the format DIVA/OVAA use |
| Breadth (v1) | **~18 labs** across OWASP Mobile Top 10 (2024), RN/JS-layer emphasis |
| Name / license | `deliberately-insecure-react-native` (**DIRNA**), **MIT** |
| Dev toolchain | Android SDK + JDK installed **on the dev host** so the APK can be built, run, and scanned locally during development |

## 3. Repository layout

```
deliberately-insecure-react-native/
  App.tsx                          # navigation + the lab catalog home screen
  src/
    labs/<Mxx_slug>/index.tsx      # ONE folder per lab: the screen + its vulnerable code
    labs/registry.ts               # lab metadata (id, title, OWASP, screen) → drives the catalog
    native/                        # a deliberately-insecure custom native module (Kotlin)
    theme/, components/            # minimal shared UI (light "fake app" veneer)
  android/                         # RN Android shell w/ PLANTED manifest/NSC/build misconfigs
  docs/
    DESIGN.md                      # this document
    vulns/<Mxx_slug>.md            # per-lab writeup (what/where/PoC/fix/MASVS/scanner)
    detection.md                   # detection map: lab → OWASP · MASVS/MASTG · analysis class
  .github/workflows/build.yml      # CI: build the release APK, attach to Releases
  scripts/                         # build/verify helpers
  README.md  DISCLAIMER.md  LICENSE
```

**Isolation principle:** each lab is self-contained under `src/labs/<slug>/` — its
vulnerable code lives in one place, greppable and independently removable, so the
app doubles as a clean 1:1 benchmark and contributors can add labs without touching
others. `labs/registry.ts` is the single source of truth that renders the catalog.

## 4. Vulnerability catalog (v1 ≈ 18 labs)

Mapped to **OWASP Mobile Top 10 (2024)**. The **Detection** column names the class
of analysis that surfaces each lab: **static** (a manifest/bytecode/bundle scan can
find it), **dynamic** (needs running/instrumentation), **manual** (needs a human
reviewer), or **needs-dataflow** (surrounding posture is statically flaggable, but the
labelled weakness needs dataflow/taint or manual confirmation). See
[`detection.md`](detection.md) for the full OWASP · MASVS/MASTG · analysis-class map.

| # | Slug | Lab | OWASP | Detection |
|---|---|---|---|---|
| 1 | `m1_hardcoded_secret` | Hardcoded API key/secret in the JS bundle | M1 | static |
| 2 | `m1_asyncstorage_token` | Auth token stored in plaintext AsyncStorage | M1/M9 | static |
| 3 | `m1_client_cred_check` | Client-side hardcoded credential check (`pw === …`) | M1/M3 | needs-dataflow |
| 4 | `m2_vuln_npm_dep` | Vulnerable npm dependency (known-CVE package) | M2 | static (SCA) |
| 5 | `m3_client_jwt_trust` | JWT/role trusted client-side (flag in AsyncStorage) | M3 | needs-dataflow |
| 6 | `m4_deeplink_sink` | Insecure deep-link handler → unvalidated param to a sink | M4 | needs-dataflow |
| 7 | `m4_webview_injection` | WebView `injectedJavaScript`/`postMessage` + `allowFileAccess` | M4 | needs-dataflow |
| 8 | `m4_insecure_native_module` | Custom native module exposes exec/file-read to JS | M4/M8 | static |
| 9 | `m5_cleartext_http` | Cleartext HTTP endpoint (`fetch('http://…')`) | M5 | static |
| 10 | `m5_secret_exfil` | Secret → cleartext exfil (token → `http://analytics…`) | M5 | needs-dataflow |
| 11 | `m5_trust_all_tls` | Trust-all TLS / no certificate pinning | M5 | static |
| 12 | `m6_pii_logged` | PII/secret logged (`console.log(token)`) | M6 | needs-dataflow |
| 13 | `m6_secret_clipboard` | Secret copied to clipboard | M6 | needs-dataflow |
| 14 | `m7_sourcemap_shipped` | Source map shipped in the release build | M7 | static |
| 15 | `m7_no_hardening` | Debuggable + no root detection + no obfuscation | M7 | static |
| 16 | `m8_exported_deeplink` | Exported Android component + insecure deep-link intent-filter | M8 | static |
| 17 | `m8_backup_cleartext` | `allowBackup=true` + cleartext-permitted NSC | M8 | static |
| 18 | `m10_weak_crypto` | Weak JS crypto (AES-ECB, hardcoded key, static IV) + `Math.random` token | M10 | needs-dataflow |

**Class mix is intentional:** ~10 **static** labs (the manifest/bytecode/bundle
weaknesses any competent mobile SAST should catch) and ~8 **needs-dataflow** labs — the
honest hard cases (client-side trust decisions and JS-layer source→sink flows that
need dataflow/taint or a manual read). The needs-dataflow labs are the concrete targets for
improving RN static analysis, recorded in [`detection.md`](detection.md).

### Per-lab content contract

Each lab ships **three** things that stay in sync:

1. **The vulnerable screen** (`src/labs/<slug>/index.tsx`) — a working screen that
   *performs* the insecure behavior when used (so it teaches, and so a dynamic tool
   / manual tester can trigger it). Vulnerable code is annotated with a
   `// DIRNA-VULN: <slug>` comment for grep-ability.
2. **The writeup** (`docs/vulns/<slug>.md`) — Description · Where (`file:line`) ·
   PoC / repro (static + `adb`/manual dynamic where relevant) · Impact ·
   **Remediation with fixed code** · OWASP M-category · MASVS/MASTG refs · a
   **Detection** line naming the class of analysis that finds it.
3. **The mapping row** (`docs/detection.md`) — lab → OWASP · MASVS/MASTG ·
   detection class → notes.

## 5. Documentation model

- **`README.md`** — one-paragraph intro, the disclaimer banner, a screenshot, the
  lab **index table** (mirrors §4), quick start (install the release APK **or**
  build it), and "how to use with a scanner / MobSF / adb / a device".
- **`docs/vulns/*.md`** — the per-lab writeups (contract above). Solutions/fixes are
  included and clearly labelled (DIRNA is a *teaching + benchmark* tool, not a CTF, so
  hiding fixes adds no value).
- **`docs/detection.md`** — the OWASP · MASVS/MASTG · analysis-class mapping; the
  source of truth for each lab's detection class and the notes on RN detection.
- **`DISCLAIMER.md`** — educational-use-only, do-not-ship, safety notes.

## 6. Build, release & CI

- **Local build:** standard `cd android && ./gradlew assembleRelease`, producing a
  Hermes-bytecode `index.android.bundle`. The **source map is intentionally shipped**
  (lab #14) behind a documented build flag. Signed with a **checked-in "education"
  keystore** (obviously not for production, documented as such) so anyone reproduces
  the exact APK byte-for-byte.
- **GitHub Actions (`build.yml`):** sets up JDK 17 + Android SDK + Node, runs
  `tsc` + eslint, builds the release APK, uploads it as a workflow artifact, and
  **attaches it to a GitHub Release** on version tags. This is the canonical,
  Mac-free, reproducible build path.
- **Versioning:** semver git tags; each release ships the APK + the current coverage
  matrix.

## 7. Benchmark integration

`docs/detection.md` is the machine-and-human-readable map from each lab to its OWASP
category, MASVS/MASTG references, and the class of analysis that surfaces it. It is
tool-agnostic: point **any** mobile scanner (a mobile SAST such as MobSF, or a
MASVS-based manual assessment) at the release APK and compare what it reports to this
known ground truth. The **needs-dataflow** labs are the concrete backlog for improving RN
static analysis (npm/OSV supply-chain, WebView-JS injection, JS-crypto misuse, JS
source→sink taint precision). Wiring a specific scanner into a CI regression gate is
left to each tool's maintainers and is out of v1 scope.

## 8. Testing

- **CI gates:** `tsc` typecheck, eslint, and a **successful release-APK build** — a
  broken app teaches nothing, so "it builds and launches" is a hard gate.
- **"Vulns are actually present" smoke check:** a lightweight script asserts the
  built APK contains the shipped source map (lab #14), the Hermes bundle, and the
  planted manifest/NSC misconfigs (labs #16/#17) — so a refactor can't silently
  *remove* a vulnerability.
- **Manual repro:** every lab screen documents how to trigger its behavior on a
  device/emulator (adb commands for the deep-link/exported-component labs).
- **Dev-loop validation:** during development, the built APK is scanned with a
  mobile SAST to confirm each **static** lab is actually surfaced by the shipped
  build (closing the author→build→scan loop locally).

## 9. Scope boundaries

- **v1 IN:** the ~18 Android labs, the catalog app, per-lab docs, the coverage
  matrix, CI build + release.
- **Later (OUT of v1):** iOS, a companion vulnerable backend, the automated
  scanner-regression gate, Frida hook scripts, and a "patched/fixed" branch for
  before/after diffing.

## 10. Ethics & safety

- MIT, but every entry point (README, in-app home banner, `DISCLAIMER.md`) states
  **educational use only** and **do not reuse the code**.
- No real credentials, endpoints, or third-party services — all targets are obvious
  placeholders (`http://dirna.invalid/…`, `AKIA…EXAMPLE`, etc.).
- The signing key is a throwaway "education" keystore, documented as compromised by
  design.
- Package id + app label make its nature obvious (e.g., `com.dirna.vulnerable` /
  "DIRNA — Deliberately Insecure").

## 11. Open naming note

Working name is **DIRNA** (`deliberately-insecure-react-native`). A "Goat"-family name
(`react-native-goat` / "RNGoat", à la WebGoat/AndroGoat/iGoat) is an easy alternative
if preferred before first release; it does not affect the design.
