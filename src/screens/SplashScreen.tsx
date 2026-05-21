import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Entrance: spring scale-in + fade in
    scale.value = withSpring(1.0, { damping: 12, stiffness: 90 });
    opacity.value = withTiming(1, { duration: 700 });

    // After 2 seconds, fade out and tell the parent to move on
    const exitTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onAnimationComplete)();
      });
    }, 4000);

    return () => clearTimeout(exitTimer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          contentFit="contain"
          transition={0}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 260,
    height: 260,
  },
});
