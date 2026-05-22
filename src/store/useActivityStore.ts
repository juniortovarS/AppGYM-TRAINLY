import { create } from 'zustand';
import AppStorage from '../lib/storage';
import { supabase } from '../lib/supabase';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: 'Bíceps' | 'Tríceps' | 'Hombros' | 'Piernas' | 'Pecho' | 'Espalda' | 'Core';
  category: 'Mancuernas' | 'Máquina' | 'Peso corporal';
  description: string;
  gifUrl: string;
}

export interface SetLog {
  reps: number;
  weight: number; // in kg
  completed: boolean;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  name: string;
  bodyPart: string;
  category: string;
  gifUrl?: string;
  sets: SetLog[];
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  startTime: number; // timestamp
  exercises: WorkoutExerciseLog[];
}

export interface WorkoutHistoryItem {
  id: string;
  name: string;
  date: string;
  duration: number; // in minutes
  calories: number;
  exercises: WorkoutExerciseLog[];
}

export interface DailyMetrics {
  caloriesBurned: number;
  caloriesTarget: number;
  activeTime: number; // in minutes
  activeTimeTarget: number;
  recoveryScore: number;
  strainScore: number;
  heartRateCurrent: number;
  heartRateResting: number;
  hrv: number;
}

interface ActivityState {
  metrics: DailyMetrics;
  exercises: Exercise[];
  routines: Routine[];
  activeWorkoutSession: WorkoutSession | null;
  workoutHistory: WorkoutHistoryItem[];
  isLoading: boolean;
  draftRoutineExercises: Exercise[];
  userWeight: number | null;
  userHeight: number | null;
  friendsList: string[];
  currentUserEmail: string | null;
  loadUserData: (email: string) => Promise<void>;
  clearUserData: () => void;
  addExerciseToDraft: (exercise: Exercise) => void;
  removeExerciseFromDraft: (exerciseId: string) => void;
  clearDraft: () => void;
  setDraftExercises: (exercises: Exercise[]) => void;

  // Actions
  setWeightAndHeight: (weight: number | null, height: number | null) => void;
  addFriend: (name: string) => void;
  removeFriend: (name: string) => void;
  createRoutine: (name: string, description: string, selectedExercises: Exercise[]) => string;
  generateRoutineFromQuiz: (goal: string, experience: string, frequency: string, equipment: string) => Routine;
  startWorkoutSession: (routine: Routine) => void;
  updateWorkoutSet: (exerciseId: string, setIndex: number, field: keyof SetLog, value: any) => void;
  addSetToExercise: (exerciseId: string) => void;
  removeSetFromExercise: (exerciseId: string, setIndex: number) => void;
  removeExerciseFromSession: (exerciseId: string) => void;
  replaceExerciseInSession: (exerciseId: string, newExercise: Exercise) => void;
  finishWorkoutSession: () => boolean; // returns true if successfully saved, false if not saved (no completed exercises)
  cancelWorkoutSession: () => void;
  refreshMetrics: () => Promise<void>;
  weeklyWorkoutGoal: number;
  setWeeklyWorkoutGoal: (goal: number) => void;
  showWorkoutCompletedToast: boolean;
  setShowWorkoutCompletedToast: (show: boolean) => void;
}

