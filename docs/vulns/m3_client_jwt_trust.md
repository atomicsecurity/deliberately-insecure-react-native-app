# Client-side JWT role trust (`m3_client_jwt_trust`)
- **OWASP:** M3 (Insecure Authentication/Authorization)  ·  **MASVS:** MASVS-AUTH  ·  **MASTG:** Authentication  ·  **Detection:** needs-dataflow (needs dataflow/taint or manual review of the client-side JWT-trust decision)

## What
The app base64-decodes the JWT payload on the device and trusts the `role` claim
(`role === 'admin'`) **without ever verifying the token's signature**. A forged
token with `{"role":"admin"}` and any signature is accepted.

## Where
`src/labs/m3_client_jwt_trust/index.tsx` — the `// DIRNA-VULN:m3_client_jwt_trust`
line(s) (`isAdmin()` → `JSON.parse(atob(jwt.split('.')[1]))`).

## Proof / repro
- **Static:** the scanner sees a client-side JWT decode with no crypto
  verification call, but proving the decoded claim gates a privileged action needs
  interprocedural taint — hence ⚠️ needs-dataflow coverage.
- **Dynamic:** the input defaults to `FAKE_JWT` (payload `{"role":"admin"}`,
  bogus signature `c2ln`); tap **Run this lab** → `ADMIN GRANTED`. Swap in any
  unsigned token whose middle segment base64-decodes to `{"role":"admin"}` and it
  is still accepted.

## Impact
Authorization is decided from an unauthenticated, attacker-controllable string.
Anyone can mint an "admin" JWT and unlock privileged screens/actions with zero
server round-trip.

## Fix
```ts
// Never trust JWT claims the client hasn't cryptographically verified.
// Verify the signature server-side and let the SERVER gate privileged actions.
async function callAdminApi(jwt: string) {
  // The client just presents the token; the API validates the signature (jwks),
  // checks exp/aud/iss, and authorizes the role. The app renders whatever the API allows.
  const res = await fetch('https://api.example.com/v1/admin/things', {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (res.status === 403) return 'not admin';
  return res.json();
}
```
