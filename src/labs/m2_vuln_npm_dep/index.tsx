import React from 'react';
import merge from 'lodash/merge';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m2_vuln_npm_dep — lodash@4.17.11 (CVE-2019-10744) shipped in the bundle
export default function M2VulnNpmDep(){ return <LabScreen title="Vulnerable npm dependency (lodash 4.17.11)" owasp={['M2']}
  run={()=>{ const o:any={}; merge({}, JSON.parse('{"__proto__":{"polluted":"yes"}}')); return `lodash merge ran; ({}).polluted = ${({} as any).polluted}`; }} />; }
