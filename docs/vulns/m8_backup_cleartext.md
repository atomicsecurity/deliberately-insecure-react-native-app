# allowBackup=true + cleartext-permitted NSC (`m8_backup_cleartext`)
- **OWASP:** M8 (Security Misconfiguration)  ·  **MASVS:** MASVS-STORAGE / MASVS-NETWORK  ·  **MASTG:** Data Storage, Network Communication  ·  **Detection:** static SAST (manifest `allowBackup` + NSC cleartext)

## What
Two shell-layer misconfigurations combine: `android:allowBackup="true"` lets the
app's private data (including the plaintext AsyncStorage from labs #2/#10) be
extracted via ADB/cloud backup, and the network security config permits **cleartext
traffic** app-wide (`cleartextTrafficPermitted="true"`), so all HTTP requests go
unencrypted. This lab screen is a **marker** — the real vulnerability lives in the
Android manifest + NSC, not in JS.

## Where
- Marker: `src/labs/m8_backup_cleartext/index.tsx` — the `// DIRNA-VULN:m8_backup_cleartext` line.
- Real vuln: `android/app/src/main/AndroidManifest.xml`
  (`android:allowBackup="true"` on `<application>`) and
  `android/app/src/main/res/xml/network_security_config.xml`
  (`<base-config cleartextTrafficPermitted="true">`), added in the Android-shell phase.

## Proof / repro
- **Static:** `aapt dump badging app-release.apk | grep -i allowBackup` and reading
  the packaged `res/xml/network_security_config.xml` show `allowBackup=true` and
  `cleartextTrafficPermitted="true"`; a scanner flags both the permissive backup
  rules and the cleartext-permitted config.
- **Dynamic / manual:** on a debuggable/rooted device, `adb backup -f dirna.ab
  com.dirna.vulnerable` (then `abe`/`dd` unpack) recovers the app's private files —
  including the stored token/password — off-device.

## Impact
With backup allowed, anyone with adb/physical access (or a compromised cloud backup)
exfiltrates the app's private storage — including plaintext secrets — off-device.
With cleartext permitted, all HTTP traffic is trivially sniffed or tampered on the
wire. Together they defeat both data-at-rest and data-in-transit protection.

## Fix
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
    android:allowBackup="false"
    android:fullBackupContent="false"
    android:dataExtractionRules="@xml/data_extraction_rules"
    android:networkSecurityConfig="@xml/network_security_config">
  <!-- ... -->
</application>
```
```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors><certificates src="system"/></trust-anchors>
  </base-config>
</network-security-config>
```
