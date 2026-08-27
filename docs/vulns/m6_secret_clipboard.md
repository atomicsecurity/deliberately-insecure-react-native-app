# Secret to clipboard (`m6_secret_clipboard`)
- **OWASP:** M6 (Inadequate Privacy Controls)  ·  **MASVS:** MASVS-PRIVACY  ·  **MASTG:** Platform Interaction  ·  **Detection:** needs-dataflow (the clipboard-write API is statically flaggable; confirming the value is a secret needs taint)

## What
The stored auth token is read from `AsyncStorage` and written to the **system
clipboard** via `Clipboard.setString(t)`. On Android the clipboard is shared
across the whole device: any other app (and, pre-Android-12, without any user
signal) can read it.

## Where
`src/labs/m6_secret_clipboard/index.tsx` — the `// DIRNA-VULN:m6_secret_clipboard`
line (`AsyncStorage.getItem('@auth_token')` → `Clipboard.setString(t || '')`).

## Proof / repro
- **Static:** the scanner's taint engine flows the secret-shaped source
  (`getItem('@auth_token')`) into the clipboard sink
  (`@react-native-clipboard/clipboard` `setString`).
- **Dynamic:** run `m1_asyncstorage_token` first to populate `@auth_token`, open
  this lab and tap **Run this lab**, then read the clipboard from another app or
  via `adb shell service call clipboard …` — the JWT is present in cleartext.

## Impact
Any co-installed app that reads the clipboard (a keyboard, a "clipboard manager",
malware) harvests the token and takes over the account — no exploit or permission
prompt required on older Android versions.

## Fix
```ts
// Never place secrets on the shared clipboard. If a copy affordance is truly
// needed, mark the clip sensitive and clear it quickly.
import Clipboard from '@react-native-clipboard/clipboard';
// Android 13+: flag the item so it is hidden from clipboard previews / history.
Clipboard.setStringWithSensitivity?.(nonSecretValue, 'sensitive');
// Best: don't copy the credential at all — keep it in the Keychain/Keystore.
```
