import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { LabScreen } from '../../components/LabScreen';

// DIRNA-VULN:m1_client_cred_check — auth decided on the client with a hardcoded credential
const ADMIN_USER = 'admin', ADMIN_PASS = 'P@ssw0rd123';
function login(u:string,p:string){ return u===ADMIN_USER && p===ADMIN_PASS ? 'ADMIN GRANTED' : 'denied'; }

export default function M1ClientCredCheck() {
  const [u, setU] = useState('admin');
  const [p, setP] = useState('P@ssw0rd123');
  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={u} onChangeText={setU} autoCapitalize="none" />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={p} onChangeText={setP} autoCapitalize="none" />
      </View>
      <LabScreen
        title="Client-side hardcoded credential check"
        owasp={['M1', 'M3']}
        run={() => login(u, p)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16, paddingBottom: 0 },
  label: { color: '#666', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginTop: 4 },
});
