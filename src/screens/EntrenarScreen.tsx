import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { useActivityStore, Routine, Exercise } from '../store/useActivityStore';
import {
  Dumbbell,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Calendar,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react-native';

export const EntrenarScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<any>();
  
  const {
    routines,
    activeWorkoutSession,
    startWorkoutSession,
    updateWorkoutSet,
    addSetToExercise,
    removeSetFromExercise,
    finishWorkoutSession,
    cancelWorkoutSession,
    generateRoutineFromQuiz,
  } = useActivityStore();

  // Wizard state
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    goal: 'Hipertrofia',
    experience: 'Principiante',
    frequency: '3 días a la semana',
    equipment: 'Todos',
  });

  // Workout tracking state (for clock)
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (activeWorkoutSession) {
      // Calculate elapsed seconds since start
      const start = activeWorkoutSession.startTime;
      setSecondsElapsed(Math.round((Date.now() - start) / 1000));
      
      interval = setInterval(() => {
        setSecondsElapsed(Math.round((Date.now() - activeWorkoutSession.startTime) / 1000));
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeWorkoutSession]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartWorkout = (routine: Routine) => {
    startWorkoutSession(routine);
  };

  const handleFinishWorkout = () => {
    const saved = finishWorkoutSession();
    if (saved) {
      Alert.alert('¡Entrenamiento Guardado!', 'Buen trabajo hoy. Tu rutina se ha registrado con éxito en el historial.', [
        { text: 'Aceptar', onPress: () => navigation.navigate('Historial') }
      ]);
    } else {
      Alert.alert(
        'Sesión Vacía',
        'No has completado ninguna serie de ejercicios. Registra al menos una serie completada para guardar el entrenamiento.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      '¿Descartar entrenamiento?',
      'Esta acción eliminará todos los datos de tu sesión actual.',
      [
        { text: 'No, continuar', style: 'cancel' },
        { text: 'Sí, descartar', style: 'destructive', onPress: () => cancelWorkoutSession() },
      ]
    );
  };

  const handleCompleteQuiz = () => {
    const generated = generateRoutineFromQuiz(
      quizAnswers.goal,
      quizAnswers.experience,
      quizAnswers.frequency,
      quizAnswers.equipment
    );
    setIsQuizVisible(false);
    setQuizStep(1);
    Alert.alert(
      'Rutina Generada',
      `¡Hemos creado la "${generated.name}" adaptada a tus objetivos!`,
      [{ text: 'Ver Rutinas' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* RENDER ACTIVE TRACKER OVERLAY IF WORKOUT IS SESSION ACTIVE */}
      <Modal visible={activeWorkoutSession !== null} animationType="slide">
        <SafeAreaView style={[styles.trackerContainer, { backgroundColor: colors.background }]}>
          {/* Tracker Header */}
          <View style={[styles.trackerHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.trackerRoutineName, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                {activeWorkoutSession?.name}
              </Text>
              <Text style={[styles.trackerTime, { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '700' }]}>
                TIEMPO: {formatTime(secondsElapsed)}
              </Text>
            </View>
            <Pressable onPress={handleCancelWorkout} style={styles.discardBtn}>
              <XCircle size={20} color={colors.accentRed} />
              <Text style={[styles.discardBtnText, { color: colors.accentRed, fontSize: 11, fontWeight: '700' }]}>
                DESCARTAR
              </Text>
            </Pressable>
          </View>

          {/* Exercises List inside workout */}
          <ScrollView contentContainerStyle={styles.trackerScroll} showsVerticalScrollIndicator={false}>
            {activeWorkoutSession?.exercises.map((ex, exIdx) => (
              <View key={ex.exerciseId} style={[styles.trackerExerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.trackerExerciseHeader}>
                  <View style={styles.trackerExMeta}>
                    <Text style={[styles.trackerExName, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                      {ex.name}
                    </Text>
                    <Text style={[styles.trackerExMuscle, { color: colors.primary, fontSize: 10, fontWeight: '700' }]}>
                      {ex.bodyPart.toUpperCase()} • {ex.category}
                    </Text>
                  </View>
                  <Pressable onPress={() => addSetToExercise(ex.exerciseId)} style={styles.addSetBtn}>
                    <Plus size={14} color={colors.primary} />
                    <Text style={[styles.addSetBtnText, { color: colors.primary, fontSize: 11, fontWeight: '700' }]}>
                      SERIE
                    </Text>
                  </Pressable>
                </View>

                {/* Table Header */}
                <View style={styles.setTableHeader}>
                  <Text style={[styles.tableLabel, { color: colors.textSecondary, flex: 1 }]}>SERIE</Text>
                  <Text style={[styles.tableLabel, { color: colors.textSecondary, width: 75, textAlign: 'center' }]}>KG</Text>
                  <Text style={[styles.tableLabel, { color: colors.textSecondary, width: 75, textAlign: 'center' }]}>REPS</Text>
                  <Text style={[styles.tableLabel, { color: colors.textSecondary, width: 50, textAlign: 'center' }]}>LISTO</Text>
                </View>

                {/* Sets Row */}
                {ex.sets.map((set, setIdx) => (
                  <MotiView
                    key={setIdx}
                    from={{ opacity: 0, translateY: 5 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={[
                      styles.setRow,
                      {
                        backgroundColor: set.completed ? 'rgba(212, 175, 55, 0.06)' : 'transparent',
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <View style={styles.setNumberCol}>
                      <Text style={[styles.setNumText, { color: colors.textPrimary, fontWeight: '700' }]}>
                        {setIdx + 1}
                      </Text>
                      {ex.sets.length > 1 && (
                        <Pressable onPress={() => removeSetFromExercise(ex.exerciseId, setIdx)} style={styles.deleteSetPress}>
                          <Trash2 size={12} color={colors.textMuted} />
                        </Pressable>
                      )}
                    </View>
                    
                    {/* Weight Input */}
                    <View style={styles.inputCol}>
                      <TextInput
                        keyboardType="numeric"
                        value={set.weight.toString()}
                        onChangeText={(text) => {
                          const val = parseFloat(text) || 0;
                          updateWorkoutSet(ex.exerciseId, setIdx, 'weight', val);
                        }}
                        editable={!set.completed}
                        style={[
                          styles.setNumericInput,
                          {
                            backgroundColor: colors.cardElevated,
                            borderColor: colors.border,
                            color: set.completed ? colors.textSecondary : colors.textPrimary,
                          },
                        ]}
                      />
                    </View>

                    {/* Reps Input */}
                    <View style={styles.inputCol}>
                      <TextInput
                        keyboardType="numeric"
                        value={set.reps.toString()}
                        onChangeText={(text) => {
                          const val = parseInt(text) || 0;
                          updateWorkoutSet(ex.exerciseId, setIdx, 'reps', val);
                        }}
                        editable={!set.completed}
                        style={[
                          styles.setNumericInput,
                          {
                            backgroundColor: colors.cardElevated,
                            borderColor: colors.border,
                            color: set.completed ? colors.textSecondary : colors.textPrimary,
                          },
                        ]}
                      />
                    </View>

                    {/* Checkmark Completion Button */}
                    <Pressable
                      onPress={() => updateWorkoutSet(ex.exerciseId, setIdx, 'completed', !set.completed)}
                      style={styles.checkCol}
                    >
                      <CheckCircle2
                        size={22}
                        color={set.completed ? colors.primary : colors.textMuted}
                        fill={set.completed ? colors.primary : 'transparent'}
                        strokeWidth={set.completed ? 1.5 : 2}
                      />
                    </Pressable>
                  </MotiView>
                ))}
              </View>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Tracker Footer Action */}
          <View style={[styles.trackerFooter, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleFinishWorkout}
              style={[styles.finishBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.finishBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: '800' }]}>
                FINALIZAR ENTRENAMIENTO
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MAIN SCREEN FLOW (GUIDE OR ROUTINE LIST) */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
          ENTRENAR
        </Text>
        <Text style={[styles.subtitle, { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
          TUS ENTRENAMIENTOS
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {routines.length === 0 ? (
          /* EMPTY STATE: USER GUIDE & CALL TO WIZARD QUIZ */
          <View>
            {/* AI Body Scan Premium Card */}
            <MotiView
              from={{ opacity: 0, translateY: -15 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={[styles.aiScanCard, { borderColor: colors.primary }]}
            >
              <Image
                source={require('../../assets/ai_body_scan.png')}
                style={styles.aiScanImage}
                contentFit="cover"
              />
              <View style={styles.aiScanOverlay}>
                <Text style={[styles.aiScanBadge, { backgroundColor: 'rgba(212, 175, 55, 0.15)', color: colors.primary }]}>
                  TECNOLOGÍA IA
                </Text>
                <Text style={[styles.aiScanTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '800' }]}>
                  OPTIMIZACIÓN BIOMÉTRICA TRAINLY
                </Text>
                <Text style={[styles.aiScanText, { color: colors.textSecondary, fontSize: 11, lineHeight: 14 }]}>
                  Escanea tu estructura muscular y obtén recomendaciones de entrenamiento en base a tu composición física actual.
                </Text>
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100 }}
              style={[styles.guideIntroCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.guideTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginBottom: 8 }]}>
                ¿Aún no sabes cómo empezar?
              </Text>
              <Text style={[styles.guideSubtext, { color: colors.textSecondary, fontSize: typography.sizes.sm, lineHeight: 20 }]}>
                Comenzar un camino fitness puede ser confuso. Hemos estructurado una guía completa de entrenamiento para que alcances tus metas rápidamente.
              </Text>
            </MotiView>

            {/* Beginner Guide Cards */}
            <Text style={[styles.guideSectionTitle, { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '800', marginTop: 24, marginBottom: 12 }]}>
              PRINCIPIOS CLAVE DEL ENTRENAMIENTO
            </Text>

            <View style={styles.guideSteps}>
              <View style={[styles.guideStepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}>
                  <Zap size={18} color={colors.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    1. Sobrecarga Progresiva
                  </Text>
                  <Text style={[styles.stepText, { color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: 16 }]}>
                    Para que tus músculos crezcan y se fortalezcan, debes incrementar la dificultad (más peso, más repeticiones o mejor técnica) de forma progresiva cada semana.
                  </Text>
                </View>
              </View>

              <View style={[styles.guideStepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}>
                  <Calendar size={18} color={colors.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    2. Frecuencia y Volumen
                  </Text>
                  <Text style={[styles.stepText, { color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: 16 }]}>
                    Estimula cada grupo muscular 2 veces por semana. Realiza de 10 a 20 series de esfuerzo real semanales por grupo muscular para optimizar resultados.
                  </Text>
                </View>
              </View>

              <View style={[styles.guideStepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.stepIconBg, { backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}>
                  <RotateCcw size={18} color={colors.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    3. Descanso y Recuperación
                  </Text>
                  <Text style={[styles.stepText, { color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: 16 }]}>
                    El músculo crece cuando descansas. Toma de 1.5 a 3 minutos entre series pesadas y duerme un mínimo de 7-8 horas al día.
                  </Text>
                </View>
              </View>
            </View>

            {/* Call To Action Quiz Button */}
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              style={styles.ctaContainer}
            >
              <Pressable
                onPress={() => setIsQuizVisible(true)}
                style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              >
                <Award size={18} color={colors.textInverse} style={{ marginRight: 8 }} />
                <Text style={[styles.ctaButtonText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: '800' }]}>
                  CREAR RUTINA PERSONALIZADA
                </Text>
              </Pressable>
            </MotiView>
          </View>
        ) : (
          /* ROUTINES LIST SCREEN */
          <View style={styles.routinesListWrapper}>
            <Text style={[styles.routinesListTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginBottom: 16 }]}>
              Tus Rutinas
            </Text>
            {routines.map((routine, idx) => (
              <MotiView
                key={routine.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: idx * 80 }}
                style={[styles.routineCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.routineCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.routineNameText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                      {routine.name}
                    </Text>
                    <Text style={[styles.routineDescText, { color: colors.textSecondary, fontSize: typography.sizes.caption, marginTop: 4 }]}>
                      {routine.description}
                    </Text>
                  </View>
                  <View style={[styles.dumbbellBadge, { backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}>
                    <Dumbbell size={16} color={colors.primary} />
                  </View>
                </View>

                {/* Exercises Preview */}
                <View style={[styles.exercisesPreview, { borderTopColor: colors.border }]}>
                  <Text style={[styles.exPreviewTitle, { color: colors.primary, fontSize: 10, fontWeight: '800', marginBottom: 6 }]}>
                    EJERCICIOS INCLUIDOS:
                  </Text>
                  {routine.exercises.map((ex) => (
                    <Text key={ex.id} style={[styles.exPreviewItem, { color: colors.textPrimary, fontSize: typography.sizes.caption }]}>
                      • {ex.name} <Text style={{ color: colors.textSecondary }}>({ex.bodyPart})</Text>
                    </Text>
                  ))}
                </View>

                <Pressable
                  onPress={() => handleStartWorkout(routine)}
                  style={({ pressed }) => [
                    styles.startWorkoutBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Play size={14} color={colors.textInverse} style={{ marginRight: 6 }} />
                  <Text style={[styles.startWorkoutBtnText, { color: colors.textInverse, fontSize: typography.sizes.xs, fontWeight: '800' }]}>
                    INICIAR ENTRENAMIENTO
                  </Text>
                </Pressable>
              </MotiView>
            ))}

            {/* Option to create another routine */}
            <Pressable
              onPress={() => setIsQuizVisible(true)}
              style={({ pressed }) => [
                styles.addAnotherRoutineBtn,
                {
                  borderColor: colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Plus size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.addAnotherRoutineBtnText, { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: '800' }]}>
                CREAR OTRA RUTINA
              </Text>
            </Pressable>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* GOAL-ORIENTED ROUTINE WIZARD MODAL */}
      <Modal
        visible={isQuizVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsQuizVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Wizard Header */}
            <View style={[styles.wizardHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.progressLineWrapper}>
                <Text style={[styles.wizardTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '800' }]}>
                  Configurador de Rutina ({quizStep}/4)
                </Text>
                {/* Progress bar in Gold */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${(quizStep / 4) * 100}%` }]} />
                </View>
              </View>
              <Pressable onPress={() => setIsQuizVisible(false)}>
                <XCircle size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Wizard Content */}
            <ScrollView style={styles.wizardContent}>
              {quizStep === 1 && (
                <MotiView from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }}>
                  <Text style={[styles.questionText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: '700' }]}>
                    ¿Cuál es tu objetivo principal?
                  </Text>
                  {['Hipertrofia', 'Fuerza', 'Pérdida de grasa', 'Resistencia'].map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setQuizAnswers({ ...quizAnswers, goal: opt })}
                      style={[
                        styles.quizOption,
                        { borderColor: colors.border },
                        quizAnswers.goal === opt && { borderColor: colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.06)' },
                      ]}
                    >
                      <Text style={[styles.quizOptionText, { color: quizAnswers.goal === opt ? colors.primary : colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '600' }]}>
                        {opt}
                      </Text>
                      {opt === 'Hipertrofia' && <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Foco en ganar volumen muscular</Text>}
                      {opt === 'Fuerza' && <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Foco en levantar más peso</Text>}
                      {opt === 'Pérdida de grasa' && <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Gasto calórico elevado</Text>}
                      {opt === 'Resistencia' && <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Foco cardiovascular y resistencia muscular</Text>}
                    </Pressable>
                  ))}
                </MotiView>
              )}

              {quizStep === 2 && (
                <MotiView from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }}>
                  <Text style={[styles.questionText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: '700' }]}>
                    ¿Cuál es tu nivel de experiencia?
                  </Text>
                  {['Principiante', 'Intermedio', 'Avanzado'].map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setQuizAnswers({ ...quizAnswers, experience: opt })}
                      style={[
                        styles.quizOption,
                        { borderColor: colors.border },
                        quizAnswers.experience === opt && { borderColor: colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.06)' },
                      ]}
                    >
                      <Text style={[styles.quizOptionText, { color: quizAnswers.experience === opt ? colors.primary : colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '600' }]}>
                        {opt}
                      </Text>
                      {opt === 'Principiante' && <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Menos de 6 meses entrenando</Text>}
                      {opt === 'Intermedio' && <Text style={{ color: colors.textSecondary, fontSize: 10 }}>6 a 2 años de entrenamiento constante</Text>}
                      {opt === 'Avanzado' && <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Más de 2 años con buena técnica</Text>}
                    </Pressable>
                  ))}
                </MotiView>
              )}

              {quizStep === 3 && (
                <MotiView from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }}>
                  <Text style={[styles.questionText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: '700' }]}>
                    ¿Cuántos días a la semana entrenarás?
                  </Text>
                  {['2 días a la semana', '3 días a la semana', '4 días a la semana'].map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setQuizAnswers({ ...quizAnswers, frequency: opt })}
                      style={[
                        styles.quizOption,
                        { borderColor: colors.border },
                        quizAnswers.frequency === opt && { borderColor: colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.06)' },
                      ]}
                    >
                      <Text style={[styles.quizOptionText, { color: quizAnswers.frequency === opt ? colors.primary : colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '600' }]}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </MotiView>
              )}

              {quizStep === 4 && (
                <MotiView from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }}>
                  <Text style={[styles.questionText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: '700' }]}>
                    ¿Qué equipamiento tienes disponible?
                  </Text>
                  {['Mancuernas', 'Máquina', 'Peso corporal', 'Todos'].map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setQuizAnswers({ ...quizAnswers, equipment: opt })}
                      style={[
                        styles.quizOption,
                        { borderColor: colors.border },
                        quizAnswers.equipment === opt && { borderColor: colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.06)' },
                      ]}
                    >
                      <Text style={[styles.quizOptionText, { color: quizAnswers.equipment === opt ? colors.primary : colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '600' }]}>
                        {opt === 'Todos' ? 'Todos (Gimnasio completo)' : opt}
                      </Text>
                    </Pressable>
                  ))}
                </MotiView>
              )}
            </ScrollView>

            {/* Wizard Navigation */}
            <View style={[styles.wizardFooter, { borderTopColor: colors.border }]}>
              {quizStep > 1 ? (
                <Pressable
                  onPress={() => setQuizStep(quizStep - 1)}
                  style={[styles.wizardNavBtn, { borderColor: colors.border, borderWidth: 1 }]}
                >
                  <Text style={[styles.wizardNavBtnText, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '700' }]}>
                    Atrás
                  </Text>
                </Pressable>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              {quizStep < 4 ? (
                <Pressable
                  onPress={() => setQuizStep(quizStep + 1)}
                  style={[styles.wizardNavBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.wizardNavBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: '700' }]}>
                    Siguiente
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleCompleteQuiz}
                  style={[styles.wizardNavBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.wizardNavBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: '800' }]}>
                    Generar Rutina
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    letterSpacing: 1,
  },
  subtitle: {
    letterSpacing: 1.5,
    marginTop: 2,
  },
  scrollContainer: {
    padding: 20,
  },
  guideIntroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  guideTitle: {
    letterSpacing: -0.2,
  },
  guideSubtext: {},
  guideSectionTitle: {
    letterSpacing: 1.2,
  },
  guideSteps: {
    gap: 12,
  },
  guideStepCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'flex-start',
  },
  stepIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: 4,
  },
  stepText: {},
  ctaContainer: {
    marginTop: 28,
    marginBottom: 40,
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaButtonText: {
    letterSpacing: 0.5,
  },
  routinesListWrapper: {},
  routinesListTitle: {
    letterSpacing: -0.2,
  },
  routineCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  routineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  routineNameText: {
    letterSpacing: -0.2,
  },
  routineDescText: {
    lineHeight: 16,
  },
  dumbbellBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  exercisesPreview: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 16,
    gap: 4,
  },
  exPreviewTitle: {
    letterSpacing: 0.5,
  },
  exPreviewItem: {
    lineHeight: 16,
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startWorkoutBtnText: {
    letterSpacing: 0.5,
  },
  addAnotherRoutineBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addAnotherRoutineBtnText: {
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  wizardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  progressLineWrapper: {
    flex: 1,
    marginRight: 15,
  },
  wizardTitle: {
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  wizardContent: {
    padding: 20,
  },
  questionText: {
    marginBottom: 16,
  },
  quizOption: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'column',
    gap: 2,
  },
  quizOptionText: {},
  wizardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 20,
    gap: 12,
  },
  wizardNavBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wizardNavBtnText: {},
  trackerContainer: {
    flex: 1,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  trackerRoutineName: {},
  trackerTime: {
    marginTop: 2,
    letterSpacing: 0.5,
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  discardBtnText: {},
  trackerScroll: {
    padding: 20,
  },
  trackerExerciseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  trackerExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackerExMeta: {
    flex: 1,
  },
  trackerExName: {},
  trackerExMuscle: {
    marginTop: 2,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  addSetBtnText: {},
  setTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  tableLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  setNumberCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setNumText: {},
  deleteSetPress: {
    padding: 4,
  },
  inputCol: {
    width: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumericInput: {
    width: 58,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    padding: 0,
  },
  checkCol: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 20,
    borderTopWidth: 1,
    paddingBottom: 34,
  },
  finishBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishBtnText: {
    letterSpacing: 0.5,
  },
  aiScanCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 20,
    height: 180,
    position: 'relative',
  },
  aiScanImage: {
    width: '100%',
    height: '100%',
  },
  aiScanOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
  },
  aiScanBadge: {
    alignSelf: 'flex-start',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    letterSpacing: 1,
  },
  aiScanTitle: {
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  aiScanText: {},
});
