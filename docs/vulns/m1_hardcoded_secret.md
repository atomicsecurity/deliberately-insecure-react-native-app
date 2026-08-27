# Hardcoded secret in the bundle (`m1_hardcoded_secret`)
- **OWASP:** M1 (Improper Credential Usage)  ·  **MASVS:** MASVS-STORAGE  ·  **MASTG:** Data Storage  ·  **Detection:** static SAST (Hermes bundle string scan)

## What
An AWS secret access key and a Stripe *live* secret key are written as string
literals in the JS source, so they are compiled straight into the shipped Hermes
bundle. Anything embedded in the app package is not a secret.

## Where
`src/labs/m1_hardcoded_secret/index.tsx` — the `// DIRNA-VULN:m1_hardcoded_secret` line(s)
(`AWS_SECRET_ACCESS_KEY` and `STRIPE_KEY` constants).

## Proof / repro
- **Static:** the scanner reads the release `index.android.bundle`; a grep for
  `AKIAIOSFODNN7EXAMPLE` / `sk_live_` recovers both literals verbatim. No
  deobfuscation needed — Hermes string tables preserve them.
- **Dynamic:** open the lab and tap **Run this lab**; the screen prints the two
  keys it "loaded from source", demonstrating they are present at runtime.

## Impact
Anyone who downloads the APK can extract the keys and impersonate the app against
AWS / Stripe — charging cards, moving money, or reading cloud data — with no
further compromise required.

## Fix
```ts
// Never embed long-lived provider secrets in the client.
// Fetch short-lived, scoped credentials from your backend after the user authenticates.
async function getUploadCredentials(): Promise<{ token: string; expiresAt: number }> {
  const res = await fetch('https://api.example.com/v1/upload-credentials', {
    headers: { Authorization: `Bearer ${await getUserSessionToken()}` },
  });
  return res.json(); // STS-style temporary token, minutes-long TTL, tightly scoped
}
```
