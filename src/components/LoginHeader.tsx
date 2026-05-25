import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';

export const LoginHeader: React.FC = () => {
  const { colors, typography } = useTheme();
  const containerRef = useRef<any>(null);
  
  // Listen to splash screen completion state
  const isSplashCompleted = useAuthStore((state) => state.isSplashCompleted);

  const letters = ['T', 'R', 'A', 'I', 'N', 'L', 'Y'];

  useEffect(() => {
    // Only run GSAP on Web when the splash screen has completed
    if (Platform.OS === 'web' && isSplashCompleted && containerRef.current) {
      try {
        // Lazy-load GSAP to prevent native crash
        const { gsap } = require('gsap');
        const el = containerRef.current;
        console.log('LoginHeader [WEB]: Initializing GSAP after splash. Container:', el);
        
        const logo = el.querySelector('.login-logo');
        const lettersElements = el.querySelectorAll('.login-letter');
        const tagline = el.querySelector('.login-tagline');

        console.log('LoginHeader [WEB]: Selected elements:', {
          logo,
          lettersCount: lettersElements.length,
          tagline
        });

        const tl = gsap.timeline();

        // 1. Logo animation: elastic scale and rotation
        tl.fromTo(logo,
          { opacity: 0, scale: 0.4, rotation: -20 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.5)' }
        );

        // 2. Letters animation: staggered slide down with elastic bounce
        tl.fromTo(lettersElements,
          { opacity: 0, y: -50, scale: 0.3, rotateY: 90 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: 'elastic.out(1, 0.5)',
          },
          '-=0.5' // overlaps with logo animation
        );

        // 3. Tagline animation: tracking-in and fade in
        tl.fromTo(tagline,
          { opacity: 0, y: 15, letterSpacing: '4px' },
          { opacity: 0.8, y: 0, letterSpacing: '0px', duration: 0.7, ease: 'power3.out' },
          '-=0.4'
        );
      } catch (e) {
        console.error('LoginHeader [WEB]: GSAP animation error:', e);
      }
    }
  }, [colors, isSplashCompleted]);

  if (Platform.OS === 'web') {
    // Cast to any to bypass React Native Web classname type restrictions in TypeScript
    const WebContainer = View as any;
    const WebLogoWrapper = View as any;
    const WebLettersContainer = View as any;
    const WebLetter = Text as any;
    const WebTagline = Text as any;

    return (
      <WebContainer 
        ref={containerRef} 
        style={[
          styles.logoContainer, 
          { 
            // Stay hidden until the splash screen is dismissed to prevent flashing
            opacity: isSplashCompleted ? 1 : 0 
          }
        ]}
      >
        {/* Logo Image */}
        <WebLogoWrapper className="login-logo" style={styles.logoWrapper}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </WebLogoWrapper>

        {/* Letters "TRAINLY" */}
        <WebLettersContainer style={styles.lettersContainer}>
          {letters.map((char, index) => (
            <WebLetter
              key={index}
              className="login-letter"
              style={[
                styles.logoTextChar,
                {
                  color: index >= 5 ? colors.primary : colors.textPrimary,
                  fontSize: typography.sizes.display,
                  fontWeight: typography.weights.heavy,
                  // Enable block transforms for web
                  // @ts-ignore
                  display: 'inline-block',
                },
              ]}
            >
              {char}
            </WebLetter>
          ))}
        </WebLettersContainer>

        {/* Tagline */}
        <WebTagline
          className="login-tagline"
          style={[
            styles.tagline,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
            },
          ]}
        >
          Performance & Elite Fitness Tracking
        </WebTagline>
      </WebContainer>
    );
  }

  // Native Mobile Rendering using Moti dynamically
  const { MotiView, MotiText } = require('moti');

  return (
    <View style={styles.logoContainer}>
      {/* Logo Image */}
      <MotiView
        from={{ opacity: 0, scale: 0.4, rotate: '-20deg' }}
        animate={{ 
          opacity: isSplashCompleted ? 1 : 0, 
          scale: isSplashCompleted ? 1 : 0.4, 
          rotate: isSplashCompleted ? '0deg' : '-20deg' 
        }}
        transition={{ type: 'spring', damping: 15, delay: 100 }}
        style={styles.logoWrapper}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          contentFit="contain"
        />
      </MotiView>

      {/* Letters "TRAINLY" */}
      <View style={styles.lettersContainer}>
        {letters.map((char, index) => (
          <MotiText
            key={index}
            from={{ opacity: 0, translateY: -40, scale: 0.3 }}
            animate={{ 
              opacity: isSplashCompleted ? 1 : 0, 
              translateY: isSplashCompleted ? 0 : -40, 
              scale: isSplashCompleted ? 1 : 0.3 
            }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 90,
              delay: 300 + index * 60,
            }}
            style={[
              styles.logoTextChar,
              {
                color: index >= 5 ? colors.primary : colors.textPrimary,
                fontSize: typography.sizes.display,
                fontWeight: typography.weights.heavy,
              },
            ]}
          >
            {char}
          </MotiText>
        ))}
      </View>

      {/* Tagline */}
      <MotiText
        from={{ opacity: 0, translateY: 15 }}
        animate={{ 
          opacity: isSplashCompleted ? 0.8 : 0, 
          translateY: isSplashCompleted ? 0 : 15 
        }}
        transition={{ type: 'timing', duration: 700, delay: 800 }}
        style={[
          styles.tagline,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
          },
        ]}
      >
        Performance & Elite Fitness Tracking
      </MotiText>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    marginBottom: 12,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  lettersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextChar: {
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 6,
    opacity: 0.8,
    textAlign: 'center',
  },
});
