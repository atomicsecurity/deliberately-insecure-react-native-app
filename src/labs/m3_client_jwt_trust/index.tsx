import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { LabScreen } from '../../components/LabScreen';
import { FAKE_JWT } from '../../lib/placeholders';

// atob is provided by the Hermes runtime; declare it for the type-checker only.
declare const atob: (data: string) => string;

// DIRNA-VULN:m3_client_jwt_trust — decode JWT payload client-side, trust role, never verify signature
function isAdmin(jwt:string){ const p=JSON.parse(atob(jwt.split('.')[1]||'e30=')); return p.role==='admin'; }

export default function M3ClientJwtTrust() {
  const [jwt, setJwt] = useState(FAKE_JWT);
  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>JWT</Text>
        <TextInput
          style={styles.input}
          value={jwt}
          onChangeText={setJwt}
          autoCapitalize="none"
          multiline
        />
      </View>
      <LabScreen
        title="Client-side JWT role trust"
        owasp={['M3']}
        run={() =>
          isAdmin(jwt)
            ? 'ADMIN GRANTED (role trusted client-side, signature never verified)'
            : 'not admin'
        }
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
