import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}) => {
  const { colors, spacing, typography } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  // Button styles based on variants
  const buttonStyle = [
    styles.button,
    styles[size],
    {
      backgroundColor:
        variant === 'primary'
          ? colors.primary
          : variant === 'secondary'
          ? colors.secondary
          : variant === 'dark'
          ? colors.cardElevated
          : 'transparent',
      borderColor:
        variant === 'outline'
          ? colors.border
          : variant === 'dark'
          ? colors.border
          : 'transparent',
      borderWidth: variant === 'outline' || variant === 'dark' ? 1 : 0,
    },
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    {
      fontSize: size === 'lg' ? typography.sizes.md : typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color:
        variant === 'primary' || variant === 'secondary'
          ? colors.textInverse
          : colors.textPrimary,
    },
  ];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[buttonStyle, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'secondary'
              ? colors.textInverse
              : colors.primary
          }
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 38,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    height: 48,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    height: 56,
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
