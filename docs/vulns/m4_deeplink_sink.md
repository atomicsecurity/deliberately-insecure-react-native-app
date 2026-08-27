# Insecure deep-link handler (`m4_deeplink_sink`)
- **OWASP:** M4 (Insufficient Input/Output Validation)  ·  **MASVS:** MASVS-PLATFORM  ·  **MASTG:** Platform Interaction  ·  **Detection:** needs-dataflow (the exported surface is static via the manifest; the JS deep-link-param → sink flow needs dataflow/taint)

## What
The app parses a `dirna://open?next=…` deep link and passes the attacker-controlled
`next` query parameter **straight to `Linking.openURL`** with no allow-list or scheme
validation. A crafted link can redirect the user (open-redirect) or launch an
arbitrary URI / component.

## Where
`src/labs/m4_deeplink_sink/index.tsx` — the `// DIRNA-VULN:m4_deeplink_sink` line
(`handleDeepLink()` → `new URL(url).searchParams.get('next')` → `Linking.openURL(next)`).
The exported Android activity + `dirna://` intent-filter that make this reachable from
outside the app are planted in a later phase
(`AndroidManifest.xml`, labs `m8_exported_deeplink`).

## Proof / repro
- **Static:** the scanner sees a deep-link parameter flowing into an `openURL` sink
  without validation. On the Android shell the exported activity + `dirna://`/`http`
  intent-filters surface the untrusted entry point.
- **Dynamic:** open this lab; the input defaults to
  `dirna://open?next=http://dirna.invalid/evil`. Tap **Run this lab** →
  `openURL(http://dirna.invalid/evil)` — the unvalidated `next` value is handed to the
  system URL handler. Once the intent-filter ships, the same handler is reachable via
  `adb shell am start -a android.intent.action.VIEW -d 'dirna://open?next=http://dirna.invalid/evil'`.

## Impact
An attacker who can deliver a `dirna://` link (web page, another app, QR code) controls
where `openURL` navigates: open-redirect to a phishing page, launching another app's
exported component, or triggering a further deep-link chain — all without user consent
beyond tapping the link.

## Fix
```ts
import { Linking } from 'react-native';
const ALLOWED = new Set(['https:']);
const ALLOWED_HOSTS = new Set(['dirna.example']);
export function handleDeepLink(url: string) {
  const next = new URL(url).searchParams.get('next') || '';
  const target = new URL(next);
  // Only open vetted https destinations you control; reject everything else.
  if (!ALLOWED.has(target.protocol) || !ALLOWED_HOSTS.has(target.host)) {
    return 'blocked untrusted deep-link target';
  }
  Linking.openURL(target.toString());
  return `openURL(${target})`;
}
```
