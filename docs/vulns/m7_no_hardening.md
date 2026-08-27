# Debuggable + no root detection + no obfuscation (`m7_no_hardening`)
- **OWASP:** M7 (Insufficient Binary Protection)  ·  **MASVS:** MASVS-RESILIENCE / MASVS-CODE  ·  **MASTG:** Resilience  ·  **Detection:** static SAST (manifest `debuggable` + build config + absent root detection)

## What
The release build ships with **no binary hardening**: `android:debuggable="true"`
is set (also forced for the release variant in gradle), there is **no
root/emulator detection**, and code shrinking/obfuscation is off
(`minifyEnabled false`, no ProGuard/R8 rules). A debuggable release lets anyone
attach a debugger to a production build and inspect/modify it at runtime. This lab
screen is a **marker** — the real vulnerability lives in the Android manifest/build
config, not in JS.

## Where
- Marker: `src/labs/m7_no_hardening/index.tsx` — the `// DIRNA-VULN:m7_no_hardening` line.
- Real vuln: `android/app/src/main/AndroidManifest.xml`
  (`android:debuggable="true"` on `<application>`) and `android/app/build.gradle`
  (`buildTypes.release` with `debuggable true`, `minifyEnabled false`, no
  `proguardFiles`, and no root-detection gate) — added in the Android-shell phase.

## Proof / repro
- **Static:** `aapt dump badging app-release.apk | grep -i debuggable` reports
  `application-debuggable`; androguard/a scanner reading the manifest flags the
  debuggable release plus the absence of obfuscation and any anti-tamper checks.
- **Dynamic / manual:** because the release is debuggable, `adb shell run-as
  com.dirna.vulnerable` and JDWP debugger attach both succeed against the shipped
  build; the app runs unmodified on a rooted device/emulator.

## Impact
A debuggable, un-obfuscated, root-oblivious release is trivial to attach to,
inspect, and tamper with: an attacker reads memory/variables at runtime, bypasses
client-side checks, and reverse-engineers logic with clear symbol names — no binary
protection to slow them down.

## Fix
```groovy
// android/app/build.gradle
buildTypes {
    release {
        debuggable false                 // never ship a debuggable release
        minifyEnabled true               // enable R8 shrinking + obfuscation
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
    }
}
// Remove android:debuggable from AndroidManifest.xml (default false), and add a
// runtime root/emulator-detection gate (e.g. RootBeer) before handling sensitive data.
```
