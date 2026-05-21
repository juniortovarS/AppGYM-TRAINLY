import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';

// Import Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { EntrenarScreen } from '../screens/EntrenarScreen';
import { EjerciciosScreen } from '../screens/EjerciciosScreen';
import { HistorialScreen } from '../screens/HistorialScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Import Custom Tab Bar
import { CustomTabBar } from '../components/CustomTabBar';

// Define Stack/Tab Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Entrenar: undefined;
  Ejercicios: undefined;
  Historial: undefined;
  Perfil: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

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
      <Tab.Screen name="Entrenar" component={EntrenarScreen} />
      <Tab.Screen name="Ejercicios" component={EjerciciosScreen} />
      <Tab.Screen name="Historial" component={HistorialScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isLoggedIn } = useAuthStore();
  const { colors } = useTheme();

  // Custom Navigation Dark Theme
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
    <NavigationContainer theme={MyTheme}>
      {isLoggedIn ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
