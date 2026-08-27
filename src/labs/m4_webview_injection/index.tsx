import React from 'react';
import { WebView } from 'react-native-webview';
// DIRNA-VULN:m4_webview_injection — user data injected into the page + file access enabled
export default function M4WebviewInjection(){ const userName='<img src=x onerror=alert(document.cookie)>';
  return <WebView source={{ html:`<h1>Hi ${userName}</h1>` }} injectedJavaScript={`document.title='${userName}';true;`}
    javaScriptEnabled allowFileAccess allowUniversalAccessFromFileURLs originWhitelist={['*']} />; }
