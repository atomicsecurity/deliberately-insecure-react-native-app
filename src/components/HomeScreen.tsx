import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { LABS, type Lab } from '../labs/registry';

export function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.warning}>⚠️ Intentionally vulnerable — educational only</Text>
      <FlatList
        data={LABS}
        keyExtractor={(lab) => lab.slug}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No labs yet</Text>}
        renderItem={({ item }: { item: Lab }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate(item.slug)}
          >
            <View style={styles.rowText}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.owasp}>{item.owasp.join(' · ')}</Text>
            </View>
            <Text style={[styles.badge, styles[item.coverage]]}>{item.coverage}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  warning: { color: '#b00', fontWeight: '700', padding: 16, paddingBottom: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  empty: { color: '#666', textAlign: 'center', marginTop: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  rowText: { flex: 1, paddingRight: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  owasp: { color: '#666', marginTop: 2 },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
  },
  detected: { backgroundColor: '#1a7f37' },
  partial: { backgroundColor: '#bf8700' },
  planned: { backgroundColor: '#6e7781' },
});