// Seed exercises
const SEED_EXERCISES: Exercise[] = [
  {
    id: 'biceps-dumbbell-alternate-biceps-curl',
    name: 'Curl de Bíceps Alterno con Mancuernas',
    bodyPart: 'Bíceps',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa los bíceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-alternate-biceps-curl.gif'
  },
  {
    id: 'biceps-dumbbell-hammer-curl',
    name: 'Curl de Bíceps Martillo',
    bodyPart: 'Bíceps',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa los bíceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-hammer-curl.gif'
  },
  {
    id: 'biceps-dumbbell-concentration-curl',
    name: 'Curl Concentrado con Mancuerna',
    bodyPart: 'Bíceps',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa los bíceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/dumbbell-concentration-curl.gif'
  },
  {
    id: 'biceps-cable-curl',
    name: 'Curl de Bíceps en Polea',
    bodyPart: 'Bíceps',
    category: 'Máquina',
    description: 'Ajusta la polea a la altura indicada y selecciona el peso. Activa los bíceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/biceps/cable-curl.gif'
  },
  {
    id: 'triceps-cable-alternate-triceps-extension',
    name: 'Extensión de Tríceps en Polea',
    bodyPart: 'Tríceps',
    category: 'Máquina',
    description: 'Ajusta la polea a la altura indicada y selecciona el peso. Activa los tríceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/cable-alternate-triceps-extension.gif'
  },
  {
    id: 'triceps-three-bench-dip',
    name: 'Fondos de Tríceps en Paralelas',
    bodyPart: 'Tríceps',
    category: 'Peso corporal',
    description: 'Adopta la postura inicial con buena alineación corporal. Activa los tríceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/three-bench-dip.gif'
  },
  {
    id: 'triceps-barbell-lying-triceps-extension',
    name: 'Rompecráneos con Barra',
    bodyPart: 'Tríceps',
    category: 'Mancuernas',
    description: 'Carga el peso adecuado en la barra y adopta la postura inicial. Activa los tríceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/barbell-lying-triceps-extension.gif'
  },
  {
    id: 'triceps-barbell-seated-overhead-triceps-extension',
    name: 'Copa de Tríceps con Mancuerna',
    bodyPart: 'Tríceps',
    category: 'Mancuernas',
    description: 'Carga el peso adecuado en la barra y adopta la postura inicial. Activa los tríceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/triceps/barbell-seated-overhead-triceps-extension.gif'
  },
  {
    id: 'delts-dumbbell-seated-shoulder-press',
    name: 'Press Militar con Mancuernas',
    bodyPart: 'Hombros',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa los hombros antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-seated-shoulder-press.gif'
  },
  {
    id: 'delts-dumbbell-lateral-raise',
    name: 'Elevaciones Laterales con Mancuernas',
    bodyPart: 'Hombros',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa los hombros antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-lateral-raise.gif'
  },
  {
    id: 'delts-dumbbell-front-raise',
    name: 'Elevaciones Frontales con Mancuernas',
    bodyPart: 'Hombros',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa los hombros antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/dumbbell-front-raise.gif'
  },
  {
    id: 'delts-smith-rear-delt-row',
    name: 'Pájaros con Mancuernas',
    bodyPart: 'Hombros',
    category: 'Mancuernas',
    description: 'Coloca la barra en la máquina Smith a la altura adecuada. Activa los hombros antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/delts/smith-rear-delt-row.gif'
  },
  {
    id: 'glutes-band-squat',
    name: 'Sentadillas Libres',
    bodyPart: 'Piernas',
    category: 'Peso corporal',
    description: 'Fija la banda elástica y mantén la tensión inicial. Activa los glúteos antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/band-squat.gif'
  },
  {
    id: 'glutes-smith-leg-press',
    name: 'Prensa de Piernas',
    bodyPart: 'Piernas',
    category: 'Máquina',
    description: 'Coloca la barra en la máquina Smith a la altura adecuada. Activa los glúteos antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/smith-leg-press.gif'
  },
  {
    id: 'glutes-barbell-lunge',
    name: 'Zancadas con Mancuernas',
    bodyPart: 'Piernas',
    category: 'Mancuernas',
    description: 'Carga el peso adecuado en la barra y adopta la postura inicial. Activa los glúteos antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-lunge.gif'
  },
  {
    id: 'quads-split-squats',
    name: 'Sentadilla Búlgara con Mancuernas',
    bodyPart: 'Piernas',
    category: 'Mancuernas',
    description: 'Adopta la postura inicial con buena alineación corporal. Activa los cuádriceps antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/quads/split-squats.gif'
  },
  {
    id: 'glutes-barbell-romanian-deadlift',
    name: 'Peso Muerto Rumano con Barra',
    bodyPart: 'Piernas',
    category: 'Mancuernas',
    description: 'Carga el peso adecuado en la barra y adopta la postura inicial. Activa los glúteos antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/glutes/barbell-romanian-deadlift.gif'
  },
  {
    id: 'calves-hack-calf-raise',
    name: 'Elevación de Talones',
    bodyPart: 'Piernas',
    category: 'Peso corporal',
    description: 'Ajusta la máquina a tu medida y selecciona la carga. Activa los gemelos antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/calves/hack-calf-raise.gif'
  },
  {
    id: 'pectorals-barbell-bench-press',
    name: 'Press de Banca con Barra',
    bodyPart: 'Pecho',
    category: 'Mancuernas',
    description: 'Carga el peso adecuado en la barra y adopta la postura inicial. Activa el pectoral antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/barbell-bench-press.gif'
  },
  {
    id: 'pectorals-dumbbell-bench-press',
    name: 'Press de Banca con Mancuernas',
    bodyPart: 'Pecho',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa el pectoral antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-bench-press.gif'
  },
  {
    id: 'pectorals-dumbbell-fly',
    name: 'Aperturas con Mancuernas',
    bodyPart: 'Pecho',
    category: 'Mancuernas',
    description: 'Coge una mancuerna en cada mano (o la indicada) con un peso adecuado. Activa el pectoral antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/dumbbell-fly.gif'
  },
  {
    id: 'pectorals-push-up',
    name: 'Flexiones de Pecho',
    bodyPart: 'Pecho',
    category: 'Peso corporal',
    description: 'Adopta la postura inicial con buena alineación corporal. Activa el pectoral antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/push-up.gif'
  },
  {
    id: 'pectorals-cable-upper-chest-crossovers',
    name: 'Cruces de Poleas para Pecho',
    bodyPart: 'Pecho',
    category: 'Máquina',
    description: 'Ajusta la polea a la altura indicada y selecciona el peso. Activa el pectoral antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/cable-upper-chest-crossovers.gif'
  },
  {
    id: 'lats-pull-up',
    name: 'Dominadas en Barra',
    bodyPart: 'Espalda',
    category: 'Peso corporal',
    description: 'Adopta la postura inicial con buena alineación corporal. Activa los dorsales antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/pull-up.gif'
  },
  {
    id: 'upper-back-lever-bent-over-row',
    name: 'Remo con Barra Pendlay',
    bodyPart: 'Espalda',
    category: 'Mancuernas',
    description: 'Ajusta la máquina a tu medida y selecciona la carga. Activa la espalda alta antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/lever-bent-over-row.gif'
  },
  {
    id: 'upper-back-smith-one-arm-row',
    name: 'Remo con Mancuerna a una Mano',
    bodyPart: 'Espalda',
    category: 'Mancuernas',
    description: 'Coloca la barra en la máquina Smith a la altura adecuada. Activa la espalda alta antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/upper-back/smith-one-arm-row.gif'
  },
  {
    id: 'lats-reverse-grip-machine-lat-pulldown',
    name: 'Jalón al Pecho en Polea Alta',
    bodyPart: 'Espalda',
    category: 'Máquina',
    description: 'Ajusta la máquina a tu medida y selecciona la carga. Activa los dorsales antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/reverse-grip-machine-lat-pulldown.gif'
  },
  {
    id: 'lats-cable-seated-high-row-v-bar',
    name: 'Remo Sentado en Polea Baja',
    bodyPart: 'Espalda',
    category: 'Máquina',
    description: 'Ajusta la polea a la altura indicada y selecciona el peso. Activa los dorsales antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/lats/cable-seated-high-row-v-bar.gif'
  },
  {
    id: 'abs-weighted-front-plank',
    name: 'Plancha Abdominal Estándar',
    bodyPart: 'Core',
    category: 'Peso corporal',
    description: 'Adopta la postura inicial con buena alineación corporal. Activa el core antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/weighted-front-plank.gif'
  },
  {
    id: 'abs-cable-kneeling-crunch',
    name: 'Crunch Abdominal',
    bodyPart: 'Core',
    category: 'Máquina',
    description: 'Ajusta la polea a la altura indicada y selecciona el peso. Activa el core antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/cable-kneeling-crunch.gif'
  },
  {
    id: 'abs-hanging-leg-raise',
    name: 'Elevación de Piernas Suspendido',
    bodyPart: 'Core',
    category: 'Peso corporal',
    description: 'Adopta la postura inicial con buena alineación corporal. Activa el core antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/hanging-leg-raise.gif'
  },
  {
    id: 'abs-wheel-rollerout',
    name: 'Rueda Abdominal',
    bodyPart: 'Core',
    category: 'Peso corporal',
    description: 'Adopta la postura inicial con buena alineación corporal. Activa el core antes de iniciar el movimiento. Realiza el movimiento de forma controlada manteniendo la técnica. Vuelve a la posición inicial controlando la fase excéntrica. Mantén la respiración: exhala en el esfuerzo, inhala al volver.',
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/abs/wheel-rollerout.gif'
  }
];

