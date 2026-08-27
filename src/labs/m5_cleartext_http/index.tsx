import React from 'react';
import { LabScreen } from '../../components/LabScreen';
import { CLEARTEXT_HOST } from '../../lib/placeholders';
// DIRNA-VULN:m5_cleartext_http — request over plaintext HTTP
export default function M5CleartextHttp(){ return <LabScreen title="Cleartext HTTP endpoint" owasp={['M5']}
  run={async ()=>{ try{ await fetch(`${CLEARTEXT_HOST}/api/login`); }catch{} return `fetch('${CLEARTEXT_HOST}/api/login')`; }} />; }
