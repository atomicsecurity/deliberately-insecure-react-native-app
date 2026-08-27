# Detection mapping (OWASP · MASVS/MASTG · analysis class)

A tool-agnostic map from each DIRNA lab to its **OWASP Mobile Top 10 (2024)**
category, its **MASVS/MASTG** references, and the **class of analysis** that
surfaces it. It mirrors [`DESIGN.md`](DESIGN.md) §4 and the `Detection:` line of
each [`docs/vulns/<slug>.md`](vulns/) writeup.

This mapping serves two audiences:

- **Learners** — see *what kind of analysis* finds each weakness (a static
  bundle/manifest scan? a running-device test? a manual code read?), and why some
  RN weaknesses are harder to catch than the equivalent native-Android ones.
- **Tool authors / assessors** — DIRNA is a fixed, buildable app with a known set of
  planted weaknesses, so it doubles as a **benchmark / regression corpus** for any
  mobile-security tool (mobile SAST such as MobSF, a MASVS-based manual assessment,
  or a dynamic/instrumentation workflow). Run your tool against the release APK and
  compare what it reports to this ground truth.

> The **Detection class** column is *not* a scoreboard for any specific tool — it
> describes the kind of analysis a weakness fundamentally requires. Whether a
> given scanner actually finds it depends on that scanner's capabilities.

## Detection classes

- **static** — a static scan (manifest/resource parse, bytecode/DEX analysis, or
  JS-bundle string/AST inspection) can surface the weakness without running the app.
- **dynamic** — best (or only) confirmed by running the app on a device/emulator or
  with instrumentation (Frida, a proxy, `adb`).
- **manual** — needs a human reviewer to recognize the weakness (e.g. a client-side
  trust decision that no fixed signature captures).
- **needs-dataflow** — surrounding *posture* (config, an exported component, a dangerous
  API call) is statically flaggable, but the *labelled* weakness needs
  interprocedural dataflow/taint or manual confirmation to prove end-to-end.

## Mapping

