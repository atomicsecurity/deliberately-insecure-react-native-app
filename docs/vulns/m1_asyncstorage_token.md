# Auth token in plaintext AsyncStorage (`m1_asyncstorage_token`)
- **OWASP:** M1 (Improper Credential Usage) / M9 (Insecure Data Storage)  ·  **MASVS:** MASVS-STORAGE  ·  **MASTG:** Data Storage  ·  **Detection:** static SAST (AsyncStorage call-site scan)

## What
The auth JWT and the user's password are written to `AsyncStorage`, which is an
**unencrypted** key/value store backed by a plaintext SQLite/file on the device.
Sensitive data must not be stored there.

## Where
`src/labs/m1_asyncstorage_token/index.tsx` — the `// DIRNA-VULN:m1_asyncstorage_token`
line(s) (`AsyncStorage.setItem('@auth_token', …)` / `setItem('@user_password', …)`).

## Proof / repro
- **Static:** the scanner keys on the `@react-native-async-storage/async-storage`
  `setItem` call-site with a secret-shaped key (`@auth_token`, `@user_password`).
- **Dynamic:** tap **Run this lab**, then on a rooted device / emulator read
  `adb shell run-as com.dirna.vulnerable cat databases/RKStorage` — the token and
  password appear in cleartext.

## Impact
Malware with storage access, a device backup, or physical access recovers the
long-lived token and password directly — full account takeover with no crypto to
break.

## Fix
```ts
// Store secrets in the OS keystore (hardware-backed), not AsyncStorage.
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('auth', token, {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  // On Android this is stored via the Android Keystore, encrypted at rest.
});
const creds = await Keychain.getGenericPassword();
```
