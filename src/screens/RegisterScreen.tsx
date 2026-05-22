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
  ScrollView,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { Image } from 'expo-image';
import { Eye, EyeOff } from 'lucide-react-native';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const FITNESS_GOALS = ['Pérdida de Grasa', 'Fuerza & Hipertrofia', 'Resistencia', 'Rendimiento'];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weight, setWeight] = useState('');
  const [target, setTarget] = useState(FITNESS_GOALS[3]); // Default is Rendimiento
  
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !weight) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorMsg('Por favor introduce un peso válido.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLocalLoading(true);
    try {
      const result = await register(name, email, password, weightNum, target);
      setLocalLoading(false);
      if (result.success && !result.sessionCreated) {
        setSuccessMsg('¡Cuenta creada con éxito! Por favor, verifica tu correo electrónico para confirmar tu cuenta y poder iniciar sesión.');
      }
    } catch (error: any) {
      let msg = error.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
      if (msg.toLowerCase().includes('rate limit')) {
        msg = 'Se ha excedido el límite de correos de verificación de Supabase. Por favor, espera unos minutos o utiliza "Continuar con Google" para registrarte al instante.';
      }
      setErrorMsg(msg);
      setLocalLoading(false);
    }
  };

  const renderContent = () => (
    <ScrollView contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
      
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        style={styles.headerContainer}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
          Crea tu Perfil
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
          Establece las bases para optimizar tu rendimiento.
        </Text>
      </MotiView>

      {/* Form */}
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

        {successMsg ? (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={[styles.successBox, { borderColor: colors.primary }]}
          >
            <Text style={[styles.successText, { color: colors.primary, fontSize: typography.sizes.xs }]}>
              {successMsg}
            </Text>
          </MotiView>
        ) : null}

        {/* Name Input */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 50 }}
          style={styles.inputWrapper}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            NOMBRE COMPLETO
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.card,
                borderColor: isNameFocused ? colors.primary : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrorMsg('');
              }}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              style={[styles.input, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
              placeholder="Alex Rivera"
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
            />
          </View>
        </MotiView>

        {/* Email Input */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
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
              placeholder="alex@trainly.io"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </MotiView>

        {/* Password Input */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 120 }}
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
              placeholder="Mínimo 6 caracteres"
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

        {/* Weight Input */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 150 }}
          style={styles.inputWrapper}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            PESO ACTUAL (KG)
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.card,
                borderColor: isWeightFocused ? colors.primary : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <TextInput
              value={weight}
              onChangeText={(text) => {
                setWeight(text);
                setErrorMsg('');
              }}
              onFocus={() => setIsWeightFocused(true)}
              onBlur={() => setIsWeightFocused(false)}
              style={[styles.input, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
              placeholder="78"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        </MotiView>

        {/* Target Select */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.inputWrapper}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            OBJETIVO PRINCIPAL
          </Text>
          <View style={styles.targetsRow}>
            {FITNESS_GOALS.map((goal) => {
              const isSelected = target === goal;
              return (
                <Pressable
                  key={goal}
                  onPress={() => setTarget(goal)}
                  style={[
                    styles.targetBadge,
                    {
                      backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.targetBadgeText,
                      {
                        color: isSelected ? colors.primary : colors.textSecondary,
                        fontWeight: isSelected ? '600' : '400',
                        fontSize: typography.sizes.xs,
                      },
                    ]}
                  >
                    {goal}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </MotiView>

        {/* Register Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 250 }}
          style={styles.btnWrapper}
        >
          <AnimatedButton
            title="Registrarse"
            onPress={handleRegister}
            variant="primary"
            size="lg"
            loading={localLoading}
          />
        </MotiView>

        {/* Link back to Login */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
          style={styles.footerLink}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
            ¿Ya tienes cuenta?{' '}
            <Text
              onPress={() => navigation.navigate('Login')}
              style={{ color: colors.primary, fontWeight: typography.weights.bold }}
            >
              Inicia Sesión
            </Text>
          </Text>
        </MotiView>

      </View>
    </ScrollView>
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
  scrollInner: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 36,
  },
  headerTitle: {
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
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
  successBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  successText: {
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
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  targetBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
  },
  targetBadgeText: {
    textAlign: 'center',
  },
  btnWrapper: {
    marginTop: 10,
  },
  footerLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  eyeIcon: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
