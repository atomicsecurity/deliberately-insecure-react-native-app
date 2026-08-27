# Trust-all TLS / no certificate pinning (`m5_trust_all_tls`)
- **OWASP:** M5 (Insecure Communication)  ·  **MASVS:** MASVS-NETWORK  ·  **MASTG:** Network Communication  ·  **Detection:** static SAST (`network_security_config.xml` parse: user-CA trust + no pinning)

## What
TLS validation is effectively disabled at the Android-shell layer: the
`network_security_config.xml` `base-config` adds **user-installed CAs** to the
trust anchors (`<certificates src="user"/>`) and the app pins **no** certificate.
Any CA the user (or an attacker who can get one installed) controls can MITM the
app's HTTPS traffic. This lab screen is a **marker** — the real vulnerability lives
in the NSC file, not in JS.

## Where
- Marker: `src/labs/m5_trust_all_tls/index.tsx` — the `// DIRNA-VULN:m5_trust_all_tls` line.
- Real vuln: `android/app/src/main/res/xml/network_security_config.xml` —
  `<trust-anchors><certificates src="user"/></trust-anchors>` (added in the
  Android-shell phase) + the absence of any `<pin-set>`.

## Proof / repro
- **Static:** a scanner parsing the NSC (from the decompiled APK's
  `res/xml/network_security_config.xml`) flags `src="user"` in the trust anchors
  and the absence of pinning.
- **Dynamic:** install a proxy CA (e.g. Burp/mitmproxy) into the device's *user*
  trust store, route the device through the proxy, and observe the app's HTTPS
  traffic decrypted — no pinning error is raised.

## Impact
An attacker who can install a CA (malicious profile, compromised MDM, or a user
tricked into trusting one) transparently intercepts and rewrites all of the app's
TLS traffic, harvesting tokens and injecting responses.

## Fix
```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system"/>   <!-- system CAs only; drop src="user" -->
    </trust-anchors>
  </base-config>
  <!-- Pin the leaf/intermediate to defeat even a rogue system CA: -->
  <domain-config>
    <domain includeSubdomains="true">dirna.example</domain>
    <pin-set expiration="2027-01-01">
      <pin digest="SHA-256">BASE64_SPKI_PIN=</pin>
    </pin-set>
  </domain-config>
</network-security-config>
```
