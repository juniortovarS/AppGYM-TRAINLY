import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { Dumbbell, Plus, Info, Play, Edit3 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

export const TrainingHomePage: React.FC = () => {
  const { colors, typography } = useTheme();
  const { routines } = useActivityStore();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
          TUS ENTRENAMIENTOS
        </Text>
        <Text style={[styles.subtitle, { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
          TRAINLY PRO
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {routines.length === 0 ? (
          /* EMPTY STATE PREMIUM */
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.emptyIconBg, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Dumbbell size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
              Aún no tienes entrenamientos
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              Empieza creando tu primera rutina personalizada.
            </Text>
            
            <Pressable 
              onPress={() => navigation.navigate('CreateRoutine')}
              style={({ pressed }) => [
                styles.newRoutineBtn, 
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Plus size={18} color={colors.textInverse} style={{ marginRight: 8 }} />
              <Text style={[styles.newRoutineBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                Nueva Rutina
              </Text>
            </Pressable>
          </MotiView>
        ) : (
          routines.map((routine, idx) => (
            <MotiView 
              key={routine.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: idx * 100 }}
            >
              <Pressable 
                onPress={() => navigation.navigate('RoutineDetail', { routineId: routine.id })}
                style={({ pressed }) => [
                  styles.routineCard, 
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }
                ]}
              >
              <View style={styles.routineHeader}>
                <View>
                  <Text style={[styles.routineName, { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold }]}>
                    {routine.name}
                  </Text>
                  <Text style={[styles.routineMeta, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                    {routine.exercises.length} ejercicios, 68 min
                  </Text>
                </View>
                <Pressable>
                  <Edit3 size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Distribución Muscular (Visual Muckup basdo en img) */}
              <View style={styles.distributionSection}>
                <Text style={[styles.distributionTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                  Distribución muscular
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.distributionScroll}>
                  {['Femoral', 'Cuádriceps', 'Glúteos'].map((muscle, index) => (
                    <View key={index} style={[styles.muscleBadge, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
                      <Text style={[styles.muscleName, { color: colors.textPrimary, fontSize: typography.sizes.xs }]}>
                        {muscle}
                      </Text>
                      <View style={[styles.musclePercentBadge, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                        <Text style={[styles.musclePercent, { color: colors.primary, fontSize: 10, fontWeight: 'bold' }]}>
                          30%
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Ejercicios Lista Corta */}
              <View style={styles.exerciseList}>
                <View style={styles.exerciseListHeader}>
                  <Text style={[styles.exerciseListTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    {routine.exercises.length} ejercicios
                  </Text>
                  <Pressable style={[styles.smallAddBtn, { backgroundColor: colors.cardElevated }]}>
                    <Plus size={14} color={colors.textPrimary} />
                  </Pressable>
                </View>

                {routine.exercises.slice(0, 3).map((ex, i) => (
                  <View key={ex.id} style={styles.exerciseItemRow}>
                    <Image source={{ uri: ex.gifUrl }} style={styles.exercisePreviewImg} contentFit="cover" />
                    <View style={styles.exerciseItemInfo}>
                      <Text style={[styles.exerciseItemSeries, { color: colors.textSecondary, fontSize: 11 }]}>
                        3 series x 10 reps
                      </Text>
                      <Text style={[styles.exerciseItemName, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '600' }]}>
                        {ex.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Pressable 
                onPress={() => {
                  useActivityStore.getState().startWorkoutSession(routine);
                  navigation.navigate('ActiveWorkout');
                }}
                style={({ pressed }) => [
                  styles.startBtn, 
                  { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <Play size={16} color={colors.textInverse} style={{ marginRight: 6 }} />
                <Text style={[styles.startBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: 'bold' }]}>
                  Empezar Entrenamiento
                </Text>
              </Pressable>
              </Pressable>
            </MotiView>
          ))
        )}

        {/* Action Button if routines exist */}
        {routines.length > 0 && (
          <Pressable 
            onPress={() => navigation.navigate('CreateRoutine')}
            style={({ pressed }) => [
              styles.newRoutineBtn, 
              { backgroundColor: colors.primary, marginTop: 16, opacity: pressed ? 0.8 : 1, justifyContent: 'center' }
            ]}
          >
            <Plus size={18} color={colors.textInverse} style={{ marginRight: 8 }} />
            <Text style={[styles.newRoutineBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
              Crear Otra Rutina
            </Text>
          </Pressable>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
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
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySub: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  newRoutineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  newRoutineBtnText: {},
  routineCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  routineName: {
    marginBottom: 4,
  },
  routineMeta: {},
  distributionSection: {
    marginBottom: 24,
  },
  distributionTitle: {
    marginBottom: 12,
  },
  distributionScroll: {
    gap: 12,
  },
  muscleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  muscleName: {
    marginRight: 8,
  },
  musclePercentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  musclePercent: {},
  exerciseList: {
    marginBottom: 20,
  },
  exerciseListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseListTitle: {},
  smallAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exercisePreviewImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
  },
  exerciseItemInfo: {
    marginLeft: 16,
    flex: 1,
  },
  exerciseItemSeries: {
    marginBottom: 4,
  },
  exerciseItemName: {},
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  startBtnText: {},
});
