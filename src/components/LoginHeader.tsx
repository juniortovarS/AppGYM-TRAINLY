import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MotiView, MotiText } from 'moti';
import { useTheme } from '../hooks/useTheme';

export const LoginHeader: React.FC = () => {
  const { colors, typography } = useTheme();

  const letters = ['T', 'R', 'A', 'I', 'N', 'L', 'Y'];

  return (
    <View style={styles.logoContainer}>
      {/* Logo Image */}
      <MotiView
        from={{ opacity: 0, scale: 0.4, rotate: '-20deg' }}
        animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
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
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 90,
              delay: 300 + index * 60, // staggered delay
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
        animate={{ opacity: 0.8, translateY: 0 }}
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
