# Insecure native module (exec / readFile) (`m4_insecure_native_module`)
- **OWASP:** M4 (Insufficient Input/Output Validation) / M8 (Security Misconfiguration)  ·  **MASVS:** MASVS-PLATFORM / MASVS-CODE  ·  **MASTG:** Platform Interaction, Code Quality  ·  **Detection:** static SAST (bytecode/DEX: `Runtime.exec` / arbitrary file read in a `@ReactMethod` bridge)

## What
A custom Kotlin `ReactContextBaseJavaModule` named **`InsecureBridge`** exposes two
`@ReactMethod`s to **all JavaScript** with no validation, allow-listing, or caller checks:
`exec(cmd)` runs an arbitrary shell command (`Runtime.getRuntime().exec(arrayOf("sh","-c",cmd))`)
and `readFile(path)` returns the contents of any path (`File(path).readText()`). Any JS in the
app — including code injected into a WebView (see `m4_webview_injection`) — can call them.

## Where
- `android/app/src/main/java/com/dirna/vulnerable/InsecureBridgeModule.kt` — the
  `// DIRNA-VULN:m4_insecure_native_module` line (`getName()="InsecureBridge"`, `@ReactMethod exec`/`readFile`).
- `android/app/src/main/java/com/dirna/vulnerable/InsecureBridgePackage.kt` — the `ReactPackage`
  that registers the module.
- `android/app/src/main/java/com/dirna/vulnerable/MainApplication.kt` — `add(InsecureBridgePackage())`.
- `src/native/InsecureBridgeModule.ts` — the typed JS shim.
- `src/labs/m4_insecure_native_module/index.tsx` — the screen; **Run** calls `InsecureBridge.exec('id')`.

## Proof / repro
- **Static:** the scanner sees a native bridge method wrapping `Runtime.exec` /
  arbitrary `File(...).readText()` exposed as a `@ReactMethod`. Confirming JS actually
  reaches it end-to-end needs cross-language (JS↔native) taint, hence ⚠️.
- **Dynamic:** open this lab, tap **Run this lab** → the JS calls `InsecureBridge.exec('id')`
  and the native side returns the output of the shell `id` command (e.g. `uid=…(u0_aXX) …`).
  `readFile('/data/data/com.dirna.vulnerable/…')` returns app-private file bytes to JS.

## Impact
The native module is a JS-reachable arbitrary-command-execution + arbitrary-file-read
primitive running with the app's UID. Any attacker who can run JS in the app (malicious
bundle, WebView XSS, deep-link → injection) gains local command execution and can read the
app's private storage — a full sandbox escape from the JS layer into native code.

## Fix
```kotlin
// Never expose a generic exec()/readFile() to JS. Expose only the specific,
// validated capability the app actually needs.
@ReactMethod
fun readAllowedConfig(name: String, p: Promise) {
  val allowed = setOf("theme", "locale")                 // strict allow-list
  if (name !in allowed) { p.reject("E_DENIED", "not allowed"); return }
  val f = File(reactApplicationContext.filesDir, "config/$name.json")
  // canonical-path check keeps traversal (../) inside the sandbox
  if (!f.canonicalPath.startsWith(reactApplicationContext.filesDir.canonicalPath)) {
    p.reject("E_DENIED", "path escape"); return
  }
  p.resolve(f.readText())
}
// Do NOT wrap Runtime.getRuntime().exec(...) or an unrestricted File(path).readText() at all.
```
