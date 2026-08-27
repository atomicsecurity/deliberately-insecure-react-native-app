# Weak JS crypto (`m10_weak_crypto`)
- **OWASP:** M10 (Insufficient Cryptography)  ·  **MASVS:** MASVS-CRYPTO  ·  **MASTG:** Cryptography  ·  **Detection:** needs-dataflow (needs JS-bundle-aware analysis of `crypto-js`; DEX-only scanners miss the JS crypto)

## What
Multiple cryptographic anti-patterns in one place, all in JS via `crypto-js`:
- **AES in ECB mode** (`mode: CryptoJS.mode.ECB`) — deterministic, leaks plaintext
  structure (identical blocks → identical ciphertext).
- **Hardcoded key** derived from a checked-in constant (`FAKE_AWS_KEY.slice(0,16)`).
- **Static / no IV** — ECB uses no IV, so encryptions are fully repeatable.
- **Insecure randomness** — a "token" from `Math.random().toString(36)`, which is
  not cryptographically secure and is predictable.

## Where
`src/labs/m10_weak_crypto/index.tsx` — the `// DIRNA-VULN:m10_weak_crypto` line
(`CryptoJS.AES.encrypt('secret', key, { mode: CryptoJS.mode.ECB })` and
`Math.random().toString(36).slice(2)`).

## Proof / repro
- **Static:** a JS/bundle-aware scanner flags `CryptoJS.mode.ECB`, a key sourced
  from a hardcoded constant, and `Math.random()` used to mint a security token.
  (DEX-only scanners miss it because the crypto runs in JS, not `javax.crypto` —
  hence the ⚠️.)
- **Dynamic:** open this lab, tap **Run this lab** — the same plaintext encrypts to
  the **same** ciphertext every run (ECB determinism), and the token is drawn from
  a non-CSPRNG.

## Impact
ECB reveals plaintext patterns and enables cut-and-paste block attacks; the
hardcoded key means anyone with the bundle decrypts everything; `Math.random`
tokens are guessable, enabling session/nonce prediction.

## Fix
```ts
import 'react-native-get-random-values';
import { NativeModules } from 'react-native';
// Use AES-GCM (authenticated) with a random 96-bit IV and a key from the Keystore,
// never a hardcoded constant; mint tokens from a CSPRNG.
const iv = crypto.getRandomValues(new Uint8Array(12));      // per-message random IV
const token = [...crypto.getRandomValues(new Uint8Array(16))]
  .map(b => b.toString(16).padStart(2, '0')).join('');       // CSPRNG token
// key material lives in the Android Keystore / iOS Keychain, not in the bundle.
```
