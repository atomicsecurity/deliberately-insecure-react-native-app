import React, { useState } from 'react';
import { Text, Button, ScrollView } from 'react-native';
export function LabScreen({ title, owasp, run }:{ title:string; owasp:string[]; run:()=>Promise<string>|string; }) {
  const [out, setOut] = useState('');
  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      <Text style={{ color:'#b00', fontWeight:'700' }}>⚠️ Intentionally vulnerable — educational only</Text>
      <Text style={{ fontSize:18, fontWeight:'700', marginVertical:8 }}>{title}</Text>
      <Text style={{ color:'#666', marginBottom:12 }}>{owasp.join(' · ')}</Text>
      <Button title="Run this lab" onPress={async ()=>setOut(String(await run()))} />
      {!!out && <Text selectable style={{ marginTop:16, fontFamily:'monospace' }}>{out}</Text>}
    </ScrollView>
  );
}
