# Cleartext HTTP endpoint (`m5_cleartext_http`)
- **OWASP:** M5 (Insecure Communication)  ·  **MASVS:** MASVS-NETWORK  ·  **MASTG:** Network Communication  ·  **Detection:** static SAST (manifest/NSC + `http://` URL in the bundle)

> **How it's detected:** the cleartext *posture* is easy to flag — the Android
> `network_security_config.xml` (`cleartextTrafficPermitted="true"`) plus the
> `http://` URL in the bundle. A call-site check that expects a single string
> literal as the `fetch` argument can miss this, because the URL is built by string
> concatenation (`` `${CLEARTEXT_HOST}/api/login` ``) rather than one literal — so
> modelling concatenated/template-built URLs is what lets a call-site check fire
> alongside the manifest/NSC signal (see [`detection.md`](../detection.md)).

## What
The app issues a request to an `http://` (plaintext) endpoint via
`fetch('http://10.0.2.2:8080/api/login')`. `10.0.2.2:8080` is the Android
emulator's host-loopback alias — a realistic-looking insecure local "backend"
(and, unlike a reserved `.invalid` TLD, a host scanners don't filter out).
Traffic is unencrypted and readable / modifiable by any on-path observer.

## Where
`src/labs/m5_cleartext_http/index.tsx` — the `// DIRNA-VULN:m5_cleartext_http` line
(`fetch(`${CLEARTEXT_HOST}/api/login`)`, where `CLEARTEXT_HOST = 'http://10.0.2.2:8080'`).
The Android shell also permits cleartext globally via
`network_security_config.xml` (`cleartextTrafficPermitted="true"`).

## Proof / repro
- **Static:** the scanner flags a string-literal `http://` URL used as a `fetch`
  argument in the React Native bundle (Hermes string table + call-site).
- **Dynamic:** open this lab, tap **Run this lab** — a request goes out to
  `http://10.0.2.2:8080/api/login` over cleartext (visible in a proxy / on the
  wire). Nothing is listening there unless you run a local backend, so the fetch
  fails silently; the insecure *call* is the deliverable.

## Impact
Credentials, tokens, and responses transit in cleartext: a passive attacker on the
same Wi-Fi / any upstream hop reads them, and an active MITM rewrites the response.

## Fix
```ts
// Always use TLS; never http://. Keep cleartext disabled in the network security config.
await fetch('https://dirna.example/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user, pass }),
});
// android/app/src/main/res/xml/network_security_config.xml:
//   <base-config cleartextTrafficPermitted="false"> … </base-config>
```
