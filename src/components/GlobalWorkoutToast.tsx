import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Check, X, Minus, Plus } from 'lucide-react-native';
import { useActivityStore } from '../store/useActivityStore';
import { useTheme } from '../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GlobalWorkoutToast: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const {
    workoutHistory,
    weeklyWorkoutGoal,
    setWeeklyWorkoutGoal,
    setShowWorkoutCompletedToast,
  } = useActivityStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to calculate workouts completed this week (since Monday at 00:00:00 local time)
  const getWorkoutsThisWeekCount = () => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const mondayTimestamp = monday.getTime();

    return workoutHistory.filter((item) => {
      const match = item.id.match(/history-(\d+)/);
      if (!match) return false;
      const timestamp = parseInt(match[1], 10);
      return timestamp >= mondayTimestamp;
    }).length;
  };

  const completedThisWeek = getWorkoutsThisWeekCount();
  const isFirstTime = workoutHistory.length <= 1;

  // Setup auto close timer
  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setShowWorkoutCompletedToast(false);
    }, 7000); // 7 seconds
  };

  const resetTimer = () => {
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleDecreaseGoal = () => {
    if (weeklyWorkoutGoal > 1) {
      setWeeklyWorkoutGoal(weeklyWorkoutGoal - 1);
      resetTimer();
    }
  };

  const handleIncreaseGoal = () => {
    if (weeklyWorkoutGoal < 14) {
      setWeeklyWorkoutGoal(weeklyWorkoutGoal + 1);
      resetTimer();
    }
  };

  const handleClose = () => {
    setShowWorkoutCompletedToast(false);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -100, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -100, scale: 0.95 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 120,
      }}
      style={[
        styles.toastContainer,
        {
          backgroundColor: '#0F0F12',
          borderColor: colors.border,
          shadowColor: '#000',
        },
      ]}
    >
      {/* Toast Content Row */}
      <View style={styles.toastContentRow}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Check size={16} color="#000000" strokeWidth={3.5} />
        </View>

        {/* Text Area */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: '#FFFFFF', fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
            ¡Entrenamiento Guardado!
          </Text>
          <Text style={[styles.message, { color: '#AEAEB2', fontSize: typography.sizes.sm }]}>
            {isFirstTime
              ? 'Vas 1 ejercicio esta semana, pon una meta de entrenamientos semanal'
              : `Entrenamientos esta semana: ${completedThisWeek}/${weeklyWorkoutGoal}`}
          </Text>
        </View>

        {/* Close Button */}
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={18} color="#8E8E93" />
        </Pressable>
      </View>

      {/* Goal Adjuster Controls */}
      <View style={[styles.goalSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.goalLabel, { color: '#8E8E93', fontSize: typography.sizes.xs }]}>
          Meta Semanal:
        </Text>
        <View style={styles.adjusterRow}>
          <Pressable onPress={handleDecreaseGoal} style={styles.adjustButton}>
            <Minus size={14} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
          <View style={styles.goalValueContainer}>
            <Text style={[styles.goalValue, { color: '#FFFFFF', fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
              {weeklyWorkoutGoal}
            </Text>
          </View>
          <Pressable onPress={handleIncreaseGoal} style={styles.adjustButton}>
            <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
        <Text style={[styles.goalUnit, { color: '#8E8E93', fontSize: typography.sizes.xs }]}>
          {weeklyWorkoutGoal === 1 ? 'entrenamiento / sem' : 'entrenamientos / sem'}
        </Text>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : Platform.OS === 'web' ? 24 : 40,
    left: 16,
    right: 16,
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    zIndex: 99999,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  toastContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  message: {
    lineHeight: 18,
  },
  closeButton: {
    padding: 2,
  },
  goalSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalLabel: {
    fontWeight: '500',
  },
  adjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  adjustButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalValueContainer: {
    paddingHorizontal: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  goalValue: {
    textAlign: 'center',
  },
  goalUnit: {
    fontWeight: '500',
  },
});
