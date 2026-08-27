import React from 'react';
import CryptoJS from 'crypto-js';
import { LabScreen } from '../../components/LabScreen';
import { FAKE_AWS_KEY } from '../../lib/placeholders';
// DIRNA-VULN:m10_weak_crypto — AES-ECB, hardcoded key, static IV, Math.random token
export default function M10WeakCrypto(){ return <LabScreen title="Weak JS crypto" owasp={['M10']}
  run={()=>{ const key=CryptoJS.enc.Utf8.parse(FAKE_AWS_KEY.slice(0,16));
    const ct=CryptoJS.AES.encrypt('secret', key, { mode:CryptoJS.mode.ECB }).toString();
    const token=Math.random().toString(36).slice(2); // insecure randomness
    return `ECB ct=${ct} token=${token}`; }} />; }
