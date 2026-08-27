import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m6_secret_clipboard — secret copied to the system clipboard
export default function M6SecretClipboard(){ return <LabScreen title="Secret to clipboard" owasp={['M6']}
  run={async ()=>{ const t=await AsyncStorage.getItem('@auth_token'); Clipboard.setString(t||''); return 'copied token to clipboard'; }} />; }
