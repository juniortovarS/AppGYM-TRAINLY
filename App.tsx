import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    // Black background wrapper prevents any white flash while JS loads
    <View style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000000" />
        <AppNavigator />
        {showSplash && (
          <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
        )}
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
