# Vulnerable npm dependency (lodash 4.17.11) (`m2_vuln_npm_dep`)
- **OWASP:** M2 (Inadequate Supply Chain Security)  ·  **MASVS:** MASVS-CODE  ·  **MASTG:** Code Quality  ·  **Detection:** static SAST (software-composition analysis: npm dependency + OSV/CVE cross-reference)

## What
The app depends on **`lodash@4.17.11`**, which is vulnerable to
**CVE-2019-10744** (prototype pollution in `defaultsDeep`/`merge` via a
`__proto__` key). The dependency is pinned and actually imported
(`import merge from 'lodash/merge'`) so its code ships in the Hermes bundle, and
the lab demonstrates the pollution live. The pin carries a `// DIRNA: do not bump`
note in `package.json` — this lab is a deliberate benchmark for a future scanner
cycle (RN/npm dependency inventory + OSV cross-reference), so the version must not
be upgraded.

## Where
- Import/usage: `src/labs/m2_vuln_npm_dep/index.tsx` — the
  `// DIRNA-VULN:m2_vuln_npm_dep` line (`merge({}, JSON.parse('{"__proto__":{"polluted":"yes"}}'))`).
- Pin: `package.json` — `"lodash": "4.17.11"` (exact) with the `"//lodash"`
  "DIRNA: do not bump" comment key.

## Proof / repro
- **Static:** an OSV-aware SCA scanner reads the RN app's `package.json` /
  lockfile, resolves `lodash@4.17.11`, and cross-references OSV → CVE-2019-10744.
  (Mobile scanners that inventory only native DEX libraries miss the RN JS
  dependency — the JS dependency tree needs its own SCA pass.)
- **Dynamic:** open this lab, tap **Run this lab** — `merge` walks the
  `__proto__` key and pollutes `Object.prototype`, so `({}).polluted` reads back
  `"yes"` on a brand-new empty object.

## Impact
Prototype pollution lets an attacker who controls merged/parsed input inject
properties onto every object in the JS realm, enabling logic bypass, DoS, and in
some sinks RCE-adjacent behavior.

## Fix
```ts
// Upgrade to a patched lodash (>= 4.17.12 fixes CVE-2019-10744; >= 4.17.21 for
// the full set of later advisories) and treat merge input as untrusted.
// package.json:  "lodash": "^4.17.21"
import merge from 'lodash/merge';
const safe = merge({}, JSON.parse(userInput, (k, v) => (k === '__proto__' ? undefined : v)));
```
