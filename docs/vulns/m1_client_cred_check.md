# Client-side hardcoded credential check (`m1_client_cred_check`)
- **OWASP:** M1 (Improper Credential Usage) / M3 (Insecure Authentication/Authorization)  ·  **MASVS:** MASVS-AUTH  ·  **MASTG:** Authentication  ·  **Detection:** needs-dataflow (static sees a hardcoded string; proving it is the sole auth gate needs dataflow / manual review)

## What
The login decision is made **on the device** by comparing the entered
username/password against hardcoded constants (`admin` / `P@ssw0rd123`). Any
authentication performed client-side can be bypassed by patching or reading the
bundle.

## Where
`src/labs/m1_client_cred_check/index.tsx` — the `// DIRNA-VULN:m1_client_cred_check`
line(s) (`ADMIN_USER` / `ADMIN_PASS` constants + the `login()` comparison).

## Proof / repro
- **Static:** the hardcoded credential strings are recoverable from the bundle,
  but the scanner only sees "a hardcoded string" — it cannot prove the string is
  the *sole* auth gate (hence the ⚠️ needs-dataflow coverage: no dataflow into an
  authorization decision).
- **Dynamic:** open the lab (the two `TextInput`s default to `admin` /
  `P@ssw0rd123`) and tap **Run this lab** → `ADMIN GRANTED`. The credential lives
  in the app; extracting the bundle reveals it.

## Impact
Every install ships the same admin password, and the "grant" happens with no
server involved — an attacker reads the constant (or flips the boolean) and is
admin on every device.

## Fix
```ts
// Authenticate on the server; the client only forwards the attempt and trusts the result.
async function login(username: string, password: string): Promise<boolean> {
  const res = await fetch('https://api.example.com/v1/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.ok; // no credential, comparison, or role decision is embedded in the app
}
```
