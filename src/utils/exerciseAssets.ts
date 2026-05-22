// ─────────────────────────────────────────────────────────────────────────────
// ANATOMICAL ASSET REGISTRY
// All require() calls must be static so Metro Bundler can resolve them at build time.
// ─────────────────────────────────────────────────────────────────────────────

// ── Muscle-group base images ──────────────────────────────────────────────────
export const ANATOMICAL_IMAGES: { [key: string]: any } = {
  // Base group images
  biceps:     require('../../assets/biceps_anatomical.png'),
  triceps:    require('../../assets/triceps_anatomical.png'),
  pecho:      require('../../assets/pecho_anatomical.png'),
  espalda:    require('../../assets/espalda_anatomical.png'),
  hombros:    require('../../assets/hombros_anatomical.png'),
  quads:      require('../../assets/quads_anatomical.png'),
  hamstrings: require('../../assets/hamstrings_anatomical.png'),
  glutes:     require('../../assets/glutes_anatomical.png'),
  calves:     require('../../assets/calves_anatomical.png'),
  core:       require('../../assets/core_anatomical.png'),

  // ── Pecho (Chest) — exercise-specific ──────────────────────────────────────
  'pecho_press_banca':   require('../../assets/pecho_press_banca.png'),
  'pecho_aperturas':     require('../../assets/pecho_aperturas.png'),
  'pecho_flexiones':     require('../../assets/pecho_flexiones.png'),
  'pecho_cruces_polea':  require('../../assets/pecho_cruces_polea.png'),

  // ── Espalda (Back) — exercise-specific ─────────────────────────────────────
  'espalda_dominadas':      require('../../assets/espalda_dominadas.png'),
  'espalda_remo_barra':     require('../../assets/espalda_remo_barra.png'),
  'espalda_remo_mancuerna': require('../../assets/espalda_remo_mancuerna.png'),
};

// ─────────────────────────────────────────────────────────────────────────────
// PER-EXERCISE ID → ASSET KEY MAP
// Maps each exercise ID from the store to the best anatomical illustration.
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISE_ID_MAP: Record<string, string> = {
  // ── Bíceps ─────────────────────────────────────────────────────────────────
  'biceps-dumbbell-alternate-biceps-curl':  'biceps',
  'biceps-dumbbell-hammer-curl':            'biceps',
  'biceps-dumbbell-concentration-curl':     'biceps',
  'biceps-cable-curl':                      'biceps',

  // ── Tríceps ────────────────────────────────────────────────────────────────
  'triceps-cable-alternate-triceps-extension':         'triceps',
  'triceps-three-bench-dip':                           'triceps',
  'triceps-barbell-lying-triceps-extension':           'triceps',
  'triceps-barbell-seated-overhead-triceps-extension': 'triceps',

  // ── Hombros ────────────────────────────────────────────────────────────────
  'delts-dumbbell-seated-shoulder-press': 'hombros',
  'delts-dumbbell-lateral-raise':         'hombros',
  'delts-dumbbell-front-raise':           'hombros',
  'delts-smith-rear-delt-row':            'hombros',

  // ── Pecho — exercise-specific ──────────────────────────────────────────────
  'pectorals-barbell-bench-press':       'pecho_press_banca',
  'pectorals-dumbbell-bench-press':      'pecho_press_banca',  // same movement pattern
  'pectorals-dumbbell-fly':              'pecho_aperturas',
  'pectorals-push-up':                   'pecho_flexiones',
  'pectorals-cable-upper-chest-crossovers': 'pecho_cruces_polea',

  // ── Espalda — exercise-specific ────────────────────────────────────────────
  'lats-pull-up':                          'espalda_dominadas',
  'upper-back-lever-bent-over-row':        'espalda_remo_barra',
  'upper-back-smith-one-arm-row':          'espalda_remo_mancuerna',
  'lats-reverse-grip-machine-lat-pulldown':'espalda_dominadas',   // lat pull = similar to pull-up
  'lats-cable-seated-high-row-v-bar':      'espalda_remo_mancuerna', // seated row

  // ── Piernas ────────────────────────────────────────────────────────────────
  'glutes-band-squat':                   'quads',
  'glutes-smith-leg-press':              'quads',
  'glutes-barbell-lunge':                'glutes',
  'quads-split-squats':                  'quads',
  'glutes-barbell-romanian-deadlift':    'hamstrings',
  'calves-hack-calf-raise':              'calves',

  // ── Core ───────────────────────────────────────────────────────────────────
  'abs-weighted-front-plank':  'core',
  'abs-cable-kneeling-crunch': 'core',
  'abs-hanging-leg-raise':     'core',
  'abs-wheel-rollerout':       'core',
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the asset key for a given exercise.
 * Checks the exact-ID map first, then falls back to bodyPart logic.
 */
export const getAnatomicalAssetKey = (
  exercise: { id?: string; name: string; bodyPart: string }
): string => {
  // 1. Try exact exercise ID match
  if (exercise.id && EXERCISE_ID_MAP[exercise.id]) {
    return EXERCISE_ID_MAP[exercise.id];
  }

  // 2. Fallback: match by exercise ID from the name (exerciseId in WorkoutExerciseLog)
  const nameLower = exercise.name.toLowerCase();

  if (exercise.bodyPart === 'Piernas') {
    if (nameLower.includes('rumano') || nameLower.includes('femoral') || nameLower.includes('curl de piernas')) return 'hamstrings';
    if (nameLower.includes('glúteo') || nameLower.includes('lunge') || nameLower.includes('zancada') || nameLower.includes('hip thrust')) return 'glutes';
    if (nameLower.includes('talón') || nameLower.includes('gemelo') || nameLower.includes('pantorrilla') || nameLower.includes('calf')) return 'calves';
    return 'quads';
  }

  if (exercise.bodyPart === 'Espalda') {
    if (nameLower.includes('dominada') || nameLower.includes('pull-up') || nameLower.includes('jalón')) return 'espalda_dominadas';
    if (nameLower.includes('remo') && (nameLower.includes('barra') || nameLower.includes('pendlay'))) return 'espalda_remo_barra';
    if (nameLower.includes('remo') && nameLower.includes('mancuerna')) return 'espalda_remo_mancuerna';
    return 'espalda';
  }

  if (exercise.bodyPart === 'Pecho') {
    if (nameLower.includes('apertura') || nameLower.includes('fly')) return 'pecho_aperturas';
    if (nameLower.includes('flexión') || nameLower.includes('push')) return 'pecho_flexiones';
    if (nameLower.includes('cruce') || nameLower.includes('polea') || nameLower.includes('crossover')) return 'pecho_cruces_polea';
    return 'pecho_press_banca';
  }

  if (exercise.bodyPart === 'Tríceps') return 'triceps';
  if (exercise.bodyPart === 'Bíceps')  return 'biceps';
  if (exercise.bodyPart === 'Hombros') return 'hombros';
  if (exercise.bodyPart === 'Core')    return 'core';

  return 'quads'; // ultimate fallback
};

/**
 * Returns the require()'d image source for the given exercise.
 * Works with both Exercise (has id) and WorkoutExerciseLog (has exerciseId).
 */
export const getExerciseAnatomicalAsset = (
  exercise: { id?: string; exerciseId?: string; name: string; bodyPart: string }
) => {
  // WorkoutExerciseLog uses exerciseId, Exercise uses id
  const resolvedId = exercise.id ?? exercise.exerciseId;
  const key = getAnatomicalAssetKey({ ...exercise, id: resolvedId });
  return ANATOMICAL_IMAGES[key] ?? ANATOMICAL_IMAGES.quads;
};
