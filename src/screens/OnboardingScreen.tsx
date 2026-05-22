import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { AnimatedButton } from '../components/AnimatedButton';
import {
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Scale,
  Sparkles,
  Zap,
  Clock,
  Heart,
  TrendingUp,
  AlertCircle
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOAL_OPTIONS = [
  { id: 'force', label: '🦾 Aumentar Fuerza', targetType: 'Fuerza & Hipertrofia' },
  { id: 'hypertrophy', label: '🏋️‍♂️ Masa Muscular (Hipertrofia)', targetType: 'Fuerza & Hipertrofia' },
  { id: 'fat_loss', label: '🏃‍♂️ Pérdida de Grasa', targetType: 'Pérdida de Grasa' },
  { id: 'cardio', label: '🫀 Resistencia Cardiovascular', targetType: 'Resistencia' },
  { id: 'performance', label: '⚡ Rendimiento Deportivo', targetType: 'Rendimiento' },
];

const OBSTACLE_OPTIONS = [
  { id: 'time', label: '⏰ Falta de Tiempo (Trabajo/Estudio)' },
  { id: 'motivation', label: '🥱 Falta de Motivación o Constancia' },
  { id: 'structure', label: '🧭 No sé cómo estructurar mis rutinas' },
  { id: 'equipment', label: '🏠 Sin acceso a un gimnasio completo' },
  { id: 'injury', label: '🤕 Lesiones o molestias físicas' },
];

export const OnboardingScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { user, completeOnboarding } = useAuthStore();

  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(user?.weight ? String(user.weight) : '70');
  const [height, setHeight] = useState('170');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedObstacles, setSelectedObstacles] = useState<string[]>([]);
  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [isHeightFocused, setIsHeightFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate IMC and advice
  const parsedWeight = parseFloat(weight) || 70;
  const parsedHeight = parseFloat(height) || 170;
  const imc = parsedWeight / Math.pow(parsedHeight / 100, 2);

  const getImcCategory = (val: number) => {
    if (val < 18.5) return { label: 'Bajo Peso', color: '#AEAEB2' };
    if (val < 25) return { label: 'Normal (Saludable)', color: '#FFFFFF' };
    if (val < 30) return { label: 'Sobrepeso', color: '#AEAEB2' };
    return { label: 'Obesidad', color: '#FF3B30' };
  };

  const imcCategory = getImcCategory(imc);

  const getEstrategias = () => {
    const list: string[] = [];
    
    // Basado en metas
    if (selectedGoals.includes('force') || selectedGoals.includes('hypertrophy')) {
      list.push('Enfoque en Sobrecarga Progresiva: Prioriza levantar un poco más de peso o realizar una repetición extra cada semana.');
    }
    if (selectedGoals.includes('fat_loss')) {
      list.push('Déficit Energético Eficiente: Combina entrenamiento de fuerza (para mantener músculo) con descansos cortos (45-60s) para elevar el gasto calórico.');
    }
    
    // Basado en trabas
    if (selectedObstacles.includes('time')) {
      list.push('Entrenamientos de Alta Densidad: Te recomendamos rutinas Full-Body de 40 minutos utilizando superseries. Menos tiempo, máxima intensidad.');
    } else {
      list.push('Frecuencia Sugerida: 4 entrenamientos semanales alternando grupos musculares (Rutina Torso/Pierna o Push/Pull/Legs).');
    }
    
    if (selectedObstacles.includes('motivation')) {
      list.push('Metas Cortas: Ponte el objetivo de entrenar solo 2 días esta semana. Registrar tus marcas en Trainly y ver tu progreso visual te mantendrá motivado.');
    }
    if (selectedObstacles.includes('structure')) {
      list.push('Estructura Inteligente: Usa los planes prediseñados en la pestaña "Explorar" para arrancar sin romperte la cabeza planeando.');
    }

    if (list.length === 0) {
      list.push('Plan Balanceado: 3-4 sesiones de entrenamiento de fuerza por semana, priorizando técnica y rango de movimiento completo.');
    }

    return list;
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 2) {
      const w = parseFloat(weight);
      const h = parseFloat(height);
      if (isNaN(w) || w < 30 || w > 300) {
        setErrorMsg('Introduce un peso válido (30 - 300 kg).');
        return;
      }
      if (isNaN(h) || h < 100 || h > 250) {
        setErrorMsg('Introduce una altura válida (100 - 250 cm).');
        return;
      }
      if (selectedGoals.length === 0) {
        setErrorMsg('Selecciona al menos una meta.');
        return;
      }
    }
    if (step === 3) {
      if (selectedObstacles.length === 0) {
        setErrorMsg('Selecciona al menos un obstáculo.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleGoal = (id: string) => {
    setErrorMsg('');
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleObstacle = (id: string) => {
    setErrorMsg('');
    setSelectedObstacles((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    // Determine target from selected goals
    let target = 'Rendimiento';
    if (selectedGoals.includes('fat_loss')) {
      target = 'Pérdida de Grasa';
    } else if (selectedGoals.includes('force') || selectedGoals.includes('hypertrophy')) {
      target = 'Fuerza & Hipertrofia';
    } else if (selectedGoals.includes('cardio')) {
      target = 'Resistencia';
    }

    await completeOnboarding(parsedWeight, parsedHeight, target);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <MotiView
            key="step1"
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.stepContainer}
          >
            <View style={styles.iconHeader}>
              <Dumbbell size={54} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold }]}>
              Bienvenid@ a TRAINLY
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
              ¿Qué es Trainly?
            </Text>
            
            <View style={styles.introCard}>
              <View style={styles.bulletRow}>
                <Zap size={18} color="#FFFFFF" style={styles.bulletIcon} />
                <View style={styles.bulletTextWrapper}>
                  <Text style={[styles.bulletTitle, { color: '#FFFFFF', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    Seguimiento de Alto Rendimiento
                  </Text>
                  <Text style={[styles.bulletDesc, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                    Registra tus series, pesos y descansos con una interfaz fluida diseñada para mantener el foco.
                  </Text>
                </View>
              </View>

              <View style={styles.bulletRow}>
                <TrendingUp size={18} color="#FFFFFF" style={styles.bulletIcon} />
                <View style={styles.bulletTextWrapper}>
                  <Text style={[styles.bulletTitle, { color: '#FFFFFF', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    Mapa Muscular Anatómico
                  </Text>
                  <Text style={[styles.bulletDesc, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                    Visualiza exactamente qué músculos has entrenado mediante nuestro escáner corporal interactivo 3D.
                  </Text>
                </View>
              </View>

              <View style={styles.bulletRow}>
                <Sparkles size={18} color="#FFFFFF" style={styles.bulletIcon} />
                <View style={styles.bulletTextWrapper}>
                  <Text style={[styles.bulletTitle, { color: '#FFFFFF', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    Filosofía Monocromática
                  </Text>
                  <Text style={[styles.bulletDesc, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                    Estética premium en blanco y negro sin distracciones. Diseñado para atletas que entrenan en serio.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonWrapper}>
              <AnimatedButton
                title="Comenzar Diagnóstico"
                onPress={handleNext}
                variant="primary"
                size="lg"
              />
            </View>
          </MotiView>
        );

      case 2:
        return (
          <MotiView
            key="step2"
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.stepContainer}
          >
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
              Medidas y Objetivos
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              Introduce tu información actual y selecciona las metas que deseas alcanzar con Trainly.
            </Text>

            {/* Inputs Row */}
            <View style={styles.metricsRow}>
              <View style={styles.inputWrapperHalf}>
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
                    onChangeText={setWeight}
                    onFocus={() => setIsWeightFocused(true)}
                    onBlur={() => setIsWeightFocused(false)}
                    style={[styles.input, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
                    placeholder="75"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputWrapperHalf}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
                  TALLA / ALTURA (CM)
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: isHeightFocused ? colors.primary : colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    onFocus={() => setIsHeightFocused(true)}
                    onBlur={() => setIsHeightFocused(false)}
                    style={[styles.input, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
                    placeholder="175"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Goals selection */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
              MIS METAS PRINCIPALES (SELECCIÓN MÚLTIPLE)
            </Text>

            <View style={styles.pillsContainer}>
              {GOAL_OPTIONS.map((g) => {
                const isSelected = selectedGoals.includes(g.id);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggleGoal(g.id)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? '#FFFFFF' : colors.card,
                        borderColor: isSelected ? '#FFFFFF' : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: isSelected ? '#000000' : colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: typography.sizes.sm,
                        },
                      ]}
                    >
                      {g.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {errorMsg ? (
              <Text style={[styles.errorText, { color: colors.accentRed, fontSize: typography.sizes.xs }]}>
                {errorMsg}
              </Text>
            ) : null}

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Pressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
                <ChevronLeft size={20} color="#FFFFFF" />
              </Pressable>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AnimatedButton
                  title="Continuar"
                  onPress={handleNext}
                  variant="primary"
                  size="lg"
                />
              </View>
            </View>
          </MotiView>
        );

      case 3:
        return (
          <MotiView
            key="step3"
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.stepContainer}
          >
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
              Obstáculos y Dificultades
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              ¿Qué te impide lograr tus metas actualmente? Trainly adaptará los consejos para ayudarte a superar estas trabas.
            </Text>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
              PRINCIPALES DIFICULTADES
            </Text>

            <View style={styles.pillsContainer}>
              {OBSTACLE_OPTIONS.map((o) => {
                const isSelected = selectedObstacles.includes(o.id);
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => toggleObstacle(o.id)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? '#FFFFFF' : colors.card,
                        borderColor: isSelected ? '#FFFFFF' : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: isSelected ? '#000000' : colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: typography.sizes.sm,
                        },
                      ]}
                    >
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {errorMsg ? (
              <Text style={[styles.errorText, { color: colors.accentRed, fontSize: typography.sizes.xs }]}>
                {errorMsg}
              </Text>
            ) : null}

            <View style={styles.actionRow}>
              <Pressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
                <ChevronLeft size={20} color="#FFFFFF" />
              </Pressable>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AnimatedButton
                  title="Generar Diagnóstico"
                  onPress={handleNext}
                  variant="primary"
                  size="lg"
                />
              </View>
            </View>
          </MotiView>
        );

      case 4:
        return (
          <MotiView
            key="step4"
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            style={styles.stepContainer}
          >
            <View style={styles.sparkleIcon}>
              <Sparkles size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, textAlign: 'center' }]}>
              Tu Diagnóstico Trainly
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.sizes.sm, textAlign: 'center', marginBottom: 20 }]}>
              Basado en tus datos biométricos y análisis de hábitos.
            </Text>

            {/* Biometric Card */}
            <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.reportHeader}>
                <Text style={[styles.reportHeading, { color: '#FFFFFF', fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
                  ESTADO CORPORAL (IMC)
                </Text>
              </View>
              <View style={styles.imcContainer}>
                <Text style={[styles.imcValue, { color: '#FFFFFF', fontSize: typography.sizes.xxl, fontWeight: typography.weights.heavy }]}>
                  {imc.toFixed(1)}
                </Text>
                <View style={styles.imcLabelContainer}>
                  <Text style={[styles.imcLabel, { color: imcCategory.color, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    {imcCategory.label}
                  </Text>
                  <Text style={[styles.imcSub, { color: colors.textMuted, fontSize: typography.sizes.xs }]}>
                    Rango saludable: 18.5 - 24.9
                  </Text>
                </View>
              </View>
            </View>

            {/* Custom strategies */}
            <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
              <View style={styles.reportHeader}>
                <Text style={[styles.reportHeading, { color: '#FFFFFF', fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
                  ESTRATEGIA RECOMENDADA
                </Text>
              </View>
              <View style={styles.strategiesList}>
                {getEstrategias().map((est, idx) => (
                  <View key={idx} style={styles.strategyItem}>
                    <View style={styles.bulletDot} />
                    <Text style={[styles.strategyText, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                      {est}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Suggested Frequency */}
            <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
              <View style={styles.reportHeader}>
                <Text style={[styles.reportHeading, { color: '#FFFFFF', fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
                  FRECUENCIA SEMANAL RECOMENDADA
                </Text>
              </View>
              <View style={styles.frequencyContent}>
                <Clock size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={[styles.frequencyText, { color: '#FFFFFF', fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                  {selectedObstacles.includes('time') ? '3 entrenamientos / semana' : '4 - 5 entrenamientos / semana'}
                </Text>
              </View>
            </View>

            <View style={[styles.buttonWrapper, { marginTop: 24 }]}>
              <AnimatedButton
                title="Comenzar a Entrenar"
                onPress={handleFinish}
                variant="primary"
                size="lg"
              />
            </View>
          </MotiView>
        );

      default:
        return null;
    }
  };

  const renderContent = () => (
    <View style={styles.inner}>
      
      {/* Progress dots */}
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor: i === step ? '#FFFFFF' : i < step ? '#8E8E93' : '#1C1C1E',
                width: i === step ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    height: 10,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  stepContainer: {
    width: '100%',
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  introCard: {
    width: '100%',
    marginBottom: 32,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    padding: 16,
    borderRadius: 14,
  },
  bulletIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  bulletTextWrapper: {
    flex: 1,
  },
  bulletTitle: {
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  bulletDesc: {
    lineHeight: 16,
  },
  buttonWrapper: {
    width: '100%',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  inputWrapperHalf: {
    width: '48%',
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
  sectionLabel: {
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
  },
  pillText: {
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  sparkleIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  reportCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  reportHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    backgroundColor: '#1A1A1E',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  reportHeading: {
    letterSpacing: 0.8,
  },
  imcContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  imcValue: {
    marginRight: 18,
  },
  imcLabelContainer: {
    flex: 1,
  },
  imcLabel: {
    marginBottom: 2,
  },
  imcSub: {
    opacity: 0.6,
  },
  strategiesList: {
    padding: 16,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    marginTop: 6,
  },
  strategyText: {
    flex: 1,
    lineHeight: 18,
  },
  frequencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  frequencyText: {
    flex: 1,
  },
});
