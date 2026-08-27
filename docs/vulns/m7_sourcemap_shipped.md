# Source map shipped in the release build (`m7_sourcemap_shipped`)
- **OWASP:** M7 (Insufficient Binary Protection)  ·  **MASVS:** MASVS-RESILIENCE / MASVS-CODE  ·  **MASTG:** Resilience  ·  **Detection:** static SAST (APK asset inventory: shipped `.map`)

## What
The release build emits a Hermes/Metro **source map** (`index.android.bundle.map`)
and packages it into the APK assets next to the bytecode bundle. The map reverses
minification/obfuscation of the shipped JS, exposing original module paths,
function/variable names, and code structure to anyone who unzips the APK. This lab
screen is a **marker** — the real vulnerability lives in the Android build config,
not in JS.

## Where
- Marker: `src/labs/m7_sourcemap_shipped/index.tsx` — the `// DIRNA-VULN:m7_sourcemap_shipped` line.
- Real vuln: `android/app/build.gradle` — the `react { ... }` block forces Hermes
  source-map emission (`-output-source-map`) and keeps `index.android.bundle.map`
  in the packaged assets (added in the Android-shell phase).

## Proof / repro
- **Static:** `unzip -l app-release.apk | grep index.android.bundle.map` lists the
  map inside `assets/`; a scanner walking the APK assets flags the shipped source
  map.
- **Dynamic / manual:** `unzip -o app-release.apk assets/index.android.bundle.map`
  then feed the map + `index.android.bundle` to a source-map tool to recover the
  original, un-minified JS.

## Impact
An attacker who obtains the release APK de-obfuscates the entire JS layer for free:
original file paths, symbol names, and logic — dramatically lowering the cost of
reverse-engineering business logic, finding other planted secrets, and crafting
targeted attacks.

## Fix
```groovy
// android/app/build.gradle — do NOT emit or ship the source map in release
react {
    // Default Hermes flags omit -output-source-map; if you generate a map for
    // crash symbolication, upload it to your crash reporter and DELETE it from
    // the packaged assets so it never lands in the APK.
    hermesFlagsRelease = ["-O", "-w"]
}
```
