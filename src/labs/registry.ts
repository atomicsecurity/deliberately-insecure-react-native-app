import type { ComponentType } from 'react';
import M1HardcodedSecret from './m1_hardcoded_secret';
import M1AsyncStorageToken from './m1_asyncstorage_token';
import M1ClientCredCheck from './m1_client_cred_check';
import M2VulnNpmDep from './m2_vuln_npm_dep';
import M3ClientJwtTrust from './m3_client_jwt_trust';
import M4DeeplinkSink from './m4_deeplink_sink';
import M4WebviewInjection from './m4_webview_injection';
import M4InsecureNativeModule from './m4_insecure_native_module';
import M5CleartextHttp from './m5_cleartext_http';
import M5TrustAllTls from './m5_trust_all_tls';
import M5SecretExfil from './m5_secret_exfil';
import M6PiiLogged from './m6_pii_logged';
import M6SecretClipboard from './m6_secret_clipboard';
import M7SourcemapShipped from './m7_sourcemap_shipped';
import M7NoHardening from './m7_no_hardening';
import M8ExportedDeeplink from './m8_exported_deeplink';
import M8BackupCleartext from './m8_backup_cleartext';
import M10WeakCrypto from './m10_weak_crypto';
export type Owasp = 'M1'|'M2'|'M3'|'M4'|'M5'|'M6'|'M7'|'M8'|'M9'|'M10';
export type Coverage = 'detected'|'partial'|'planned';
export interface Lab {
  slug: string; title: string; owasp: Owasp[]; coverage: Coverage;
  screen: ComponentType<any>;
}
export const LABS: Lab[] = [
  { slug:'m1_hardcoded_secret', title:'Hardcoded secret in the bundle', owasp:['M1'], coverage:'detected', screen: M1HardcodedSecret },
  { slug:'m1_asyncstorage_token', title:'Auth token in plaintext AsyncStorage', owasp:['M1','M9'], coverage:'detected', screen: M1AsyncStorageToken },
  { slug:'m1_client_cred_check', title:'Client-side hardcoded credential check', owasp:['M1','M3'], coverage:'partial', screen: M1ClientCredCheck },
  { slug:'m2_vuln_npm_dep', title:'Vulnerable npm dependency (lodash 4.17.11)', owasp:['M2'], coverage:'planned', screen: M2VulnNpmDep },
  { slug:'m3_client_jwt_trust', title:'Client-side JWT role trust', owasp:['M3'], coverage:'partial', screen: M3ClientJwtTrust },
  { slug:'m4_deeplink_sink', title:'Insecure deep-link handler', owasp:['M4'], coverage:'detected', screen: M4DeeplinkSink },
  { slug:'m4_webview_injection', title:'WebView injectedJavaScript + file access', owasp:['M4'], coverage:'partial', screen: M4WebviewInjection },
  { slug:'m4_insecure_native_module', title:'Insecure native module (exec / readFile)', owasp:['M4','M8'], coverage:'partial', screen: M4InsecureNativeModule },
  { slug:'m5_cleartext_http', title:'Cleartext HTTP endpoint', owasp:['M5'], coverage:'detected', screen: M5CleartextHttp },
  { slug:'m5_trust_all_tls', title:'Trust-all TLS / no certificate pinning', owasp:['M5'], coverage:'detected', screen: M5TrustAllTls },
  { slug:'m5_secret_exfil', title:'Secret exfil to cleartext', owasp:['M5'], coverage:'detected', screen: M5SecretExfil },
  { slug:'m6_pii_logged', title:'Secret logged', owasp:['M6'], coverage:'detected', screen: M6PiiLogged },
  { slug:'m6_secret_clipboard', title:'Secret to clipboard', owasp:['M6'], coverage:'detected', screen: M6SecretClipboard },
  { slug:'m7_sourcemap_shipped', title:'Source map shipped in the release build', owasp:['M7'], coverage:'detected', screen: M7SourcemapShipped },
  { slug:'m7_no_hardening', title:'Debuggable + no root detection + no obfuscation', owasp:['M7'], coverage:'detected', screen: M7NoHardening },
  { slug:'m8_exported_deeplink', title:'Exported component + insecure deep-link intent-filter', owasp:['M8'], coverage:'detected', screen: M8ExportedDeeplink },
  { slug:'m8_backup_cleartext', title:'allowBackup=true + cleartext-permitted NSC', owasp:['M8'], coverage:'detected', screen: M8BackupCleartext },
  { slug:'m10_weak_crypto', title:'Weak JS crypto', owasp:['M10'], coverage:'partial', screen: M10WeakCrypto },
];
