import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Eye, EyeOff } from 'lucide-react-native';
import { Image } from 'expo-image';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const { login, loginWithGoogle, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEmailLoggingIn, setIsEmailLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    setErrorMsg('');
    setIsEmailLoggingIn(true);
    try {
      await login(email, password);
      setIsEmailLoggingIn(false);
    } catch (error: any) {
      let msg = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      if (msg.toLowerCase().includes('rate limit')) {
        msg = 'Se ha excedido el límite de solicitudes de Supabase. Por favor, espera unos minutos o utiliza "Continuar con Google".';
      }
      setErrorMsg(msg);
      setIsEmailLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsGoogleLoggingIn(true);
    try {
      await loginWithGoogle();
      setIsGoogleLoggingIn(false);
    } catch (error: any) {
      let msg = error.message || 'Error al iniciar sesión con Google.';
      if (msg.toLowerCase().includes('rate limit')) {
        msg = 'Se ha excedido el límite de solicitudes. Por favor, espera unos minutos.';
      }
      setErrorMsg(msg);
      setIsGoogleLoggingIn(false);
    }
  };

  const renderContent = () => (
    <View style={styles.inner}>

      {/* Logo and Header Section */}
      <MotiView
        from={{ opacity: 0, scale: 0.8, translateY: -20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        style={styles.logoContainer}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          contentFit="contain"
        />
        <Text style={[styles.logoText, { color: colors.textPrimary, fontSize: typography.sizes.display, fontWeight: typography.weights.heavy }]}>
          TRAIN<Text style={{ color: colors.primary }}>LY</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
          Performance & Elite Fitness Tracking
        </Text>
      </MotiView>

      {/* Form Section */}
      <View style={styles.formContainer}>

        {errorMsg ? (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={[styles.errorBox, { borderColor: colors.accentRed }]}
          >
            <Text style={[styles.errorText, { color: colors.accentRed, fontSize: typography.sizes.xs }]}>
              {errorMsg}
            </Text>
          </MotiView>
        ) : null}

        {/* Email Input */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
          style={styles.inputWrapper}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            CORREO ELECTRÓNICO
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.card,
                borderColor: isEmailFocused ? colors.primary : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMsg('');
              }}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              style={[styles.input, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
              placeholder="ejemplo@trainly.io"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </MotiView>

        {/* Password Input */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.inputWrapper}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            CONTRASEÑA
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.card,
                borderColor: isPasswordFocused ? colors.primary : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMsg('');
              }}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              style={[styles.input, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
              placeholder="••••••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? (
                <EyeOff size={18} color={colors.textSecondary} />
              ) : (
                <Eye size={18} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>
        </MotiView>

        {/* Login Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.btnWrapper}
        >
          <AnimatedButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            loading={isEmailLoggingIn}
          />
        </MotiView>

        {/* Google Sign-in Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 350 }}
          style={[styles.btnWrapper, { marginTop: 12 }]}
        >
          <AnimatedButton
            title="Continuar con Google"
            onPress={handleGoogleLogin}
            variant="outline"
            size="lg"
            loading={isGoogleLoggingIn}
          />
        </MotiView>

        {/* Link to Register */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 600, delay: 400 }}
          style={styles.footerLink}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
            ¿No tienes cuenta?{' '}
            <Text
              onPress={() => navigation.navigate('Register')}
              style={{ color: colors.primary, fontWeight: typography.weights.bold }}
            >
              Regístrate
            </Text>
          </Text>
        </MotiView>

      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {Platform.OS === 'web' ? (
        renderContent()
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {renderContent()}
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  logoText: {
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 6,
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  errorText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputContainer: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  eyeIcon: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnWrapper: {
    marginTop: 10,
  },
  footerLink: {
    alignItems: 'center',
    marginTop: 24,
  },
});