const DEFAULT_METRICS: DailyMetrics = {
  caloriesBurned: 180,
  caloriesTarget: 600,
  activeTime: 15,
  activeTimeTarget: 60,
  recoveryScore: 88,
  strainScore: 8.5,
  heartRateCurrent: 72,
  heartRateResting: 58,
  hrv: 82,
};

const saveToStorage = async (email: string | null, key: string, value: any) => {
  if (!email) return;
  try {
    await AppStorage.setItem(`trainly_${key}_${email}`, JSON.stringify(value));
    
    // Sync to Supabase auth metadata (excluding active session to prevent rate limits)
    if (key !== 'active_session') {
      await supabase.auth.updateUser({
        data: {
          [key]: value
        }
      });
    }
  } catch (e) {
    console.error(`Error saving ${key} to AppStorage/Supabase:`, e);
  }
};

const removeFromStorage = async (email: string | null, key: string) => {
  if (!email) return;
  try {
    await AppStorage.removeItem(`trainly_${key}_${email}`);
    if (key !== 'active_session') {
      await supabase.auth.updateUser({
        data: {
          [key]: null
        }
      });
    }
  } catch (e) {
    console.error(`Error removing ${key} from AppStorage/Supabase:`, e);
  }
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  currentUserEmail: null,
  metrics: DEFAULT_METRICS,
  exercises: SEED_EXERCISES,
  routines: [], // Start empty to trigger the setup guide and wizard
  activeWorkoutSession: null,
  workoutHistory: [], // Start empty as requested ("solo si es que hice un ejercicio")
  isLoading: false,
  draftRoutineExercises: [],
  userWeight: null,
  userHeight: null,
  friendsList: [],
  weeklyWorkoutGoal: 4,
  showWorkoutCompletedToast: false,

  loadUserData: async (email: string) => {
    set({ isLoading: true, currentUserEmail: email });
    try {
      const routinesStr = await AppStorage.getItem(`trainly_routines_${email}`);
      const historyStr = await AppStorage.getItem(`trainly_history_${email}`);
      const metricsStr = await AppStorage.getItem(`trainly_metrics_${email}`);
      const goalStr = await AppStorage.getItem(`trainly_goal_${email}`);
      const activeSessionStr = await AppStorage.getItem(`trainly_active_session_${email}`);
      const friendsStr = await AppStorage.getItem(`trainly_friends_${email}`);

      let routines = routinesStr ? JSON.parse(routinesStr) : [];
      let workoutHistory = historyStr ? JSON.parse(historyStr) : [];
      let metrics = metricsStr ? JSON.parse(metricsStr) : DEFAULT_METRICS;
      let weeklyWorkoutGoal = goalStr ? Number(goalStr) : 4;
      const activeWorkoutSession = activeSessionStr ? JSON.parse(activeSessionStr) : null;
      let friendsList = friendsStr ? JSON.parse(friendsStr) : [];

      // Sync with Supabase Auth user_metadata to support multi-device syncing
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user?.user_metadata) {
          const meta = user.user_metadata;
          
          // 1. Sync routines
          if (meta.routines) {
            const mergedRoutines = [...routines];
            meta.routines.forEach((r: any) => {
              if (!mergedRoutines.some((existing) => existing.id === r.id)) {
                mergedRoutines.push(r);
              }
            });
            routines = mergedRoutines;
            await AppStorage.setItem(`trainly_routines_${email}`, JSON.stringify(routines));
          }
          
          // 2. Sync history
          if (meta.history) {
            const mergedHistory = [...workoutHistory];
            meta.history.forEach((h: any) => {
              if (!mergedHistory.some((existing) => existing.id === h.id)) {
                mergedHistory.push(h);
              }
            });
            workoutHistory = mergedHistory;
            await AppStorage.setItem(`trainly_history_${email}`, JSON.stringify(workoutHistory));
          }
          
          // 3. Sync metrics
          if (meta.metrics) {
            const isLocalDefault = JSON.stringify(metrics) === JSON.stringify(DEFAULT_METRICS);
            if (isLocalDefault || meta.metrics.caloriesBurned > metrics.caloriesBurned) {
              metrics = meta.metrics;
              await AppStorage.setItem(`trainly_metrics_${email}`, JSON.stringify(metrics));
            }
          }
          
          // 4. Sync weekly goal
          if (meta.goal && weeklyWorkoutGoal === 4) {
            weeklyWorkoutGoal = Number(meta.goal);
            await AppStorage.setItem(`trainly_goal_${email}`, String(weeklyWorkoutGoal));
          }
          
          // 5. Sync friends
          if (meta.friends) {
            const mergedFriends = [...friendsList];
            meta.friends.forEach((f: string) => {
              if (!mergedFriends.includes(f)) {
                mergedFriends.push(f);
              }
            });
            friendsList = mergedFriends;
            await AppStorage.setItem(`trainly_friends_${email}`, JSON.stringify(friendsList));
          }

          // Push any merged changes back to Supabase metadata to keep both in sync
          await supabase.auth.updateUser({
            data: {
              routines,
              history: workoutHistory,
              metrics,
              goal: weeklyWorkoutGoal,
              friends: friendsList
            }
          });
        }
      } catch (authError) {
        console.warn('Could not sync user_metadata from Supabase auth:', authError);
      }

      set({
        routines,
        workoutHistory,
        metrics,
        weeklyWorkoutGoal,
        activeWorkoutSession,
        friendsList,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error loading user data from AppStorage:', e);
      set({ isLoading: false });
    }
  },

  clearUserData: () => {
    set({
      currentUserEmail: null,
      routines: [],
      workoutHistory: [],
      metrics: DEFAULT_METRICS,
      activeWorkoutSession: null,
      friendsList: [],
      weeklyWorkoutGoal: 4,
    });
  },

  setWeeklyWorkoutGoal: (goal) => {
    set({ weeklyWorkoutGoal: goal });
    const email = get().currentUserEmail;
    if (email) {
      saveToStorage(email, 'goal', goal);
    }
  },

  setShowWorkoutCompletedToast: (show) => set({ showWorkoutCompletedToast: show }),
  setWeightAndHeight: (weight, height) => set({ userWeight: weight, userHeight: height }),
  
  addFriend: (name) => set((state) => {
    if (state.friendsList.includes(name)) return {};
    const updated = [...state.friendsList, name];
    saveToStorage(state.currentUserEmail, 'friends', updated);
    return { friendsList: updated };
  }),

  removeFriend: (name) => set((state) => {
    const updated = state.friendsList.filter((f) => f !== name);
    saveToStorage(state.currentUserEmail, 'friends', updated);
    return { friendsList: updated };
  }),

  addExerciseToDraft: (exercise) => {
    set((state) => {
      if (state.draftRoutineExercises.find(e => e.id === exercise.id)) return state;
      return { draftRoutineExercises: [...state.draftRoutineExercises, exercise] };
    });
  },

  removeExerciseFromDraft: (exerciseId) => {
    set((state) => ({
      draftRoutineExercises: state.draftRoutineExercises.filter((e) => e.id !== exerciseId)
    }));
  },

  clearDraft: () => {
    set({ draftRoutineExercises: [] });
  },

  setDraftExercises: (exercises) => {
    set({ draftRoutineExercises: exercises });
  },

  createRoutine: (name, description, selectedExercises) => {
    const newId = `routine-${Date.now()}`;
    const newRoutine: Routine = {
      id: newId,
      name,
      description,
      exercises: selectedExercises,
    };
    set((state) => {
      const updated = [...state.routines, newRoutine];
      saveToStorage(state.currentUserEmail, 'routines', updated);
      return {
        routines: updated,
        draftRoutineExercises: [], // clear draft on save
      };
    });
    return newId;
  },

  generateRoutineFromQuiz: (goal, experience, frequency, equipment) => {
    // Select exercises matching available equipment
    const availableExercises = SEED_EXERCISES.filter((ex) => {
      if (equipment === 'Mancuernas') return ex.category === 'Mancuernas' || ex.category === 'Peso corporal';
      if (equipment === 'Máquina') return ex.category === 'Máquina' || ex.category === 'Peso corporal';
      if (equipment === 'Peso corporal') return ex.category === 'Peso corporal';
      return true; // Todos
    });

    // Pick 4 to 5 balanced exercises
    const routineExercises: Exercise[] = [];
    const addExerciseFromPart = (bodyPart: string) => {
      const match = availableExercises.find((ex) => ex.bodyPart === bodyPart && !routineExercises.includes(ex));
      if (match) routineExercises.push(match);
    };

    if (goal === 'Fuerza' || goal === 'Hipertrofia') {
      addExerciseFromPart('Pecho');
      addExerciseFromPart('Espalda');
      addExerciseFromPart('Piernas');
      addExerciseFromPart('Hombros');
      addExerciseFromPart('Bíceps');
      addExerciseFromPart('Tríceps');
    } else { // Pérdida de grasa or Resistencia
      addExerciseFromPart('Piernas');
      addExerciseFromPart('Espalda');
      addExerciseFromPart('Pecho');
      addExerciseFromPart('Core');
      addExerciseFromPart('Hombros');
    }

    // Default if somehow empty
    if (routineExercises.length === 0) {
      routineExercises.push(SEED_EXERCISES[0], SEED_EXERCISES[4], SEED_EXERCISES[7], SEED_EXERCISES[10]);
    }

    // Create routine name
    const routineName = `Rutina Dorada: ${goal} (${equipment})`;
    const routineDesc = `Diseño personalizado para nivel ${experience}, entrenando ${frequency} con foco en ${goal.toLowerCase()}.`;

    const newRoutine: Routine = {
      id: `routine-quiz-${Date.now()}`,
      name: routineName,
      description: routineDesc,
      exercises: routineExercises.slice(0, 5), // Keep to a sweet spot of 5 exercises
    };

    set((state) => {
      const updated = [...state.routines, newRoutine];
      saveToStorage(state.currentUserEmail, 'routines', updated);
      return {
        routines: updated,
      };
    });

    return newRoutine;
  },

  startWorkoutSession: (routine) => {
    const sessionExercises: WorkoutExerciseLog[] = routine.exercises.map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      bodyPart: ex.bodyPart,
      category: ex.category,
      gifUrl: ex.gifUrl,
      sets: [
        { reps: 10, weight: ex.category === 'Peso corporal' ? 0 : 12, completed: false },
        { reps: 10, weight: ex.category === 'Peso corporal' ? 0 : 12, completed: false },
        { reps: 10, weight: ex.category === 'Peso corporal' ? 0 : 12, completed: false },
      ],
    }));

    const newSession = {
      id: `session-${Date.now()}`,
      name: routine.name,
      startTime: Date.now(),
      exercises: sessionExercises,
    };

    set({ activeWorkoutSession: newSession });
    saveToStorage(get().currentUserEmail, 'active_session', newSession);
  },

  updateWorkoutSet: (exerciseId, setIndex, field, value) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};
      
      const updatedExercises = state.activeWorkoutSession.exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        
        const updatedSets = ex.sets.map((set, idx) => {
          if (idx !== setIndex) return set;
          return { ...set, [field]: value };
        });
        
        return { ...ex, sets: updatedSets };
      });

      const updatedSession = {
        ...state.activeWorkoutSession,
        exercises: updatedExercises,
      };

      saveToStorage(state.currentUserEmail, 'active_session', updatedSession);

      return {
        activeWorkoutSession: updatedSession,
      };
    });
  },

  addSetToExercise: (exerciseId) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};

      const updatedExercises = state.activeWorkoutSession.exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        
        // Match metrics of the last set, if any
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: SetLog = lastSet
          ? { reps: lastSet.reps, weight: lastSet.weight, completed: false }
          : { reps: 10, weight: ex.category === 'Peso corporal' ? 0 : 12, completed: false };

        return { ...ex, sets: [...ex.sets, newSet] };
      });

      const updatedSession = {
        ...state.activeWorkoutSession,
        exercises: updatedExercises,
      };

      saveToStorage(state.currentUserEmail, 'active_session', updatedSession);

      return {
        activeWorkoutSession: updatedSession,
      };
    });
  },

  removeSetFromExercise: (exerciseId, setIndex) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};

      const updatedExercises = state.activeWorkoutSession.exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        const updatedSets = ex.sets.filter((_, idx) => idx !== setIndex);
        return { ...ex, sets: updatedSets };
      });

      const updatedSession = {
        ...state.activeWorkoutSession,
        exercises: updatedExercises,
      };

      saveToStorage(state.currentUserEmail, 'active_session', updatedSession);

      return {
        activeWorkoutSession: updatedSession,
      };
    });
  },

  removeExerciseFromSession: (exerciseId) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};
      const updatedExercises = state.activeWorkoutSession.exercises.filter(
        (ex) => ex.exerciseId !== exerciseId
      );
      const updatedSession = {
        ...state.activeWorkoutSession,
        exercises: updatedExercises,
      };

      saveToStorage(state.currentUserEmail, 'active_session', updatedSession);

      return {
        activeWorkoutSession: updatedSession,
      };
    });
  },

  replaceExerciseInSession: (exerciseId, newExercise) => {
    set((state) => {
      if (!state.activeWorkoutSession) return {};
      const updatedExercises = state.activeWorkoutSession.exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        // Keep same number of sets but reset values
        const newSets = ex.sets.map(() => ({
          reps: 10,
          weight: newExercise.category === 'Peso corporal' ? 0 : 12,
          completed: false,
        }));
        return {
          exerciseId: newExercise.id,
          name: newExercise.name,
          bodyPart: newExercise.bodyPart,
          category: newExercise.category,
          gifUrl: newExercise.gifUrl,
          sets: newSets,
        };
      });

      const updatedSession = {
        ...state.activeWorkoutSession,
        exercises: updatedExercises,
      };

      saveToStorage(state.currentUserEmail, 'active_session', updatedSession);

      return {
        activeWorkoutSession: updatedSession,
      };
    });
  },

  finishWorkoutSession: () => {
    const session = get().activeWorkoutSession;
    if (!session) return false;

    // Filter exercises that have at least one completed set
    const completedExercises = session.exercises
      .map((ex) => ({
        ...ex,
        sets: ex.sets.filter((s) => s.completed),
      }))
      .filter((ex) => ex.sets.length > 0);

    // CRITICAL REQUIREMENT: Show routine only if they did at least one exercise
    if (completedExercises.length === 0) {
      set({ activeWorkoutSession: null });
      removeFromStorage(get().currentUserEmail, 'active_session');
      return false; // Not saved
    }

    const duration = Math.max(1, Math.round((Date.now() - session.startTime) / 60000));
    // Estimate calories: ~7 kcal per minute + a bit for weight moved
    const totalReps = completedExercises.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + s.reps, 0), 0);
    const calories = duration * 6 + Math.round(totalReps * 0.5);

    const historyItem: WorkoutHistoryItem = {
      id: `history-${Date.now()}`,
      name: session.name,
      date: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration,
      calories,
      exercises: completedExercises,
    };

    set((state) => {
      const updatedHistory = [historyItem, ...state.workoutHistory];
      const updatedMetrics = {
        ...state.metrics,
        caloriesBurned: state.metrics.caloriesBurned + calories,
        activeTime: state.metrics.activeTime + duration,
        strainScore: Math.min(21, Number((state.metrics.strainScore + (duration * 0.15)).toFixed(1))),
      };
      
      saveToStorage(state.currentUserEmail, 'history', updatedHistory);
      saveToStorage(state.currentUserEmail, 'metrics', updatedMetrics);
      removeFromStorage(state.currentUserEmail, 'active_session');

      return {
        workoutHistory: updatedHistory,
        activeWorkoutSession: null,
        metrics: updatedMetrics,
      };
    });

    return true; // Successfully saved
  },

  cancelWorkoutSession: () => {
    set({ activeWorkoutSession: null });
    removeFromStorage(get().currentUserEmail, 'active_session');
  },

  refreshMetrics: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ isLoading: false });
  },
}));
