import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m6_pii_logged — secret written to the log
export default function M6PiiLogged(){ return <LabScreen title="Secret logged" owasp={['M6']}
  run={async ()=>{ const t=await AsyncStorage.getItem('@auth_token'); console.log('DEBUG auth token =', t); return 'logged token via console.log'; }} />; }
