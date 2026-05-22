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
    if (Platform.OS !== 'web') return;
    const element = frameRef.current;
    if (!element) return;

    let isDown = false;
    let startY = 0;
    let startX = 0;
    let scrollTop = 0;
    let scrollLeft = 0;
    let activeScrollable: HTMLElement | null = null;

    const getScrollParent = (node: HTMLElement | null): HTMLElement | null => {
      if (!node || node === element) return null;
      const overflowY = window.getComputedStyle(node).overflowY;
      const overflowX = window.getComputedStyle(node).overflowX;
      const isScrollableY = node.scrollHeight > node.clientHeight && (overflowY === 'auto' || overflowY === 'scroll');
      const isScrollableX = node.scrollWidth > node.clientWidth && (overflowX === 'auto' || overflowX === 'scroll');
      if (isScrollableY || isScrollableX) {
        return node;
      }
      return getScrollParent(node.parentElement);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click

      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'button' ||
        tag === 'select' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        return;
      }

      isDown = true;
      startY = e.pageY;
      startX = e.pageX;
      activeScrollable = getScrollParent(target);

      if (activeScrollable) {
        scrollTop = activeScrollable.scrollTop;
        scrollLeft = activeScrollable.scrollLeft;
        element.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown || !activeScrollable) return;
      e.preventDefault();

      const y = e.pageY;
      const x = e.pageX;

      // Scroll vertically
      const deltaY = (y - startY) * 1.5;
      activeScrollable.scrollTop = scrollTop - deltaY;

      // Scroll horizontally
      const deltaX = (x - startX) * 1.5;
      activeScrollable.scrollLeft = scrollLeft - deltaX;
    };

    const handleMouseUpOrLeave = () => {
      if (isDown) {
        isDown = false;
        element.style.cursor = 'default';
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUpOrLeave);
    element.addEventListener('mouseleave', handleMouseUpOrLeave);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUpOrLeave);
      element.removeEventListener('mouseleave', handleMouseUpOrLeave);
    };
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

