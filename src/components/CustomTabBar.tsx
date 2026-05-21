import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Dumbbell, Search, History, User } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH - 32; // Floating tab bar
const TAB_WIDTH = TAB_BAR_WIDTH / 4;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  
  // Shared value for active tab position
  const translateTabX = useSharedValue(0);

  useEffect(() => {
    // Smooth transition between tabs
    translateTabX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 18,
      stiffness: 150,
    });
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateTabX.value }],
  }));

  const getIcon = (routeName: string, color: string, focused: boolean) => {
    const size = 18;
    switch (routeName) {
      case 'Entrenar':
        return <Dumbbell size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
      case 'Ejercicios':
        return <Search size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
      case 'Historial':
        return <History size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
      case 'Perfil':
        return <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
      default:
        return <Dumbbell size={size} color={color} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'Entrenar':
        return 'Entrenar';
      case 'Ejercicios':
        return 'Buscar';
      case 'Historial':
        return 'Historial';
      case 'Perfil':
        return 'Perfil';
      default:
        return routeName;
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Animated Background Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: `${colors.primary}12`, borderColor: colors.primary },
            animatedIndicatorStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const activeColor = isFocused ? colors.primary : colors.textSecondary;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={styles.iconWrapper}>
                {getIcon(route.name, activeColor, isFocused)}
                <Text style={[styles.labelText, { color: activeColor }]}>
                  {getLabel(route.name)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    width: TAB_BAR_WIDTH,
    height: 72, // Increased height to accommodate icon + text label beautifully
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4, // gap between icon and text label
  },
  labelText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  indicator: {
    position: 'absolute',
    left: 4,
    width: TAB_WIDTH - 8,
    height: 60, // Increased height matching container
    top: 5,
    borderRadius: 18,
    borderWidth: 1.5,
  },
});
