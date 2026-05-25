import React from 'react';
import { View, ActivityIndicator, Platform, Text, Pressable } from 'react-native';
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
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TrainingHomePage } from '../modules/training/pages/TrainingHomePage';
import { EjerciciosScreen } from '../screens/EjerciciosScreen';
import { HistorialScreen } from '../screens/HistorialScreen';
import { AmigosScreen } from '../screens/AmigosScreen';
import { RangosScreen } from '../screens/RangosScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ExploreWorkoutsPage } from '../modules/training/pages/ExploreWorkoutsPage';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';

// Import Custom Tab Bar
import { CustomTabBar } from '../components/CustomTabBar';
import { TheaterOverlay } from '../components/TheaterOverlay';

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
  AdminDashboard: undefined;
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
  const { user } = useAuthStore();
  const isAdmin = user && user.email === 'admintrainly@gmail.com';

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
      initialRouteName="Tabs"
    >
      <MainStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
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

const linking = {
  prefixes: [
    Platform.OS === 'web' ? (typeof window !== 'undefined' ? window.location.origin : '') : 'trainly://',
    'trainly://',
  ],
  config: {
    screens: {
      Tabs: {
        path: '',
        screens: {
          Amigos: 'amigos',
          Rangos: 'rangos',
          Explorar: 'explorar',
          Perfil: 'perfil',
        },
      },
      CreateRoutine: 'create-routine',
      ActiveWorkout: 'active-workout',
      ExerciseDetail: 'exercise-detail/:exerciseId',
      RoutineDetail: 'routine-detail/:routineId',
      Ejercicios: 'ejercicios',
      Historial: 'historial',
      Login: 'login',
      Register: 'register',
      AdminDashboard: 'admin',
    },
  },
};

const DebugBypass = ({ colors }: { colors: any }) => {
  const [show, setShow] = React.useState(false);
  const { isLoggedIn, user, isLoading } = useAuthStore();

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <View style={{ marginTop: 40, alignItems: 'center', width: '100%' }}>
      <Text style={{ color: '#ff4444', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
        El inicio de sesión está tardando más de lo esperado.
      </Text>
      <Text style={{ color: '#666', fontSize: 11, marginBottom: 20, textAlign: 'center' }}>
        Estado: isLoading={String(isLoading)}, isLoggedIn={String(isLoggedIn)}, user={user ? 'Definido' : 'Null'}
      </Text>
      <Pressable
        onPress={() => {
          useAuthStore.setState({ isLoading: false });
        }}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#333',
          backgroundColor: '#111',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13 }}>Continuar de todos modos</Text>
      </Pressable>
    </View>
  );
};

export const AppNavigator = () => {
  const { isLoggedIn, user, isLoading } = useAuthStore();
  const { colors } = useTheme();
  const { showWorkoutCompletedToast } = useActivityStore();

  const [showTheater, setShowTheater] = React.useState(false);
  const [prevIsLoggedIn, setPrevIsLoggedIn] = React.useState(isLoggedIn);

  React.useEffect(() => {
    if (isLoggedIn && !prevIsLoggedIn) {
      console.log('AppNavigator: Login detected! Triggering theater transition overlay.');
      setShowTheater(true);
    }
    setPrevIsLoggedIn(isLoggedIn);
  }, [isLoggedIn, prevIsLoggedIn]);

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

  const showOnboarding = isLoggedIn && user && !user.hasCompletedOnboarding;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: '#888', marginTop: 20, fontSize: 14 }}>Iniciando sesión en Trainly...</Text>
        <DebugBypass colors={colors} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer theme={MyTheme} linking={linking}>
        {showOnboarding ? (
          <OnboardingScreen />
        ) : isLoggedIn ? (
          <MainNavigator />
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>

      {showTheater && (
        <TheaterOverlay onComplete={() => {
          console.log('AppNavigator: Theater overlay animation completed.');
          setShowTheater(false);
        }} />
      )}

      <AnimatePresence>
        {showWorkoutCompletedToast && <GlobalWorkoutToast />}
      </AnimatePresence>
    </View>
  );
};

