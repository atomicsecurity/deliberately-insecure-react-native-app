# WebView injectedJavaScript + file access (`m4_webview_injection`)
- **OWASP:** M4 (Insufficient Input/Output Validation)  ·  **MASVS:** MASVS-PLATFORM  ·  **MASTG:** Platform Interaction  ·  **Detection:** needs-dataflow (the WebView misconfig props are static; the injectedJavaScript / HTML-interpolation injection needs JS taint)

## What
A `react-native-webview` renders HTML built from **unsanitized user data** and injects
that same data into the page via `injectedJavaScript`, while enabling every dangerous
knob at once: `javaScriptEnabled`, `allowFileAccess`, `allowUniversalAccessFromFileURLs`,
and `originWhitelist={['*']}`. The `userName` value
(`<img src=x onerror=alert(document.cookie)>`) demonstrates the XSS/JS-injection sink.

## Where
`src/labs/m4_webview_injection/index.tsx` — the `// DIRNA-VULN:m4_webview_injection` line
(user data interpolated into `source.html` **and** `injectedJavaScript`, with
`allowFileAccess allowUniversalAccessFromFileURLs javaScriptEnabled originWhitelist={['*']}`).

## Proof / repro
- **Static:** the scanner flags the WebView props (`allowFileAccess`,
  `allowUniversalAccessFromFileURLs`, `originWhitelist:['*']`, JS enabled) and the
  string-built `injectedJavaScript`. Proving the injected value is attacker-controlled
  end-to-end needs JS taint, hence ⚠️ needs-dataflow.
- **Dynamic:** open this lab; the WebView renders `Hi <img src=x onerror=…>` and runs the
  injected script. With file access + universal file-URL access enabled, injected JS can
  read local files (`file:///…`) and cross-origin content.

## Impact
Any attacker-influenced string reaching the HTML or `injectedJavaScript` executes as JS in
the WebView. Combined with `allowFileAccess` + `allowUniversalAccessFromFileURLs`, that JS
can exfiltrate the app's private files (`file:///data/data/com.dirna.vulnerable/…`), steal
cookies/tokens, and reach arbitrary origins because the origin allow-list is `*`.

## Fix
```tsx
import { WebView } from 'react-native-webview';
export default function SafeWebview() {
  const userName = escapeHtml(untrustedInput); // encode, never string-concat into HTML/JS
  return (
    <WebView
      source={{ uri: 'https://dirna.example/profile' }} // load a trusted origin, not built HTML
      javaScriptEnabled={false}
      allowFileAccess={false}
      allowUniversalAccessFromFileURLs={false}
      allowFileAccessFromFileURLs={false}
      originWhitelist={['https://dirna.example']}
    />
  );
}
```
