import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { width } = useWindowDimensions();
  const frameRef = useRef<any>(null);

  const isWebDesktop = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    // Native browser scrolling (wheel/trackpad) and native text input focus
    // are fully sufficient. Custom drag-to-scroll is removed to prevent focus loss.
  }, []);

  const appContent = (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#000000" />
      <AppNavigator />
      {showSplash && (
        <SplashScreen onAnimationComplete={() => setShowSplash(false)} />
      )}
    </SafeAreaProvider>
  );

  return (
    <View style={styles.root}>
      {isWebDesktop ? (
        <View style={styles.webDesktopBackground}>
          {/* Decorative ambient glowing circles */}
          <View style={styles.glowCircle1} />
          <View style={styles.glowCircle2} />
          
          <View ref={frameRef} style={styles.appCardFrame}>
            {appContent}
          </View>
        </View>
      ) : (
        appContent
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webDesktopBackground: {
    flex: 1,
    backgroundColor: '#050508',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle1: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.04)', // subtle white glow
    top: -200,
    left: -100,
    // On web, blur is supported
    // @ts-ignore
    filter: 'blur(100px)',
  },
  glowCircle2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // subtle monochromatic white/gray glow
    bottom: -150,
    right: -100,
    // @ts-ignore
    filter: 'blur(100px)',
  },
  appCardFrame: {
    width: 480,
    height: '92%',
    maxHeight: 900,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#1C1C24',
    overflow: 'hidden',
    backgroundColor: '#000000',
    // Premium shadow for web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    // @ts-ignore
    elevation: 20,
  },
});

