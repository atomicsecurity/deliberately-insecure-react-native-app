/**
 * DIRNA — deliberately-insecure-react-native
 * Intentionally vulnerable app for educational / scanner-testing purposes.
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/components/HomeScreen';
import { LABS } from './src/labs/registry';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#b00020' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          title: 'DIRNA — Deliberately Insecure',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        {LABS.map((lab) => (
          <Stack.Screen key={lab.slug} name={lab.slug} component={lab.screen} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
