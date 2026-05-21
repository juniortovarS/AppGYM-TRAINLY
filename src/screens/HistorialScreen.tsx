import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../hooks/useTheme';
import { useActivityStore, WorkoutHistoryItem } from '../store/useActivityStore';
import { Calendar, Timer, Flame, ChevronDown, ChevronUp, Clipboard, Dumbbell } from 'lucide-react-native';

const HistoryCard: React.FC<{ item: WorkoutHistoryItem; index: number }> = ({ item, index }) => {
  const { colors, spacing, typography } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 50 }}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={[styles.workoutName, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
            {item.name}
          </Text>
          <View style={styles.dateRow}>
            <Calendar size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.dateText, { color: colors.textSecondary, fontSize: typography.sizes.caption }]}>
              {item.date}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {expanded ? (
            <ChevronUp size={20} color={colors.primary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </View>
      </Pressable>

      {/* Summary Row */}
      <View style={[styles.summaryRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Timer size={14} color={colors.primary} style={{ marginRight: 5 }} />
          <Text style={[styles.summaryText, { color: colors.textPrimary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            {item.duration} min
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Flame size={14} color={colors.accentGold} style={{ marginRight: 5 }} />
          <Text style={[styles.summaryText, { color: colors.textPrimary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            {item.calories} kcal
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Dumbbell size={14} color={colors.textSecondary} style={{ marginRight: 5 }} />
          <Text style={[styles.summaryText, { color: colors.textPrimary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
            {item.exercises.length} {item.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
          </Text>
        </View>
      </View>

      {/* Collapsible Details */}
      <AnimatePresence>
        {expanded && (
          <MotiView
            from={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'timing', duration: 250 }}
            style={styles.detailsContainer}
          >
            {item.exercises.map((ex, exIdx) => (
              <View
                key={ex.exerciseId}
                style={[
                  styles.exerciseLog,
                  { borderBottomColor: exIdx === item.exercises.length - 1 ? 'transparent' : colors.border },
                ]}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exName, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    {ex.name}
                  </Text>
                  <Text style={[styles.exBodyPart, { color: colors.primary, fontSize: 10, fontWeight: '700' }]}>
                    {ex.bodyPart.toUpperCase()}
                  </Text>
                </View>

                {/* Sets List */}
                <View style={styles.setsList}>
                  {ex.sets.map((set, setIdx) => (
                    <View key={setIdx} style={styles.setRow}>
                      <Text style={[styles.setText, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                        Serie {setIdx + 1}:
                      </Text>
                      <Text style={[styles.setValueText, { color: colors.textPrimary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
                        {set.reps} reps x {set.weight} kg
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </MotiView>
        )}
      </AnimatePresence>
    </MotiView>
  );
};

export const HistorialScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { workoutHistory } = useActivityStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
          HISTORIAL
        </Text>
        <Text style={[styles.subtitle, { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
          REGISTRO DE ENTRENAMIENTOS
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {workoutHistory.length === 0 ? (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.emptyBox, { borderColor: colors.border }]}
          >
            <Clipboard size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginBottom: 8 }]}>
              Historial Vacío
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              Aún no has completado ningún entrenamiento. Loggea un ejercicio en la pestaña de entrenar para verlo aquí.
            </Text>
          </MotiView>
        ) : (
          workoutHistory.map((w, index) => (
            <HistoryCard key={w.id} item={w} index={index} />
          ))
        )}
        {/* Navigation Tab Bar offset */}
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
  emptyBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    textAlign: 'center',
  },
  emptyText: {
    letterSpacing: 0.5,
  },
  emptySubtext: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flex: 1,
  },
  workoutName: {
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {},
  headerRight: {
    marginLeft: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {},
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  exerciseLog: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  exerciseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exName: {
    flex: 1,
  },
  exBodyPart: {},
  setsList: {
    gap: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setText: {
    width: 60,
  },
  setValueText: {},
});
