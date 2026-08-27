import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Linking } from 'react-native';
import { LabScreen } from '../../components/LabScreen';

// DIRNA-VULN:m4_deeplink_sink — deep-link 'next' param used without validation
export function handleDeepLink(url:string){ const next=new URL(url).searchParams.get('next')||''; Linking.openURL(next); return `openURL(${next})`; }

export default function M4DeeplinkSink() {
  const [url, setUrl] = useState('dirna://open?next=http://dirna.invalid/evil');
  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Deep-link URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <LabScreen
        title="Insecure deep-link handler"
        owasp={['M4']}
        run={() => handleDeepLink(url)}
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
