import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LabScreen } from '../../components/LabScreen';
import { FAKE_JWT } from '../../lib/placeholders';
export default function M1AsyncStorageToken() {
  return <LabScreen title="Auth token in plaintext AsyncStorage" owasp={['M1','M9']}
    run={async () => {
      // DIRNA-VULN:m1_asyncstorage_token — secret written to unencrypted AsyncStorage
      await AsyncStorage.setItem('@auth_token', FAKE_JWT);
      await AsyncStorage.setItem('@user_password', 'P@ssw0rd123');
      return 'Wrote @auth_token + @user_password to AsyncStorage (plaintext).';
    }} />;
}
