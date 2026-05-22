import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Settings, ChevronRight, Flame, Lock, CheckCircle2, Award, Trophy, Zap, Shield, TrendingUp, Clock, Dumbbell } from 'lucide-react-native';
import { AnatomyHeatmap } from '../components/AnatomyHeatmap';
import { useActivityStore } from '../store/useActivityStore';

const { width } = Dimensions.get('window');

const TIER_RANGOS = [
  { id: 1, name: 'Recluta', min: 0, max: 2, desc: 'Comienza tu viaje en el fitness.', label: 'Rango I' },
  { id: 2, name: 'Atleta', min: 3, max: 7, desc: 'Establece hábitos constantes.', label: 'Rango II' },
  { id: 3, name: 'Guerrero', min: 8, max: 14, desc: 'Supera tus límites diarios.', label: 'Rango III' },
  { id: 4, name: 'Campeón', min: 15, max: 24, desc: 'Domina los entrenamientos.', label: 'Rango IV' },
  { id: 5, name: 'Leyenda', min: 25, max: Infinity, desc: 'Estado físico legendario.', label: 'Rango V' },
];

export const RangosScreen: React.FC = () => {
  const { colors, typography } = useTheme();
  const [activeTab, setActiveTab] = useState<'Rangos' | 'Estadísticas'>('Rangos');
  const { workoutHistory } = useActivityStore();

  const workoutCount = workoutHistory.length;

  // Calculate current range
  const currentRangeIndex = useMemo(() => {
    const idx = TIER_RANGOS.findIndex(r => workoutCount >= r.min && workoutCount <= r.max);
    return idx === -1 ? 0 : idx;
  }, [workoutCount]);

  const currentRange = TIER_RANGOS[currentRangeIndex];

  // Calculate next range progress
  const progressInfo = useMemo(() => {
    if (currentRangeIndex === TIER_RANGOS.length - 1) {
      return { percentage: 100, remaining: 0, target: currentRange.min, label: 'Nivel Máximo' };
    }
    const nextRange = TIER_RANGOS[currentRangeIndex + 1];
    const rangeSpan = nextRange.min - currentRange.min;
    const progressInSpan = workoutCount - currentRange.min;
    const percentage = Math.min(100, Math.max(0, (progressInSpan / rangeSpan) * 100));
    const remaining = nextRange.min - workoutCount;
    return {
      percentage,
      remaining,
      target: nextRange.min,
      label: `${workoutCount} / ${nextRange.min} entrenamientos`,
    };
  }, [workoutCount, currentRangeIndex, currentRange]);

  // Streak counter (distinct workout days)
  const streak = useMemo(() => {
    if (workoutHistory.length === 0) return 0;
    const dates = workoutHistory.map(w => {
      const ts = parseInt(w.id.replace('history-', ''));
      if (isNaN(ts)) return '';
      return new Date(ts).toDateString();
    }).filter(d => d !== '');
    return Array.from(new Set(dates)).length;
  }, [workoutHistory]);

  // Statistics summaries
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalTime = 0;
    let totalCalories = 0;

    workoutHistory.forEach(workout => {
      totalTime += workout.duration;
      totalCalories += workout.calories;
      workout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed) {
            totalVolume += set.reps * set.weight;
          }
        });
      });
    });

    return {
      totalVolume,
      totalTime,
      totalCalories,
      avgVolume: workoutHistory.length > 0 ? Math.round(totalVolume / workoutHistory.length) : 0,
      avgDuration: workoutHistory.length > 0 ? Math.round(totalTime / workoutHistory.length) : 0,
    };
  }, [workoutHistory]);

  // Icon mapping for tiers
  const getTierIcon = (id: number, active: boolean, size: number = 18) => {
    const color = active ? '#FFFFFF' : '#8E8E93';
    switch (id) {
      case 1: return <Zap size={size} color={color} />;
      case 2: return <Shield size={size} color={color} />;
      case 3: return <Award size={size} color={color} />;
      case 4: return <Trophy size={size} color={color} />;
      case 5: return <Trophy size={size} color={active ? '#FFD700' : color} />; // Golden touch for Legend
      default: return <Award size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#050508' }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: '#1C1C1E' }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TRAINLY</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={16} color={streak > 0 ? '#FFFFFF' : '#A0A0A0'} />
            <Text style={[styles.streakText, streak > 0 && { color: '#FFFFFF' }]}>{streak}</Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => alert('Próximamente: Ajustes')}>
            <Settings size={22} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsRow}>
        <Pressable onPress={() => setActiveTab('Rangos')} style={[styles.tabBtn, activeTab === 'Rangos' && styles.activeTabBtn]}>
          <Text style={[styles.tabText, activeTab === 'Rangos' ? styles.activeTabText : styles.inactiveTabText]}>Rangos</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('Estadísticas')} style={[styles.tabBtn, activeTab === 'Estadísticas' && styles.activeTabBtn]}>
          <Text style={[styles.tabText, activeTab === 'Estadísticas' ? styles.activeTabText : styles.inactiveTabText]}>Estadísticas</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Rangos' ? (
          <>
            {/* RANGO ACTUAL CARD */}
            <View style={styles.rangoMainCard}>
              <View style={styles.rangoMainHeader}>
                <View style={styles.rangoBadgeIcon}>
                  {getTierIcon(currentRange.id, true, 24)}
                </View>
                <View>
                  <Text style={styles.rangoLabelText}>{currentRange.label}</Text>
                  <Text style={styles.rangoNameText}>{currentRange.name.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.rangoDescText}>{currentRange.desc}</Text>
              
              {/* PROGRESS BAR */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressLabelText}>Progreso de Rango</Text>
                  <Text style={styles.progressValueText}>{progressInfo.label}</Text>
                </View>
                <View style={styles.barOuter}>
                  <View style={[styles.barInner, { width: `${progressInfo.percentage}%` }]} />
                </View>
                {progressInfo.remaining > 0 ? (
                  <Text style={styles.remainingText}>
                    Faltan {progressInfo.remaining} {progressInfo.remaining === 1 ? 'entrenamiento' : 'entrenamientos'} para el siguiente rango
                  </Text>
                ) : (
                  <Text style={styles.remainingText}>¡Has alcanzado el rango máximo absoluto!</Text>
                )}
              </View>
            </View>

            {/* DYNAMIC HEATMAP */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mapa de Calor Muscular</Text>
              <Text style={styles.sectionSubtitle}>Los músculos se iluminan a medida que entrenas</Text>
            </View>
            <AnatomyHeatmap />

            {/* RANGO TIMELINE */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Línea de Rangos</Text>
              <Text style={styles.sectionSubtitle}>Completa entrenamientos para ascender</Text>
            </View>

            <View style={styles.timelineContainer}>
              {TIER_RANGOS.map((tier, index) => {
                const isCompleted = currentRangeIndex > index;
                const isActive = currentRangeIndex === index;
                const isLocked = currentRangeIndex < index;
                const isLast = index === TIER_RANGOS.length - 1;

                // Nodes styling
                let nodeBg = '#121216';
                let nodeBorder = '#252533';
                if (isCompleted) {
                  nodeBg = '#FFFFFF';
                  nodeBorder = '#FFFFFF';
                } else if (isActive) {
                  nodeBg = '#121216';
                  nodeBorder = '#FFFFFF';
                }

                return (
                  <View key={tier.id} style={styles.timelineItem}>
                    {!isLast && (
                      <View 
                        style={[
                          styles.timelineLine, 
                          isCompleted && styles.timelineLineActive
                        ]} 
                      />
                    )}
                    
                    <View style={[styles.timelineNode, { backgroundColor: nodeBg, borderColor: nodeBorder }]}>
                      {isCompleted ? (
                        <CheckCircle2 size={18} color="#000000" />
                      ) : isLocked ? (
                        <Lock size={14} color="#8E8E93" />
                      ) : (
                        <View style={styles.activeDot} />
                      )}
                    </View>

                    <View style={styles.timelineContent}>
                      <View style={styles.timelineTitleRow}>
                        <Text 
                          style={[
                            styles.timelineTierName, 
                            isActive && { color: '#FFFFFF', fontWeight: 'bold' },
                            isCompleted && { color: '#FFFFFF' },
                            isLocked && { color: '#8E8E93' }
                          ]}
                        >
                          {tier.label}: {tier.name}
                        </Text>
                        <View style={[styles.tierIconBox, isActive && { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                          {getTierIcon(tier.id, !isLocked, 14)}
                        </View>
                      </View>
                      <Text style={[styles.timelineTierRange, isLocked ? { color: '#4E4E52' } : { color: '#AEAEB2' }]}>
                        Requisito: {tier.min === 25 ? '25+' : `${tier.min} - ${tier.max}`} entrenamientos
                      </Text>
                      <Text style={[styles.timelineTierDesc, isLocked ? { color: '#3A3A40' } : { color: '#8E8E93' }]}>
                        {tier.desc}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          /* ESTADÍSTICAS TAB CONTENT */
          <View style={styles.statsTabContent}>
            {/* STATS OVERVIEW CARD */}
            <View style={styles.statsCardLarge}>
              <Text style={styles.statsOverviewHeading}>RESUMEN GENERAL</Text>
              
              <View style={styles.statsItemsGrid}>
                <View style={styles.statsGridItem}>
                  <Dumbbell size={20} color="#FFFFFF" style={{ marginBottom: 6 }} />
                  <Text style={styles.statsGridVal}>{stats.totalVolume.toLocaleString('es-ES')} kg</Text>
                  <Text style={styles.statsGridLabel}>Volumen Total</Text>
                </View>
                <View style={styles.statsGridItem}>
                  <Clock size={20} color="#FFFFFF" style={{ marginBottom: 6 }} />
                  <Text style={styles.statsGridVal}>{stats.totalTime} min</Text>
                  <Text style={styles.statsGridLabel}>Tiempo Activo</Text>
                </View>
              </View>

              <View style={[styles.statsItemsGrid, { marginTop: 20 }]}>
                <View style={styles.statsGridItem}>
                  <Flame size={20} color="#FFFFFF" style={{ marginBottom: 6 }} />
                  <Text style={styles.statsGridVal}>{stats.totalCalories.toLocaleString('es-ES')} kcal</Text>
                  <Text style={styles.statsGridLabel}>Calorías Quemadas</Text>
                </View>
                <View style={styles.statsGridItem}>
                  <Award size={20} color="#FFFFFF" style={{ marginBottom: 6 }} />
                  <Text style={styles.statsGridVal}>{workoutCount}</Text>
                  <Text style={styles.statsGridLabel}>Rutinas Completas</Text>
                </View>
              </View>
            </View>

            {/* AVG CARDS */}
            <View style={styles.avgStatsRow}>
              <View style={styles.avgStatCard}>
                <Text style={styles.avgStatLabel}>Promedio Volumen</Text>
                <Text style={styles.avgStatVal}>{stats.avgVolume} kg</Text>
                <Text style={styles.avgStatSub}>Por sesión</Text>
              </View>
              <View style={styles.avgStatCard}>
                <Text style={styles.avgStatLabel}>Promedio Duración</Text>
                <Text style={styles.avgStatVal}>{stats.avgDuration} min</Text>
                <Text style={styles.avgStatSub}>Por sesión</Text>
              </View>
            </View>

            {/* HISTORICAL WORKOUTS LIST */}
            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>Entrenamientos Recientes</Text>
              <Text style={styles.sectionSubtitle}>Historial ordenado cronológicamente</Text>
            </View>

            {workoutHistory.length === 0 ? (
              <View style={styles.noStatsBox}>
                <Text style={styles.noStatsText}>Sin entrenamientos registrados aún.</Text>
                <Text style={styles.noStatsSub}>Tus métricas aparecerán aquí tras realizar tu primera rutina.</Text>
              </View>
            ) : (
              workoutHistory.map((w, idx) => (
                <View key={w.id} style={styles.recentWorkoutItem}>
                  <View style={styles.recentWorkoutDot} />
                  <View style={styles.recentWorkoutMain}>
                    <Text style={styles.recentWorkoutName}>{w.name}</Text>
                    <Text style={styles.recentWorkoutDetails}>
                      {w.date} • {w.duration} min • {w.calories} kcal
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#8E8E93" />
                </View>
              ))
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  inactiveTabText: {
    color: '#8E8E93',
  },
  scrollContent: {
    paddingTop: 20,
  },
  rangoMainCard: {
    marginHorizontal: 20,
    backgroundColor: '#121216',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 20,
    marginBottom: 24,
  },
  rangoMainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  rangoBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A40',
  },
  rangoLabelText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rangoNameText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rangoDescText: {
    color: '#AEAEB2',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  progressBarWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#222226',
    paddingTop: 16,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabelText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  progressValueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  barOuter: {
    height: 8,
    backgroundColor: '#1E1E24',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barInner: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  remainingText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  timelineContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 36, // Start below the node
    bottom: -32, // Reach down to next node
    width: 2,
    backgroundColor: '#222226',
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: '#FFFFFF',
  },
  timelineNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    zIndex: 2,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineTierName: {
    fontSize: 16,
    color: '#4E4E52',
    fontWeight: '600',
  },
  tierIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineTierRange: {
    fontSize: 13,
    marginBottom: 4,
  },
  timelineTierDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  statsTabContent: {
    paddingHorizontal: 20,
  },
  statsCardLarge: {
    backgroundColor: '#121216',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 20,
    marginBottom: 20,
  },
  statsOverviewHeading: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 18,
  },
  statsItemsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGridItem: {
    flex: 1,
  },
  statsGridVal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statsGridLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  avgStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  avgStatCard: {
    flex: 1,
    backgroundColor: '#121216',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 16,
  },
  avgStatLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  avgStatVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  avgStatSub: {
    color: '#4E4E52',
    fontSize: 11,
  },
  noStatsBox: {
    backgroundColor: '#121216',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222226',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noStatsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
    textAlign: 'center',
  },
  noStatsSub: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  recentWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121216',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1C1C24',
  },
  recentWorkoutDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 16,
  },
  recentWorkoutMain: {
    flex: 1,
  },
  recentWorkoutName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  recentWorkoutDetails: {
    color: '#8E8E93',
    fontSize: 12,
  },
});
