# Exported component + insecure deep-link intent-filter (`m8_exported_deeplink`)
- **OWASP:** M8 (Security Misconfiguration)  ·  **MASVS:** MASVS-PLATFORM  ·  **MASTG:** Platform Interaction  ·  **Detection:** static SAST (manifest parse: exported activity + browsable intent-filters)

## What
`MainActivity` is exported (`android:exported="true"`) and declares **browsable**
`<intent-filter>`s for a custom `dirna://` scheme and for plain `http`, so any other
installed app — or a web page the user taps — can launch the activity and drive its
deep-link handling with attacker-controlled data. Combined with the deep-link sink
(`m4_deeplink_sink`), this is a remotely-reachable entry point. This lab screen is a
**marker** — the real vulnerability lives in the Android manifest, not in JS.

## Where
- Marker: `src/labs/m8_exported_deeplink/index.tsx` — the `// DIRNA-VULN:m8_exported_deeplink` line.
- Real vuln: `android/app/src/main/AndroidManifest.xml` — `MainActivity` with
  `android:exported="true"` and two browsable `<intent-filter>`s (`dirna://open` and
  a `<data android:scheme="http"/>` filter), added in the Android-shell phase.

## Proof / repro
- **Static:** `aapt dump badging app-release.apk` (or androguard's manifest parse)
  shows `MainActivity` exported with the `dirna` and `http` schemes; a scanner flags
  the exported activity + insecure deep-link intent-filter.
- **Dynamic / manual:** `adb shell am start -a android.intent.action.VIEW -d
  "dirna://open?next=http://dirna.invalid/evil" com.dirna.vulnerable` launches the app
  from outside and feeds it the unvalidated URL — reproducing the deep-link sink
  end to end.

## Impact
Any third-party app or malicious web link can invoke the exported activity with
crafted deep-link data, reaching internal handlers and sinks without user
authentication — enabling redirection, forced navigation, and abuse of any
capability the deep link exposes.

## Fix
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<activity android:name=".MainActivity" android:exported="false">
  <intent-filter>
    <action android:name="android.intent.action.MAIN"/>
    <category android:name="android.intent.category.LAUNCHER"/>
  </intent-filter>
  <!-- If a deep link is required, use Android App Links (autoVerify + https only),
       drop the http/custom-scheme browsable filters, and validate every param
       server-verified before acting on it. -->
</activity>
```
