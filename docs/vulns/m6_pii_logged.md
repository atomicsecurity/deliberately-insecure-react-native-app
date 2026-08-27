# Secret logged (`m6_pii_logged`)
- **OWASP:** M6 (Inadequate Privacy Controls)  ·  **MASVS:** MASVS-PRIVACY  ·  **MASTG:** Platform Interaction  ·  **Detection:** needs-dataflow (secret → log-sink dataflow needs taint)

## What
The stored auth token is read from `AsyncStorage` and written to the log via
`console.log('DEBUG auth token =', t)`. In a RN release build `console.log` maps to
Android logcat, so the secret is persisted to a world-readable-ish system log.

## Where
`src/labs/m6_pii_logged/index.tsx` — the `// DIRNA-VULN:m6_pii_logged` line(s)
(`AsyncStorage.getItem('@auth_token')` → `console.log('DEBUG auth token =', t)`).

## Proof / repro
- **Static:** the scanner's taint engine flows the secret-shaped source
  (`getItem('@auth_token')`) into a logging sink (`console.log`).
- **Dynamic:** run `m1_asyncstorage_token` to populate `@auth_token`, open this
  lab, tap **Run this lab**, then `adb logcat | grep 'DEBUG auth token'` — the JWT
  is printed in cleartext.

## Impact
Any app holding `READ_LOGS`, a bug-report/diagnostics capture, or a device backup
recovers the token from the log stream — credential theft with no exploit needed.

## Fix
```ts
// Never log secrets. Redact, and strip console.* from release bundles.
const t = await Keychain.getGenericPassword();
if (__DEV__) {
  console.log('DEBUG auth token = [redacted]'); // never the value; dev-only
}
// babel.config.js (release): plugins: ['transform-remove-console']
```