| # | Lab | OWASP | MASVS / MASTG | Detection class | Notes |
|---|---|---|---|---|---|
| 1 | Hardcoded API key/secret in the JS bundle (`m1_hardcoded_secret`) | M1 | MASVS-STORAGE · MASTG: Data Storage | static | Secret literals compile into the Hermes bundle string pool; a bytecode/string-scanning SAST recovers them verbatim, no deobfuscation needed. |
| 2 | Auth token in plaintext AsyncStorage (`m1_asyncstorage_token`) | M1/M9 | MASVS-STORAGE · MASTG: Data Storage | static | `AsyncStorage.setItem` with a secret-shaped key is a recognizable call-site pattern for a bundle-aware SAST. |
| 3 | Client-side hardcoded credential check (`m1_client_cred_check`) | M1/M3 | MASVS-AUTH · MASTG: Authentication | needs-dataflow | A SAST sees a hardcoded string, but proving it is the *sole* auth gate needs dataflow or a manual read — client-side authorization logic is easy to miss. |
| 4 | Vulnerable npm dependency — lodash 4.17.11 (`m2_vuln_npm_dep`) | M2 | MASVS-CODE · MASTG: Code Quality | static | Software-composition analysis: parse `package.json`/lockfile (or fingerprint bundled versions) and cross-reference OSV/CVE. Scanners that inspect only native DEX libraries miss the JS npm dependency. Ground truth: lodash `4.17.11` → CVE-2019-10744. |
| 5 | Client-side JWT role trust (`m3_client_jwt_trust`) | M3 | MASVS-AUTH · MASTG: Authentication | needs-dataflow | Decoding a JWT payload and trusting a claim without signature verification is not a fixed signature; proving the decoded claim gates a privileged action needs interprocedural taint or manual review. |
| 6 | Insecure deep-link handler (`m4_deeplink_sink`) | M4 | MASVS-PLATFORM · MASTG: Platform Interaction | needs-dataflow | The exported entry point / intent-filters are static (manifest), but the JS deep-link-param → `openURL` sink flow needs dataflow/taint. |
| 7 | WebView injectedJavaScript + file access (`m4_webview_injection`) | M4 | MASVS-PLATFORM · MASTG: Platform Interaction | needs-dataflow | The dangerous WebView props (`allowFileAccess`, `allowUniversalAccessFromFileURLs`, `originWhitelist:['*']`, JS enabled) are statically flaggable; proving the injected value is attacker-controlled end-to-end needs JS taint. |
| 8 | Insecure native module — exec / readFile (`m4_insecure_native_module`) | M4/M8 | MASVS-PLATFORM / MASVS-CODE · MASTG: Platform Interaction, Code Quality | static | A native bridge method wrapping `Runtime.exec` / arbitrary `File(...).readText()` exposed as a `@ReactMethod` is catchable by a bytecode/DEX SAST; confirming JS reaches it end-to-end is cross-language (JS↔native) and often needs manual review. |
| 9 | Cleartext HTTP endpoint (`m5_cleartext_http`) | M5 | MASVS-NETWORK · MASTG: Network Communication | static | Cleartext posture (manifest / `network_security_config.xml`) plus the `http://` URL in the bundle are statically detectable. A call-site rule that expects a single string literal may miss a URL built by concatenation/template — model concatenated URLs to catch those too. |
| 10 | Secret exfil to cleartext (`m5_secret_exfil`) | M5 | MASVS-NETWORK · MASTG: Network Communication | needs-dataflow | Requires interprocedural dataflow/taint (secret source → cleartext network sink). Many scanners miss this on **optimized Hermes/Metro release bundles**, where the AsyncStorage source is wrapped by the package and async-unwrapped; only the sink's cleartext posture is trivially flagged. |
| 11 | Trust-all TLS / no certificate pinning (`m5_trust_all_tls`) | M5 | MASVS-NETWORK · MASTG: Network Communication | static | The NSC trust-anchor (`<certificates src="user"/>`) and the absence of a `<pin-set>` are visible in the parsed `network_security_config.xml`. |
| 12 | Secret logged (`m6_pii_logged`) | M6 | MASVS-PRIVACY · MASTG: Platform Interaction | needs-dataflow | Requires taint dataflow (secret source → log sink). A static scan can flag `console.log` of a variable, but confirming the value is a secret needs dataflow. |
| 13 | Secret to clipboard (`m6_secret_clipboard`) | M6 | MASVS-PRIVACY · MASTG: Platform Interaction | needs-dataflow | The clipboard-write API call is statically flaggable; confirming the copied value is a secret needs taint. |
| 14 | Source map shipped in the release build (`m7_sourcemap_shipped`) | M7 | MASVS-RESILIENCE / MASVS-CODE · MASTG: Resilience | static | APK asset inventory: the shipped `index.android.bundle.map` next to the bundle is a file-presence check. |
| 15 | Debuggable + no root detection + no obfuscation (`m7_no_hardening`) | M7 | MASVS-RESILIENCE / MASVS-CODE · MASTG: Resilience | static | Manifest `debuggable` flag, build config (`minifyEnabled`/ProGuard), and the absence of anti-tamper/root checks are static manifest/config observations. |
| 16 | Exported component + insecure deep-link intent-filter (`m8_exported_deeplink`) | M8 | MASVS-PLATFORM · MASTG: Platform Interaction | static | Manifest parse: an exported activity with browsable custom-scheme + broad `http` intent-filters. |
| 17 | allowBackup=true + cleartext-permitted NSC (`m8_backup_cleartext`) | M8 | MASVS-STORAGE / MASVS-NETWORK · MASTG: Data Storage, Network Communication | static | Manifest `allowBackup` + NSC `cleartextTrafficPermitted="true"` are static manifest/resource checks. |
| 18 | Weak JS crypto — AES-ECB, hardcoded key, static IV (`m10_weak_crypto`) | M10 | MASVS-CRYPTO · MASTG: Cryptography | needs-dataflow | Needs JS-bundle-aware analysis: `crypto-js` AES-ECB `mode`, a hardcoded/derived key, a static IV, and a `Math.random()` security token. DEX-only scanners miss it because the crypto runs in JS, not `javax.crypto` — only the `Math.random()` token is easy to flag. |

**Class mix:** 10 **static**, 8 **needs-dataflow**. The needs-dataflow labs are the honest hard
cases — client-side trust decisions and JS-layer source→sink flows that need
dataflow/taint (or a manual read) to prove, not just a config/API signature.

## Notes on detecting React Native weaknesses

These are generic observations for anyone building or evaluating a scanner against
DIRNA — not results for any particular tool:

- **The JS layer is the gap.** Manifest/NSC/DEX misconfigurations (labs 9, 11,
  14–17) are the same as for any Android app and are the easiest to catch. The
  weaknesses that live purely in the JS/Hermes bundle (client-side auth, JS crypto,
  npm-dependency CVEs, source→sink taint) are where mobile scanners most often fall
  short.
- **Optimized Hermes/Metro release bundles are harder than dev bundles.** Minified,
  wrapped, and async-transformed code changes the shape of a source or sink call
  (e.g. an AsyncStorage read routed through the package's wrapper class and an
  `async/await` transform). Interprocedural taint that was validated on hand-crafted
  or unoptimized bundles can silently return **zero flows** on a real release build —
  labs 10 and 12 (`getItem('@auth_token')` → `fetch(http://…)` / `console.log`) are
  a good reproduction of this.
- **npm dependencies need their own inventory.** Native `.so`/DEX library
  cross-referencing does not cover the JS dependency tree; SCA for RN must read
  `package.json`/the lockfile (or fingerprint bundled versions) and cross-reference
  OSV/CVE data (lab 4).
- **WebView and native-bridge injection are cross-language.** Catching them fully
  means following data from JS into a WebView/`@ReactMethod` sink — the config is
  easy, the end-to-end flow is not (labs 7, 8).
