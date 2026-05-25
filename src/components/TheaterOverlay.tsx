import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

interface TheaterOverlayProps {
  onComplete: () => void;
}

export const TheaterOverlay: React.FC<TheaterOverlayProps> = ({ onComplete }) => {
  const containerRef = useRef<any>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (Platform.OS === 'web' && containerRef.current) {
      try {
        const { gsap } = require('gsap');
        const el = containerRef.current;
        const leftPanel = el.querySelector('.theater-left');
        const rightPanel = el.querySelector('.theater-right');

        console.log('TheaterOverlay [WEB]: Starting split animation...');
        
        const tl = gsap.timeline({
          onComplete: onComplete
        });

        // Theater split animation: slide left and right panels outwards
        tl.to(leftPanel, {
          xPercent: -100,
          duration: 1.2,
          ease: 'power3.inOut'
        });
        tl.to(rightPanel, {
          xPercent: 100,
          duration: 1.2,
          ease: 'power3.inOut'
        }, 0); // start concurrently
      } catch (e) {
        console.error('TheaterOverlay [WEB]: GSAP animation error:', e);
        onComplete();
      }
    } else if (Platform.OS !== 'web') {
      // Trigger completion on Native after the Moti animation duration (1000ms + buffer)
      const timer = setTimeout(() => {
        onComplete();
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  if (Platform.OS === 'web') {
    const WebContainer = View as any;
    const WebLeft = View as any;
    const WebRight = View as any;

    return (
      <WebContainer ref={containerRef} style={styles.overlayContainer}>
        {/* Left Panel */}
        <WebLeft className="theater-left" style={styles.leftPanel}>
          <Image
            source={require('../../assets/logo.png')}
            style={[styles.logoImageLeft, { right: -130 }]}
            contentFit="contain"
          />
        </WebLeft>
        
        {/* Right Panel */}
        <WebRight className="theater-right" style={styles.rightPanel}>
          <Image
            source={require('../../assets/logo.png')}
            style={[styles.logoImageRight, { left: -130 }]}
            contentFit="contain"
          />
        </WebRight>
      </WebContainer>
    );
  }

  // Native Mobile Rendering using Moti dynamically
  const { MotiView } = require('moti');

  return (
    <View style={styles.overlayContainer}>
      {/* Left Panel */}
      <MotiView
        from={{ translateX: 0 }}
        animate={{ translateX: -width / 2 }}
        transition={{ type: 'timing', duration: 1000, ease: 'easeInOut' }}
        style={styles.leftPanel}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={[styles.logoImageLeft, { right: -130 }]}
          contentFit="contain"
        />
      </MotiView>

      {/* Right Panel */}
      <MotiView
        from={{ translateX: 0 }}
        animate={{ translateX: width / 2 }}
        transition={{ type: 'timing', duration: 1000, ease: 'easeInOut' }}
        style={styles.rightPanel}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={[styles.logoImageRight, { left: -130 }]}
          contentFit="contain"
        />
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 99999,
  },
  leftPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: '#111',
  },
  rightPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderLeftColor: '#111',
  },
  logoImageLeft: {
    position: 'absolute',
    width: 260,
    height: 260,
    top: '50%',
    marginTop: -130,
  },
  logoImageRight: {
    position: 'absolute',
    width: 260,
    height: 260,
    top: '50%',
    marginTop: -130,
  },
});
