import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AnimatePresence } from 'moti';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import { useActivityStore } from '../store/useActivityStore';
import { GlobalWorkoutToast } from '../components/GlobalWorkoutToast';

// Import Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { TrainingHomePage } from '../modules/training/pages/TrainingHomePage';
import { EjerciciosScreen } from '../screens/EjerciciosScreen';
import { HistorialScreen } from '../screens/HistorialScreen';
import { AmigosScreen } from '../screens/AmigosScreen';
import { RangosScreen } from '../screens/RangosScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ExploreWorkoutsPage } from '../modules/training/pages/ExploreWorkoutsPage';

// Import Custom Tab Bar
import { CustomTabBar } from '../components/CustomTabBar';

// Import Modules
import { CreateRoutinePage } from '../modules/training/pages/CreateRoutinePage';
import { ActiveWorkoutPage } from '../modules/training/pages/ActiveWorkoutPage';
import { ExerciseDetailPage } from '../modules/training/pages/ExerciseDetailPage';
import { RoutineDetailPage } from '../modules/training/pages/RoutineDetailPage';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Amigos: undefined;
  Rangos: undefined;
  Explorar: undefined;
  Perfil: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  CreateRoutine: undefined;
  ActiveWorkout: undefined;
  ExerciseDetail: { exerciseId: string };
  RoutineDetail: { routineId: string };
  Ejercicios: undefined; // Ahora fuera de la tab bar
  Historial: undefined;  // Ahora fuera de la tab bar (o podríamos dejarla si la reestructuramos)
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Amigos" component={AmigosScreen} />
      <Tab.Screen name="Rangos" component={RangosScreen} />
      {/* El botón + lo inyectaremos visualmente desde CustomTabBar */}
      <Tab.Screen name="Explorar" component={ExploreWorkoutsPage} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
    >
      <MainStack.Screen name="Tabs" component={TabNavigator} />
      <MainStack.Screen name="CreateRoutine" component={CreateRoutinePage} />
      <MainStack.Screen name="ActiveWorkout" component={ActiveWorkoutPage} />
      <MainStack.Screen name="ExerciseDetail" component={ExerciseDetailPage} />
      <MainStack.Screen name="RoutineDetail" component={RoutineDetailPage} />
      <MainStack.Screen name="Ejercicios" component={EjerciciosScreen} />
      <MainStack.Screen name="Historial" component={HistorialScreen} />
    </MainStack.Navigator>
  );
};

export const AppNavigator = () => {
  const { isLoggedIn } = useAuthStore();
  const { colors } = useTheme();
  const { showWorkoutCompletedToast } = useActivityStore();

  const MyTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.card,
      border: colors.border,
      text: colors.textPrimary,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer theme={MyTheme}>
        {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>

      <AnimatePresence>
        {showWorkoutCompletedToast && <GlobalWorkoutToast />}
      </AnimatePresence>
    </View>
  );
};

