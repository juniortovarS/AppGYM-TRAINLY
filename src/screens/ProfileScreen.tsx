import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import {
  LogOut,
  Scale,
  Flame,
  Timer,
  ChevronRight,
  ChevronLeft,
  User,
  Sparkles,
  Users,
  Maximize2,
  CheckCircle2,
  TrendingUp,
  Dumbbell,
  X
} from 'lucide-react-native';
import Body from 'react-native-body-highlighter';
import { useAuthStore } from '../store/useAuthStore';
import { useActivityStore, WorkoutHistoryItem, WorkoutExerciseLog } from '../store/useActivityStore';
import { useAppWidth } from '../hooks/useAppWidth';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const ProfileScreen: React.FC = () => {
  const { colors, typography } = useTheme();
  const { logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const { 
    workoutHistory, 
    userWeight, 
    userHeight, 
    friendsList, 
    setWeightAndHeight 
  } = useActivityStore();
  const width = useAppWidth();

  // Navigation or screen state
  const [showExercisesMap, setShowExercisesMap] = useState<Record<string, boolean>>({});
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerStep, setScannerStep] = useState(0); // 0: Scanning, 1: Results
  const [scanProgress, setScanProgress] = useState(0);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Weight & Height modal state
  const [showWeightHeightModal, setShowWeightHeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [modalError, setModalError] = useState('');

  const handleOpenWeightHeightModal = () => {
    setWeightInput(userWeight ? String(userWeight) : '');
    setHeightInput(userHeight ? String(userHeight) : '');
    setModalError('');
    setShowWeightHeightModal(true);
  };

  const handleSaveWeightHeight = () => {
    const parsedWeight = parseFloat(weightInput);
    const parsedHeight = parseFloat(heightInput);

    if (isNaN(parsedWeight) || parsedWeight < 30 || parsedWeight > 300) {
      setModalError('Por favor ingresa un peso válido (30 - 300 kg)');
      return;
    }
    if (isNaN(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
      setModalError('Por favor ingresa una altura válida (100 - 250 cm)');
      return;
    }

    setWeightAndHeight(parsedWeight, parsedHeight);
    setShowWeightHeightModal(false);
  };

  // Helper to map workout muscles to react-native-body-highlighter slugs
  const mapBodyPartToSlugs = (bodyPart: string): string[] => {
    switch (bodyPart) {
      case 'Bíceps':
        return ['biceps'];
      case 'Tríceps':
        return ['triceps'];
      case 'Hombros':
        return ['front-deltoids', 'back-deltoids'];
      case 'Piernas':
        return ['quadriceps', 'hamstring', 'gluteal', 'calves'];
      case 'Pecho':
        return ['chest'];
      case 'Espalda':
        return ['upper-back', 'lower-back', 'trapezius'];
      case 'Core':
        return ['abs', 'obliques'];
      default:
        return [];
    }
  };

  // Get mini-siluetas front and back data for a workout history item
  const getHighlighterData = (exercises: WorkoutExerciseLog[]) => {
    const frontData: any[] = [];
    const backData: any[] = [];

    const activeSlugs = new Set<string>();
    exercises.forEach((ex) => {
      const slugs = mapBodyPartToSlugs(ex.bodyPart);
      slugs.forEach((s) => activeSlugs.add(s));
    });

    const activeStyle = {
      fill: '#FFFFFF', // pure white highlight for monochromic theme
      stroke: '#FFFFFF',
      strokeWidth: 0.8,
    };

    activeSlugs.forEach((slug) => {
      if (['chest', 'biceps', 'abs', 'obliques', 'quadriceps', 'front-deltoids'].includes(slug)) {
        frontData.push({ slug, styles: activeStyle });
      } else if (['triceps', 'upper-back', 'lower-back', 'trapezius', 'hamstring', 'gluteal', 'calves', 'back-deltoids'].includes(slug)) {
        backData.push({ slug, styles: activeStyle });
      }
    });

    return { frontData, backData };
  };

  // Calculate volume for a workout history item
  const calculateWorkoutVolume = (workout: WorkoutHistoryItem) => {
    let totalVolume = 0;
    workout.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalVolume += set.reps * set.weight;
        }
      });
    });
    return totalVolume;
  };

  // Calculate volume by day of week (Monday to Sunday) for the current week
  const weeklyVolume = useMemo(() => {
    const daysVolume = [0, 0, 0, 0, 0, 0, 0]; // Index 0: Lun, ..., 6: Dom
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    workoutHistory.forEach((workout) => {
      const timestampStr = workout.id.replace('history-', '');
      const timestamp = parseInt(timestampStr);
      const workoutDate = new Date(isNaN(timestamp) ? Date.now() : timestamp);

      if (workoutDate >= startOfWeek) {
        const volume = calculateWorkoutVolume(workout);
        const dayIndex = workoutDate.getDay() === 0 ? 6 : workoutDate.getDay() - 1;
        if (dayIndex >= 0 && dayIndex < 7) {
          daysVolume[dayIndex] += volume;
        }
      }
    });

    // If total weekly volume is 0, provide simulated default values for display elegance
    const totalRealVolume = daysVolume.reduce((acc, v) => acc + v, 0);
    if (totalRealVolume === 0) {
      return { data: [1800, 2400, 0, 1500, 3200, 800, 0], isSimulated: true };
    }
    return { data: daysVolume, isSimulated: false };
  }, [workoutHistory]);

  const maxVolume = useMemo(() => {
    return Math.max(...weeklyVolume.data, 1000);
  }, [weeklyVolume]);

  // Calculate relative date string (e.g. "Hace 10 días")
  const getRelativeDateString = (historyId: string, dateString: string) => {
    const timestampStr = historyId.replace('history-', '');
    const timestamp = parseInt(timestampStr);
    if (isNaN(timestamp)) return dateString;

    const now = new Date();
    const workoutDate = new Date(timestamp);

    const diffTime = Math.abs(now.getTime() - workoutDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return `Hace ${diffDays} días`;
    }
  };

  // Compute top exercises and muscles from history
  const topStats = useMemo(() => {
    if (workoutHistory.length === 0) {
      return {
        topExercise: '—',
        topMuscle: '—',
        focusMuscle: '—',
      };
    }

    const exerciseCounts: Record<string, number> = {};
    const muscleCounts: Record<string, number> = {};

    workoutHistory.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
        muscleCounts[ex.bodyPart] = (muscleCounts[ex.bodyPart] || 0) + 1;
      });
    });

    const sortedExercises = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1]);
    const sortedMuscles = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1]);

    const topExercise = sortedExercises[0]?.[0] || 'Sentadillas';
    const topMuscle = sortedMuscles[0]?.[0] || 'Espalda';
    
    // Focus recommendation (least trained muscle or opposite of top)
    const focusMuscle = sortedMuscles[sortedMuscles.length - 1]?.[0] || 'Bíceps';

    return { topExercise, topMuscle, focusMuscle };
  }, [workoutHistory]);

  // Scanner Simulator effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scannerVisible && scannerStep === 0) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScannerStep(1); // Transition to results
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [scannerVisible, scannerStep]);

  const handleStartScan = () => {
    setScannerStep(0);
    setScanProgress(0);
    setScannerVisible(true);
  };

  const toggleExercises = (id: string) => {
    setShowExercisesMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const statCardWidth = (Math.min(width, 768) - 40 - 12) / 2;
  const historyCardWidth = Math.min(width, 600) - 40;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: 'bold' }]}>
          PERFIL
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PROFILE INFO & AVATAR (NO FOTO) */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 0 }]}>
              <Text style={[styles.avatarInitials, { color: colors.textPrimary }]}>JT</Text>
            </View>
            <Pressable 
              style={({ pressed }) => [
                styles.avatarAddBtn,
                { backgroundColor: '#FFFFFF', opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={() => alert('Próximamente: Cambiar foto de perfil')}
            >
              <Text style={styles.avatarAddBtnText}>+</Text>
            </Pressable>
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>Junior Tovar</Text>
          <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@juniortovars</Text>

          <View style={styles.countersRow}>
            <View style={styles.counterCol}>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>
                {workoutHistory.length}
              </Text>
              <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>
                {workoutHistory.length === 1 ? 'Entrenamiento' : 'Entrenamientos'}
              </Text>
            </View>
            <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
            <Pressable 
              onPress={() => navigation.navigate('Amigos')}
              style={styles.counterCol}
            >
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>
                {friendsList.length}
              </Text>
              <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>Amigos</Text>
            </Pressable>
          </View>
        </View>

        {/* WEEKLY PROGRESS BAR CHART */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              PROGRESO SEMANAL
            </Text>
            <View style={styles.trendRow}>
              <TrendingUp size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
                Volumen (kg)
              </Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {weeklyVolume.data.map((volume, index) => {
              const heightPercent = (volume / maxVolume) * 100;
              const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
              const isHoveredOrClicked = hoveredBarIndex === index;
              return (
                <Pressable
                  key={index}
                  style={styles.chartBarCol}
                  onPress={() => {
                    setHoveredBarIndex(hoveredBarIndex === index ? null : index);
                  }}
                  // @ts-ignore
                  onHoverIn={() => setHoveredBarIndex(index)}
                  // @ts-ignore
                  onHoverOut={() => setHoveredBarIndex(null)}
                >
                  {isHoveredOrClicked && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>{Math.round(volume)} kg</Text>
                    </View>
                  )}
                  <View style={styles.barOuter}>
                    <View
                      style={[
                        styles.barInner,
                        {
                          height: `${Math.max(heightPercent, 6)}%`,
                          backgroundColor: volume > 0 ? '#FFFFFF' : '#222226',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {daysOfWeek[index]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* METRICS GRID (4 CARDS) */}
        <View style={styles.metricsGrid}>
          {/* Row 1 */}
          <View style={styles.metricsRow}>
            {/* Card 1: Peso y Altura */}
            <Pressable 
              onPress={handleOpenWeightHeightModal}
              style={({ pressed }) => [
                styles.metricCard,
                {
                  width: statCardWidth,
                  height: statCardWidth,
                  backgroundColor: colors.card,
                  borderColor: pressed ? '#FFFFFF' : colors.border,
                  borderWidth: 1,
                }
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Scale size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Peso y Altura</Text>
              {userWeight || userHeight ? (
                <>
                  <Text style={[styles.metricValue, { color: colors.textPrimary, fontSize: 15 }]} numberOfLines={1}>
                    {userWeight ? `${userWeight} kg` : '—'} / {userHeight ? `${userHeight} cm` : '—'}
                  </Text>
                  <Text style={[styles.metricSub, { color: colors.textMuted }]} numberOfLines={1}>
                    Toca para actualizar
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.metricValue, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                    Ingresar
                  </Text>
                  <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                    Registra tus medidas
                  </Text>
                </>
              )}
            </Pressable>

            {/* Card 2: Ejercicios Favoritos */}
            <View style={[styles.metricCard, { width: statCardWidth, height: statCardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Dumbbell size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Ejercicios Top</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary, fontSize: topStats.topExercise === '—' ? 24 : 15 }]} numberOfLines={1}>
                {topStats.topExercise}
              </Text>
              <Text style={[styles.metricSub, { color: colors.textMuted }]} numberOfLines={1}>
                {topStats.topExercise === '—' ? 'Sin datos' : 'El más realizado'}
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.metricsRow}>
            {/* Card 3: Músculos */}
            <View style={[styles.metricCard, { width: statCardWidth, height: statCardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Sparkles size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Músculos</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary, fontSize: topStats.topMuscle === '—' ? 24 : 15 }]} numberOfLines={1}>
                {topStats.topMuscle}
              </Text>
              <Text style={[styles.metricSub, { color: colors.textMuted }]} numberOfLines={1}>
                {topStats.topMuscle === '—' ? 'Sin datos' : `Foco: ${topStats.focusMuscle}`}
              </Text>
            </View>

            {/* Card 4: Escaneo 3D */}
            <Pressable
              onPress={handleStartScan}
              style={({ pressed }) => [
                styles.metricCard,
                {
                  width: statCardWidth,
                  height: statCardWidth,
                  backgroundColor: colors.card,
                  borderColor: pressed ? '#FFFFFF' : colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                <Maximize2 size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Escaneo 3D</Text>
              <Text style={[styles.metricValue, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                Escanear
              </Text>
              <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                Analiza composición ➡️
              </Text>
            </Pressable>
          </View>
        </View>

        {/* HISTORIAL SEMANAL DE ENTRENAMIENTOS SLIDER */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: 'bold' }]}>
            HISTORIAL SEMANAL
          </Text>
        </View>

        {workoutHistory.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Dumbbell size={36} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
              No hay rutinas aún
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Usa el botón central [+] para crear una y registrar tu primer entrenamiento.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={historyCardWidth + 16}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {workoutHistory.map((item) => {
              const isExercisesView = !!showExercisesMap[item.id];
              const workedMuscles = Array.from(new Set(item.exercises.map(ex => ex.bodyPart))).join(' y ');
              const volume = calculateWorkoutVolume(item);
              const { frontData, backData } = getHighlighterData(item.exercises);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.historyCard,
                    {
                      width: historyCardWidth,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* CARD SLIDE 1: SUMMARY & BODY SILHOUETTES */}
                  {!isExercisesView ? (
                    <View style={styles.cardSlide}>
                      <View style={styles.slideLeft}>
                        <Text style={[styles.historyCardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.historyCardDate, { color: colors.textSecondary }]}>
                          {getRelativeDateString(item.id, item.date)} • {workedMuscles}
                        </Text>

                        <View style={styles.historyMetricsGrid}>
                          <View style={styles.historyMetricRow}>
                            <Timer size={13} color="#AEAEB2" style={{ marginRight: 6 }} />
                            <Text style={[styles.historyMetricText, { color: colors.textSecondary }]}>
                              {item.duration} min
                            </Text>
                          </View>
                          <View style={styles.historyMetricRow}>
                            <Flame size={13} color="#AEAEB2" style={{ marginRight: 6 }} />
                            <Text style={[styles.historyMetricText, { color: colors.textSecondary }]}>
                              {item.calories} kcal
                            </Text>
                          </View>
                          <View style={styles.historyMetricRow}>
                            <Dumbbell size={13} color="#AEAEB2" style={{ marginRight: 6 }} />
                            <Text style={[styles.historyMetricText, { color: colors.textSecondary }]}>
                              {volume > 0 ? `${volume} kg volumen` : 'Sin peso'}
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          onPress={() => toggleExercises(item.id)}
                          style={[styles.detailsBtn, { borderColor: colors.border }]}
                        >
                          <Text style={[styles.detailsBtnText, { color: colors.textPrimary }]}>
                            Ver ejercicios
                          </Text>
                          <ChevronRight size={14} color="#FFFFFF" />
                        </Pressable>
                      </View>

                      {/* SILHOUETTES */}
                      <View style={styles.slideRight}>
                        <View style={styles.miniSilhouettesContainer}>
                          <View style={styles.miniSilhouetteWrapper}>
                            <Body
                              data={frontData}
                              gender="male"
                              side="front"
                              scale={0.25}
                              border="#2C2C35"
                              defaultFill="#16161B"
                            />
                            <Text style={styles.silhouetteLabel}>FRENTE</Text>
                          </View>
                          <View style={styles.miniSilhouetteWrapper}>
                            <Body
                              data={backData}
                              gender="male"
                              side="back"
                              scale={0.25}
                              border="#2C2C35"
                              defaultFill="#16161B"
                            />
                            <Text style={styles.silhouetteLabel}>DORSO</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    /* CARD SLIDE 2: EXERCISES LIST */
                    <View style={styles.cardSlide}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.slideExercisesHeader}>
                          <Text style={[styles.historyCardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                            Ejercicios Realizados
                          </Text>
                          <Pressable
                            onPress={() => toggleExercises(item.id)}
                            style={[styles.backSlideBtn, { borderColor: colors.border }]}
                          >
                            <ChevronLeft size={14} color="#FFFFFF" />
                            <Text style={[styles.backSlideBtnText, { color: colors.textPrimary }]}>
                              Volver
                            </Text>
                          </Pressable>
                        </View>

                        <ScrollView
                          style={styles.exercisesListScroll}
                          showsVerticalScrollIndicator={false}
                        >
                          {item.exercises.map((ex, exIdx) => (
                            <View key={exIdx} style={styles.exListRow}>
                              <View style={styles.exListRowHeader}>
                                <Text style={[styles.exListName, { color: colors.textPrimary }]} numberOfLines={1}>
                                  {ex.name}
                                </Text>
                                <Text style={[styles.exListCategory, { color: colors.textSecondary }]}>
                                  {ex.bodyPart}
                                </Text>
                              </View>
                              <View style={styles.exListSetsRow}>
                                {ex.sets.map((set, setIdx) => (
                                  <View key={setIdx} style={[styles.exSetPill, { backgroundColor: '#1C1C22', borderColor: '#2C2C32' }]}>
                                    <Text style={[styles.exSetText, { color: '#FFFFFF' }]}>
                                      S{setIdx + 1}: {set.reps}x{set.weight}kg
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  )}

                  {/* CAROUSEL PAGE DOTS */}
                  <View style={styles.carouselDots}>
                    <View style={[styles.carouselDot, { backgroundColor: !isExercisesView ? '#FFFFFF' : '#3A3A40' }]} />
                    <View style={[styles.carouselDot, { backgroundColor: isExercisesView ? '#FFFFFF' : '#3A3A40' }]} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* LOGOUT */}
        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { borderColor: '#2C2C2E', opacity: pressed ? 0.8 : 1, marginTop: 12 }
          ]}
        >
          <LogOut size={18} color="#FF3B30" style={{ marginRight: 8 }} />
          <Text style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: 14 }}>Cerrar Sesión</Text>
        </Pressable>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 3D BODY SCAN MODAL (WOW FACTOR) */}
      {scannerVisible && (
        <Animated.View 
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={[
            StyleSheet.absoluteFillObject,
            styles.scannerModalOverlay,
            { zIndex: 1000 }
          ]}
        >
          <View style={[styles.scannerModalContent, { backgroundColor: '#09090C', borderColor: '#222226' }]}>
            {scannerStep === 0 ? (
              /* STEP 0: ANIMATED SCANNING */
              <View style={styles.scanViewContainer}>
                <Text style={styles.scanModalTitle}>ESCANEANDO CUERPO 3D</Text>
                <Text style={styles.scanModalSub}>Permanece quieto frente a la cámara</Text>

                <View style={styles.scannerGridBox}>
                  {/* Rotating Outline Placeholder or Svg Body outline */}
                  <View style={styles.scannerBodyOutline}>
                    <Body
                      data={[]}
                      gender="male"
                      side="front"
                      scale={0.8}
                      border="#FFFFFF"
                      defaultFill="#16161B"
                    />
                  </View>

                  {/* Laser Scan Line Bar */}
                  <View style={[styles.scannerLaserLine, { top: `${scanProgress}%` }]} />
                </View>

                <View style={styles.progressContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 10 }} />
                  <Text style={styles.progressText}>
                    {scanProgress < 30
                      ? 'Iniciando escáner óptico...'
                      : scanProgress < 65
                      ? 'Analizando densidad muscular...'
                      : 'Calculando composición corporal...'} {scanProgress}%
                  </Text>
                </View>
              </View>
            ) : (
              /* STEP 1: SCAN COMPLETED RESULTS */
              <View style={styles.scanViewContainer}>
                <CheckCircle2 size={48} color="#FFFFFF" style={{ marginBottom: 12 }} />
                <Text style={styles.scanModalTitle}>ESCANEO COMPLETADO</Text>
                <Text style={styles.scanModalSub}>Composición estimada con inteligencia artificial</Text>

                <View style={styles.resultsContainer}>
                  <View style={[styles.resultRow, { borderBottomColor: '#1C1C24' }]}>
                    <Text style={styles.resultLabel}>Grasa Corporal</Text>
                    <Text style={styles.resultValue}>14.2% <Text style={styles.resultUnit}>Atleta</Text></Text>
                  </View>
                  <View style={[styles.resultRow, { borderBottomColor: '#1C1C24' }]}>
                    <Text style={styles.resultLabel}>Masa Magra Estimada</Text>
                    <Text style={styles.resultValue}>64.4 kg</Text>
                  </View>
                  <View style={[styles.resultRow, { borderBottomColor: '#1C1C24' }]}>
                    <Text style={styles.resultLabel}>Puntuación de Postura</Text>
                    <Text style={styles.resultValue}>94/100 <Text style={styles.resultUnit}>Excelente</Text></Text>
                  </View>
                  <View style={[styles.resultRow, { borderBottomColor: 'transparent' }]}>
                    <Text style={styles.resultLabel}>Músculo con Mayor Foco</Text>
                    <Text style={[styles.resultValue, { color: '#FFFFFF' }]}>Espalda / Bíceps</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setScannerVisible(false)}
                  style={[styles.acceptScanBtn, { backgroundColor: '#FFFFFF' }]}
                >
                  <Text style={styles.acceptScanBtnText}>Aceptar y Guardar</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* WEIGHT & HEIGHT INPUT MODAL */}
      {showWeightHeightModal && (
        <Animated.View 
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={[
            StyleSheet.absoluteFillObject,
            styles.scannerModalOverlay,
            { zIndex: 1000 }
          ]}
        >
          <View style={[styles.scannerModalContent, { backgroundColor: '#09090C', borderColor: '#222226', padding: 24 }]}>
            <View style={styles.modalHeaderRowClose}>
              <Text style={styles.scanModalTitle}>MEDIDAS CORPORALES</Text>
              <Pressable onPress={() => setShowWeightHeightModal(false)} style={styles.closeBtn}>
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={[styles.scanModalSub, { marginBottom: 20 }]}>Registra tu peso y altura actual para el seguimiento</Text>

            {modalError ? (
              <Text style={styles.errorText}>{modalError}</Text>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej. 72.5"
                placeholderTextColor="#636366"
                keyboardType="numeric"
                value={weightInput}
                onChangeText={(text) => {
                  setWeightInput(text);
                  setModalError('');
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Altura (cm)</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej. 175"
                placeholderTextColor="#636366"
                keyboardType="numeric"
                value={heightInput}
                onChangeText={(text) => {
                  setHeightInput(text);
                  setModalError('');
                }}
              />
            </View>

            <Pressable
              onPress={handleSaveWeightHeight}
              style={({ pressed }) => [
                styles.acceptScanBtn,
                { backgroundColor: '#FFFFFF', opacity: pressed ? 0.8 : 1, marginTop: 12 }
              ]}
            >
              <Text style={styles.acceptScanBtnText}>Guardar Medidas</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  avatarAddBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#050508', // Matches page background to look cutout
  },
  avatarAddBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
    textAlign: 'center',
    marginTop: -1,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 13,
    marginBottom: 18,
  },
  countersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
  },
  counterCol: {
    flex: 1,
    alignItems: 'center',
  },
  counterVal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  counterLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: 30,
  },
  sectionContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  barOuter: {
    height: 80,
    width: 8,
    backgroundColor: '#1E1E24',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barInner: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 8,
    fontWeight: '500',
  },
  tooltip: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tooltipText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  metricsGrid: {
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  metricCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
    aspectRatio: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: 'normal',
    opacity: 0.7,
  },
  metricSub: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    letterSpacing: 1,
    marginTop: 8,
  },
  emptyBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  horizontalScrollContent: {
    paddingRight: 20,
    gap: 16,
    paddingBottom: 8,
  },
  historyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    height: 185,
    justifyContent: 'space-between',
  },
  cardSlide: {
    flex: 1,
    flexDirection: 'row',
  },
  slideLeft: {
    flex: 1.2,
    justifyContent: 'space-between',
  },
  slideRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCardDate: {
    fontSize: 11,
    marginTop: 2,
  },
  historyMetricsGrid: {
    gap: 6,
    marginVertical: 12,
  },
  historyMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyMetricText: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
    marginTop: 4,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniSilhouettesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  miniSilhouetteWrapper: {
    alignItems: 'center',
    backgroundColor: '#0A0A0E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C24',
    padding: 4,
    width: 52,
    height: 105,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  silhouetteLabel: {
    fontSize: 7,
    color: '#636366',
    fontWeight: 'bold',
    marginTop: 2,
  },
  slideExercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backSlideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  backSlideBtnText: {
    fontSize: 10,
    fontWeight: '600',
  },
  exercisesListScroll: {
    flex: 1,
  },
  exListRow: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A22',
    paddingBottom: 6,
  },
  exListRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exListName: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  exListCategory: {
    fontSize: 9,
    fontWeight: '600',
  },
  exListSetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  exSetPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  exSetText: {
    fontSize: 9,
    fontWeight: '600',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  carouselDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 16,
  },
  scannerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerModalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  scanViewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scanModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scanModalSub: {
    color: '#AEAEB2',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  scannerGridBox: {
    width: 200,
    height: 280,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3A3A40',
    backgroundColor: '#0F0F12',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  scannerBodyOutline: {
    opacity: 0.6,
  },
  scannerLaserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    width: '100%',
    backgroundColor: '#0F0F12',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 16,
    marginBottom: 24,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultLabel: {
    color: '#AEAEB2',
    fontSize: 13,
    fontWeight: '500',
  },
  resultValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultUnit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#8E8E93',
  },
  acceptScanBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptScanBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalHeaderRowClose: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#AEAEB2',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalTextInput: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222226',
    backgroundColor: '#0F0F12',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
});

