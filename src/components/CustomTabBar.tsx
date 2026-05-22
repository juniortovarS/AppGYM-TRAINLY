import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, Modal } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Users, Trophy, Plus, Dumbbell, User, Sparkles, Calendar, Folder, X } from 'lucide-react-native';

import { useAppWidth } from '../hooks/useAppWidth';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors, typography } = useTheme();
  const SCREEN_WIDTH = useAppWidth();
  const TAB_BAR_WIDTH = SCREEN_WIDTH - 20;
  // We divide by 5 visually, even though there are 4 actual routes
  const TAB_WIDTH = TAB_BAR_WIDTH / 5;

  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Shared values for tab indicator
  const translateTabX = useSharedValue(0);
  const fabRotation = useSharedValue(0);
  const fabScale = useSharedValue(1);

  // Compute visual index to map 4 routes to 5 slots
  const getVisualIndex = (routeIndex: number) => {
    return routeIndex >= 2 ? routeIndex + 1 : routeIndex;
  };

  useEffect(() => {
    translateTabX.value = withSpring(getVisualIndex(state.index) * TAB_WIDTH, {
      damping: 18,
      stiffness: 150,
    });
  }, [state.index, TAB_WIDTH]);

  useEffect(() => {
    if (isModalOpen) {
      fabRotation.value = withSpring(45, { damping: 15 });
    } else {
      fabRotation.value = withSpring(0, { damping: 15 });
    }
  }, [isModalOpen]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateTabX.value }],
  }));

  const animatedFabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${fabRotation.value}deg` }],
  }));

  const animatedFabContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const getIcon = (routeName: string, color: string, focused: boolean) => {
    const size = 20;
    const weight = focused ? 2.5 : 2;
    switch (routeName) {
      case 'Amigos': return <Users size={size} color={color} strokeWidth={weight} />;
      case 'Rangos': return <Trophy size={size} color={color} strokeWidth={weight} />;
      case 'Explorar': return <Dumbbell size={size} color={color} strokeWidth={weight} />;
      case 'Perfil': return <User size={size} color={color} strokeWidth={weight} />;
      default: return null;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'Amigos': return 'Amigos';
      case 'Rangos': return 'Rangos';
      case 'Explorar': return 'Entrenar';
      case 'Perfil': return 'Perfil';
      default: return routeName;
    }
  };

  const handleFabPress = () => {
    fabScale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    setIsModalOpen(!isModalOpen);
  };

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const onPress = () => {
      // Close modal if open
      if (isModalOpen) setIsModalOpen(false);

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const activeColor = isFocused ? colors.primary : colors.textSecondary;

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.tabButton}
      >
        <View style={styles.iconWrapper}>
          {getIcon(route.name, activeColor, isFocused)}
          <Text style={[styles.labelText, { color: activeColor }]} numberOfLines={1}>
            {getLabel(route.name)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      {/* 
        =====================================
        MODAL GLOBAL DEL FAB
        =====================================
      */}
      {/* 
        =====================================
        TAB BAR (CONTAINS MODAL IN FRONT)
        =====================================
      */}
      <View style={styles.outerContainer} pointerEvents="box-none">
        {/* 
          =====================================
          MODAL GLOBAL DEL FAB (CUSTOM OVERLAY)
          =====================================
        */}
        {isModalOpen && (
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[
              StyleSheet.absoluteFillObject,
              styles.modalOverlay,
            ]}
          >
            <Pressable 
              style={StyleSheet.absoluteFillObject} 
              onPress={() => setIsModalOpen(false)}
            />
            <Animated.View 
              entering={SlideInDown.springify().damping(15)}
              exiting={SlideOutDown.springify().damping(15)}
              style={[
                styles.modalContent, 
                { backgroundColor: '#0D0D0F', borderColor: '#222226' }
              ]} 
            >
              <View style={[styles.dragHandle, { backgroundColor: '#2C2C35' }]} />
              
              <Text style={[styles.modalHeaderTitle, { color: '#FFF', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16, opacity: 0.5, textAlign: 'center' }]}>
                Crear Nuevo
              </Text>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.modalOption, 
                  { backgroundColor: pressed ? '#1C1C20' : '#141416', borderRadius: 16, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#222226' }
                ]}
              >
                <View style={[styles.modalIconBg, { borderColor: '#FFF', backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                  <Sparkles size={20} color="#FFF" />
                </View>
                <View style={styles.modalOptionTextCol}>
                  <Text style={styles.modalOptionTitle}>Entrenamiento con IA</Text>
                  <Text style={styles.modalOptionSub}>Genera un entrenamiento a tu medida</Text>
                </View>
              </Pressable>

              <Pressable 
                onPress={() => {
                  setIsModalOpen(false);
                  navigation.navigate('ActiveWorkout' as never);
                }}
                style={({ pressed }) => [
                  styles.modalOption, 
                  { backgroundColor: pressed ? '#1C1C20' : '#141416', borderRadius: 16, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#222226' }
                ]}
              >
                <View style={[styles.modalIconBg, { borderColor: '#4E4E52', backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                  <Dumbbell size={20} color="#AEAEB2" />
                </View>
                <View style={styles.modalOptionTextCol}>
                  <Text style={styles.modalOptionTitle}>Entrenamiento Vacío</Text>
                  <Text style={styles.modalOptionSub}>Añade ejercicios a medida que entrenas</Text>
                </View>
              </Pressable>

              <Pressable 
                onPress={() => {
                  setIsModalOpen(false);
                  navigation.navigate('CreateRoutine' as never);
                }}
                style={({ pressed }) => [
                  styles.modalOption, 
                  { backgroundColor: pressed ? '#1C1C20' : '#141416', borderRadius: 16, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#222226' }
                ]}
              >
                <View style={[styles.modalIconBg, { borderColor: '#4E4E52', backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                  <Calendar size={20} color="#AEAEB2" />
                </View>
                <View style={styles.modalOptionTextCol}>
                  <Text style={styles.modalOptionTitle}>Rutina</Text>
                  <Text style={styles.modalOptionSub}>Crea una rutina para usar más adelante</Text>
                </View>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.modalOption, 
                  { backgroundColor: pressed ? '#1C1C20' : '#141416', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#222226' }
                ]}
              >
                <View style={[styles.modalIconBg, { borderColor: '#4E4E52', backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                  <Folder size={20} color="#AEAEB2" />
                </View>
                <View style={styles.modalOptionTextCol}>
                  <Text style={styles.modalOptionTitle}>Planificación</Text>
                  <Text style={styles.modalOptionSub}>Crea un plan de entrenamiento semanal</Text>
                </View>
              </Pressable>

            </Animated.View>
          </Animated.View>
        )}

        <View style={[styles.container, { width: TAB_BAR_WIDTH, backgroundColor: '#000', borderColor: '#2C2C2E' }]}>
          {/* Background Indicator */}
          <Animated.View
            style={[
              styles.indicator,
              { width: TAB_WIDTH - 8, backgroundColor: `${colors.primary}12`, borderColor: colors.primary },
              animatedIndicatorStyle,
            ]}
          />

          {/* Render Tabs: [0], [1], [FAB], [2], [3] */}
          {renderTab(state.routes[0], 0)}
          {renderTab(state.routes[1], 1)}

          <Pressable onPress={handleFabPress} style={[styles.fabContainer, { width: TAB_WIDTH }]}>
            <Animated.View style={[styles.fabCircle, animatedFabContainerStyle, { backgroundColor: isModalOpen ? '#AEAEB2' : '#FFFFFF' }]}>
              <Animated.View style={animatedFabIconStyle}>
                <Plus size={32} color="#000" strokeWidth={2.5} />
              </Animated.View>
            </Animated.View>
          </Pressable>

          {renderTab(state.routes[2], 2)}
          {renderTab(state.routes[3], 3)}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
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
    gap: 4,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  indicator: {
    position: 'absolute',
    left: 4,
    height: 62,
    top: 3,
    borderRadius: 31,
    borderWidth: 1,
  },
  fabContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fabCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 110, // Leave space for TabBar
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderTitle: {
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalOptionTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  modalOptionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionSub: {
    color: '#AEAEB2',
    fontSize: 12,
  },
});
