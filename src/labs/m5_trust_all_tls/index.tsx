import React from 'react';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m5_trust_all_tls — TLS validation effectively disabled via NSC user-cert trust + no pinning
export default function M5TrustAllTls(){ return <LabScreen title="Trust-all TLS / no certificate pinning" owasp={['M5']}
  run={()=>'TLS validation disabled via network_security_config.xml (user-cert trust) + no pinning — see android/app/src/main/res/xml/network_security_config.xml'} />; }
