import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  SafeAreaView, Modal, TouchableOpacity, Vibration, Platform, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { useNavigation } from '@react-navigation/native';
import {
  Check, X, RefreshCw, Trash2, Timer,
  Minus, Dumbbell, Eye, Scan, Plus, ChevronRight, Play,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import Body from 'react-native-body-highlighter';
import { getExerciseAnatomicalAsset } from '../../../../src/utils/exerciseAssets';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const getAnatomyConfig = (ex: { name: string; bodyPart: string }) => {
  const n = ex.name.toLowerCase();
  if (ex.bodyPart === 'Piernas') {
    if (n.includes('rumano') || n.includes('femoral') || n.includes('curl de piernas'))
      return { side: 'back' as const, slugs: ['hamstring'] };
    if (n.includes('zancada') || n.includes('lunge') || n.includes('hip thrust') || n.includes('glúteo'))
      return { side: 'back' as const, slugs: ['gluteal'] };
    if (n.includes('talón') || n.includes('gemelo') || n.includes('pantorrilla'))
      return { side: 'back' as const, slugs: ['calves'] };
    return { side: 'front' as const, slugs: ['quadriceps'] };
  }
  if (ex.bodyPart === 'Espalda') return { side: 'back' as const, slugs: ['upper-back', 'lower-back', 'trapezius'] };
  if (ex.bodyPart === 'Tríceps') return { side: 'back' as const, slugs: ['triceps'] };
  if (ex.bodyPart === 'Bíceps')  return { side: 'front' as const, slugs: ['biceps'] };
  if (ex.bodyPart === 'Pecho')   return { side: 'front' as const, slugs: ['chest'] };
  if (ex.bodyPart === 'Hombros') return { side: 'front' as const, slugs: ['front-deltoids'] };
  if (ex.bodyPart === 'Core')    return { side: 'front' as const, slugs: ['abs', 'obliques'] };
  return { side: 'front' as const, slugs: [] };
};

// Cross-platform confirm (Alert on native, window.confirm on web)
const confirmAction = (title: string, msg: string, onConfirm: () => void) => {
  if (IS_WEB) {
    if (window.confirm(`${title}\n${msg}`)) onConfirm();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, msg, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: 'destructive', onPress: onConfirm },
    ]);
  }
};

// ─────────────────────────────────────────────────────────────────
// REST TIMER — floating bottom panel
// ─────────────────────────────────────────────────────────────────
interface RestPanelProps {
  remaining: number;
  total: number;
  target: number;
  onAdd30: () => void;
  onSkip: () => void;
  onEditTarget: () => void;
}
const RestPanel: React.FC<RestPanelProps> = ({
  remaining, total, target, onAdd30, onSkip, onEditTarget,
}) => {
  const pct = total > 0 ? remaining / total : 0;
  const circumference = 2 * Math.PI * 38;
  const strokeDash = circumference * pct;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 120 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 18, stiffness: 200 }}
      style={styles.restPanel}
    >
      {/* Left: circular timer */}
      <View style={styles.restCircleWrap}>
        {/* SVG-like circle using border trick */}
        <View style={styles.restCircleBg}>
          <View style={[
            styles.restCircleFill,
            {
              borderColor: '#FFF',
              // Simulate arc progress with border width trick
              opacity: pct,
            }
          ]} />
          <View style={styles.restCircleCenter}>
            <Text style={styles.restTime}>{fmt(remaining)}</Text>
            <Text style={styles.restTimeSub}>DESCANSO</Text>
          </View>
        </View>
      </View>

      {/* Center: progress bar + set rest */}
      <View style={{ flex: 1 }}>
        {/* segmented progress */}
        <View style={styles.restBarRow}>
          {Array.from({ length: 16 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.restSeg,
                { backgroundColor: i < Math.round(pct * 16) ? '#FFF' : '#252530' },
              ]}
            />
          ))}
        </View>

        {/* Rest target edit */}
        <View style={styles.restTargetRow}>
          <Timer size={11} color="#555" />
          <Pressable onPress={onEditTarget} style={styles.restTargetTap}>
            <Text style={styles.restTargetTxt}>{fmt(target)}</Text>
            <Text style={styles.restTargetLabel}>descanso pref.</Text>
          </Pressable>
        </View>

        {/* Buttons */}
        <View style={styles.restBtns}>
          <Pressable onPress={onAdd30} style={styles.restBtnSecondary}>
            <Plus size={12} color="#AAA" />
            <Text style={styles.restBtnSecTxt}>+30s</Text>
          </Pressable>
          <Pressable onPress={onSkip} style={styles.restBtnPrimary}>
            <Text style={styles.restBtnPriTxt}>Saltar descanso</Text>
          </Pressable>
        </View>
      </View>
    </MotiView>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
export const ActiveWorkoutPage: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    activeWorkoutSession,
    updateWorkoutSet,
    addSetToExercise,
    removeSetFromExercise,
    finishWorkoutSession,
    cancelWorkoutSession,
    removeExerciseFromSession,
    replaceExerciseInSession,
    exercises: allExercises,
    setShowWorkoutCompletedToast,
  } = useActivityStore();

  const [activeIdx, setActiveIdx] = useState(0);

  // Modals
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialTab, setTutorialTab] = useState<'anatomy' | 'gif'>('anatomy');
  const [showReplace, setShowReplace] = useState(false);
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [tempRestSeconds, setTempRestSeconds] = useState(90);

  // Per-exercise rest targets map
  const [exerciseRestTargets, setExerciseRestTargets] = useState<Record<string, number>>({});

  // Rest timer
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRest = useCallback((secs: number) => {
    if (restRef.current) clearInterval(restRef.current);
    setRestRemaining(secs);
    restRef.current = setInterval(() => {
      setRestRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(restRef.current!);
          if (!IS_WEB) Vibration.vibrate([0, 400, 150, 400]);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const skipRest = useCallback(() => {
    if (restRef.current) clearInterval(restRef.current);
    setRestRemaining(null);
  }, []);

  const add30 = useCallback(() => {
    setRestRemaining(p => (p !== null ? p + 30 : 30));
  }, []);

  useEffect(() => () => { if (restRef.current) clearInterval(restRef.current); }, []);

  // ── Guards ────────────────────────────────────────────────────
  if (!activeWorkoutSession) {
    return (
      <View style={styles.emptyState}>
        <Dumbbell size={40} color="#333" />
        <Text style={styles.emptyTxt}>No hay sesión activa</Text>
        <Pressable onPress={() => navigation.navigate('Tabs')} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnTxt}>Volver al inicio</Text>
        </Pressable>
      </View>
    );
  }

  const exList = activeWorkoutSession.exercises;
  const safeIdx = Math.min(activeIdx, Math.max(0, exList.length - 1));
  const ex = exList[safeIdx];
  const baseEx = allExercises.find(e => e.id === ex?.exerciseId);

  // Stats for the Finish Modal
  const totalSets = exList.reduce((acc, curr) => acc + curr.sets.length, 0);
  const completedSets = exList.reduce((acc, curr) => acc + curr.sets.filter(s => s.completed).length, 0);
  const pendingSets = totalSets - completedSets;
  const progressPct = totalSets > 0 ? completedSets / totalSets : 0;
  const elapsedMinutes = Math.max(1, Math.floor((Date.now() - activeWorkoutSession.startTime) / 1000 / 60));

  const currentRestTarget = exerciseRestTargets[ex.exerciseId] || 90;

  const handleOpenRestModal = () => {
    setTempRestSeconds(currentRestTarget);
    setShowRestModal(true);
  };

  if (!ex) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTxt}>Sin ejercicios</Text>
        <Pressable onPress={() => { finishWorkoutSession(); navigation.navigate('Tabs'); }} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnTxt}>Finalizar</Text>
        </Pressable>
      </View>
    );
  }

  const anatomyConfig = getAnatomyConfig(ex);
  const highlightData = anatomyConfig.slugs.map(slug => ({
    slug, styles: { fill: '#FFF', stroke: '#FFF', strokeWidth: 2 },
  }));

  const replaceList = allExercises.filter(e =>
    e.id !== ex.exerciseId &&
    (e.name.toLowerCase().includes(replaceQuery.toLowerCase()) ||
     e.bodyPart.toLowerCase().includes(replaceQuery.toLowerCase()))
  );

  // ── Handlers ──────────────────────────────────────────────────
  const handleFinish = () => {
    setShowFinishModal(true);
  };

  const handleCancel = () => {
    confirmAction(
      'Descartar entrenamiento',
      '¿Descartar este entrenamiento? Se perderá todo tu progreso de hoy.',
      () => {
        cancelWorkoutSession();
        navigation.navigate('Tabs');
      }
    );
  };

  const handleToggleSet = (setIdx: number, wasDone: boolean) => {
    const isCompleting = !wasDone;
    updateWorkoutSet(ex.exerciseId, setIdx, 'completed', isCompleting);
    
    if (isCompleting) {
      // Check if all sets for this exercise are now completed
      const allSetsCompleted = ex.sets.every((s, idx) => idx === setIdx ? true : s.completed);
      if (allSetsCompleted) {
        if (safeIdx < exList.length - 1) {
          // Go to the next exercise after a short delay
          setTimeout(() => {
            setActiveIdx(safeIdx + 1);
          }, 800);
        } else {
          // If it was the last set of the last exercise, check if all exercises are fully complete
          const allSessionCompleted = exList.every((e, eIdx) => {
            if (eIdx === safeIdx) return true;
            return e.sets.every(s => s.completed);
          });
          if (allSessionCompleted) {
            setTimeout(() => {
              setShowFinishModal(true);
            }, 800);
          }
        }
      }
      startRest(currentRestTarget);
    }
  };

  const handleDelete = () => {
    if (IS_WEB) {
      setShowDeleteConfirm(true);
    } else {
      confirmAction(
        'Eliminar ejercicio',
        `¿Quitar "${ex.name}" del entrenamiento?`,
        () => {
          removeExerciseFromSession(ex.exerciseId);
          setActiveIdx(Math.max(0, safeIdx - 1));
        },
      );
    }
  };

  const confirmDelete = () => {
    removeExerciseFromSession(ex.exerciseId);
    setActiveIdx(Math.max(0, safeIdx - 1));
    setShowDeleteConfirm(false);
  };

  const handleReplace = (newEx: typeof allExercises[0]) => {
    replaceExerciseInSession(ex.exerciseId, newEx);
    setShowReplace(false);
    setReplaceQuery('');
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} hitSlop={12} style={styles.hBtn}>
          <X size={20} color="#555" />
        </Pressable>
        <View style={styles.hCenter}>
          <Text style={styles.hTitle} numberOfLines={1}>{activeWorkoutSession.name || 'Entrenamiento'}</Text>
          <Text style={styles.hSub}>{safeIdx + 1} / {exList.length}</Text>
        </View>
        <Pressable onPress={handleFinish} style={styles.finishBtn}>
          <Text style={styles.finishTxt}>Finalizar</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, restRemaining !== null && { paddingBottom: 200 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── EXERCISE BUBBLES ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bubbleRow}>
          {exList.map((e, i) => {
            const active = i === safeIdx;
            return (
              <Pressable key={e.exerciseId + i} onPress={() => setActiveIdx(i)} style={styles.bubbleWrap}>
                <View style={[styles.bubble, active && styles.bubbleOn]}>
                  <Image source={{ uri: e.gifUrl }} style={styles.bubbleImg} contentFit="cover" />
                </View>
                <Text style={[styles.bubbleLbl, active && { color: '#CCC' }]} numberOfLines={2}>
                  {e.name.split(' ').slice(0, 2).join(' ')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── DASHBOARD (anatomy + illustration) ── */}
        <MotiView
          key={ex.exerciseId}
          from={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 260 }}
          style={styles.dashboard}
        >
          {/* Scanner */}
          <View style={styles.scanPanel}>
            <View style={styles.panelHead}>
              <View style={styles.scanDot} />
              <Text style={styles.panelLbl}>ESCÁNER</Text>
            </View>
            <View style={styles.scanBody}>
              <View style={{ width: 80, height: 160 }} pointerEvents="none">
                <Body
                  data={highlightData as any}
                  gender="male"
                  side={anatomyConfig.side}
                  scale={0.45}
                  border="#2C2C35"
                  defaultFill="#111118"
                />
              </View>
            </View>
          </View>

          {/* Anatomical illustration */}
          <View style={styles.demoPanel}>
            <View style={styles.panelHead}>
              <Text style={styles.panelLbl}>GUÍA ANATÓMICA</Text>
            </View>
            <View style={styles.demoBox}>
              <Image
                source={getExerciseAnatomicalAsset(ex)}
                style={styles.demoImageContain}
                contentFit="contain"
              />
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeTxt}>{ex.bodyPart.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* ── ACTION CHIPS ── */}
        <View style={styles.chips}>
          <Pressable style={styles.chip} onPress={() => { setTutorialTab('anatomy'); setShowTutorial(true); }}>
            <Play size={13} color="#FFF" fill="#FFF" />
            <Text style={styles.chipTxt}>Tutorial</Text>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => { setReplaceQuery(''); setShowReplace(true); }}>
            <RefreshCw size={13} color="#FFF" />
            <Text style={styles.chipTxt}>Reemplazar</Text>
          </Pressable>
          <Pressable style={styles.chip} onPress={handleDelete}>
            <Trash2 size={13} color="#AAA" />
            <Text style={styles.chipTxt}>Borrar</Text>
          </Pressable>
        </View>

        {/* ── TITLE + REST CONFIG ── */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.exTitle}>{ex.name}</Text>
            <Text style={styles.exSub}>{ex.bodyPart} · {ex.category}</Text>
          </View>
          <Pressable
            onPress={handleOpenRestModal}
            style={styles.restConfigChip}
          >
            <Timer size={12} color="#666" />
            <Text style={styles.restConfigTime}>{fmt(currentRestTarget)}</Text>
            <Text style={styles.restConfigLbl}>descanso</Text>
          </Pressable>
        </View>

        {/* ── SETS TABLE ── */}
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 0.6 }]}>#</Text>
            <Text style={[styles.th, { flex: 1.3 }]}>ANTERIOR</Text>
            <Text style={[styles.th, { flex: 1.3, textAlign: 'center' }]}>KG</Text>
            <Text style={[styles.th, { flex: 1.3, textAlign: 'center' }]}>REPS</Text>
            <View style={{ width: 66 }} />
          </View>

          {ex.sets.map((set, idx) => {
            const done = set.completed;
            return (
              <MotiView
                key={`${ex.exerciseId}-set-${idx}`}
                from={{ opacity: 0, translateX: -6 }}
                animate={{ opacity: done ? 0.65 : 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 180, delay: idx * 35 }}
              >
                <View style={styles.setRow}>
                  <Text style={[styles.setNum, { flex: 0.6 }]}>{idx + 1}</Text>
                  <Text style={[styles.setPrev, { flex: 1.3 }]}>—</Text>

                  <View style={{ flex: 1.3, paddingHorizontal: 3 }}>
                    <TextInput
                      style={[styles.setInput, done && styles.setInputDone]}
                      keyboardType="decimal-pad"
                      value={set.weight ? String(set.weight) : ''}
                      placeholder="0"
                      placeholderTextColor="#555"
                      editable={!done}
                      onChangeText={v => updateWorkoutSet(ex.exerciseId, idx, 'weight', parseFloat(v) || 0)}
                    />
                  </View>

                  <View style={{ flex: 1.3, paddingHorizontal: 3 }}>
                    <TextInput
                      style={[styles.setInput, done && styles.setInputDone]}
                      keyboardType="number-pad"
                      value={set.reps ? String(set.reps) : ''}
                      placeholder="0"
                      placeholderTextColor="#555"
                      editable={!done}
                      onChangeText={v => updateWorkoutSet(ex.exerciseId, idx, 'reps', parseInt(v) || 0)}
                    />
                  </View>

                  <View style={styles.setActions}>
                    {/* Remove set button */}
                    {!done && ex.sets.length > 1 && (
                      <Pressable
                        onPress={() => removeSetFromExercise(ex.exerciseId, idx)}
                        hitSlop={8}
                        style={styles.removeBtn}
                      >
                        <X size={11} color="#FFF" />
                      </Pressable>
                    )}
                    {/* Complete toggle */}
                    <Pressable
                      onPress={() => handleToggleSet(idx, done)}
                      style={[styles.checkBtn, done && styles.checkBtnOn]}
                    >
                      {done
                        ? <Check size={15} color="#000" strokeWidth={3} />
                        : <Minus size={15} color="#555" />
                      }
                    </Pressable>
                  </View>
                </View>
              </MotiView>
            );
          })}
        </View>

        {/* ── ADD SET ── */}
        <Pressable onPress={() => addSetToExercise(ex.exerciseId)} style={styles.addSetBtn}>
          <Plus size={14} color="#FFF" />
          <Text style={styles.addSetTxt}>Añadir serie</Text>
        </Pressable>

      </ScrollView>

      {/* ── REST TIMER (floating bottom) ── */}
      {restRemaining !== null && (
        <RestPanel
          remaining={restRemaining}
          total={currentRestTarget}
          target={currentRestTarget}
          onAdd30={add30}
          onSkip={skipRest}
          onEditTarget={handleOpenRestModal}
        />
      )}

      {/* ════════════════════════════════════════════════════════
          TUTORIAL MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showTutorial}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTutorial(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={() => setShowTutorial(false)} />
          <View style={[styles.sheet, IS_WEB && styles.sheetWeb]}>

            {/* Hero image */}
            <View style={styles.tutHero}>
              {tutorialTab === 'anatomy'
                ? <Image source={getExerciseAnatomicalAsset(ex)} style={styles.tutImageContain} contentFit="contain" />
                : ex.gifUrl
                  ? <Image source={{ uri: ex.gifUrl }} style={StyleSheet.absoluteFill} contentFit="contain" />
                  : (
                    <View style={[StyleSheet.absoluteFill, styles.noGifBox]}>
                      <Dumbbell size={40} color="#2C2C35" />
                      <Text style={styles.noGifTxt}>Sin GIF disponible</Text>
                    </View>
                  )
              }

              {/* Scan badge */}
              {tutorialTab === 'anatomy' && (
                <View style={styles.scanBadge}>
                  <View style={styles.scanBadgeDot} />
                  <Text style={styles.scanBadgeTxt}>ESCANEANDO MÚSCULOS</Text>
                </View>
              )}

              {/* Tab toggle */}
              <View style={styles.tabPill}>
                <TouchableOpacity
                  onPress={() => setTutorialTab('anatomy')}
                  style={[styles.tabBtn, tutorialTab === 'anatomy' && styles.tabBtnOn]}
                  activeOpacity={0.8}
                >
                  <Scan size={11} color={tutorialTab === 'anatomy' ? '#000' : '#666'} />
                  <Text style={[styles.tabTxt, tutorialTab === 'anatomy' && styles.tabTxtOn]}>ANATOMÍA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTutorialTab('gif')}
                  style={[styles.tabBtn, tutorialTab === 'gif' && styles.tabBtnOn]}
                  activeOpacity={0.8}
                >
                  <Eye size={11} color={tutorialTab === 'gif' ? '#000' : '#666'} />
                  <Text style={[styles.tabTxt, tutorialTab === 'gif' && styles.tabTxtOn]}>TÉCNICA</Text>
                </TouchableOpacity>
              </View>

              {/* Close */}
              <Pressable onPress={() => setShowTutorial(false)} style={styles.sheetClose}>
                <X size={16} color="#FFF" />
              </Pressable>
            </View>

            {/* Info */}
            <ScrollView style={styles.tutBody} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.tutName}>{ex.name}</Text>
              <View style={styles.tutBadges}>
                <View style={styles.tutBadge}><Text style={styles.tutBadgeTxt}>🎯 {ex.bodyPart.toUpperCase()}</Text></View>
                <View style={styles.tutBadge}><Text style={styles.tutBadgeTxt}>⚙️ {ex.category.toUpperCase()}</Text></View>
              </View>
              <Text style={styles.tutSectionLbl}>INSTRUCCIONES DE EJECUCIÓN</Text>
              <Text style={styles.tutDesc}>
                {baseEx?.description || 'Mantén la técnica correcta en todo momento. Controla el peso en la fase excéntrica y concéntrica. Exhala al hacer el esfuerzo, inhala al volver.'}
              </Text>
              <Pressable onPress={() => setShowTutorial(false)} style={styles.tutCloseBtn}>
                <Text style={styles.tutCloseTxt}>Cerrar</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          REPLACE MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showReplace}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReplace(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={() => setShowReplace(false)} />
          <View style={[styles.sheet, styles.sheetTall, IS_WEB && styles.sheetWeb]}>
            <View style={styles.replaceTop}>
              <View>
                <Text style={styles.replaceTitle}>Reemplazar ejercicio</Text>
                <Text style={styles.replaceSub} numberOfLines={1}>
                  Actual: <Text style={{ color: '#AAA' }}>{ex.name}</Text>
                </Text>
              </View>
              <Pressable onPress={() => setShowReplace(false)} style={styles.sheetClose}>
                <X size={16} color="#FFF" />
              </Pressable>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o músculo..."
                placeholderTextColor="#444"
                value={replaceQuery}
                onChangeText={setReplaceQuery}
                autoCorrect={false}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {replaceList.length === 0 ? (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptySearchTxt}>Sin resultados para "{replaceQuery}"</Text>
                </View>
              ) : (
                replaceList.map(e => (
                  <Pressable key={e.id} onPress={() => handleReplace(e)} style={styles.replaceRow}>
                    <View style={styles.replaceThumb}>
                      <Image source={{ uri: e.gifUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.replaceRowName}>{e.name}</Text>
                      <Text style={styles.replaceRowSub}>{e.bodyPart} · {e.category}</Text>
                    </View>
                    <ChevronRight size={16} color="#333" />
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL (web fallback since Alert doesn't exist on web)
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={[styles.overlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIcon}>
              <Trash2 size={24} color="#FFF" />
            </View>
            <Text style={styles.confirmTitle}>Eliminar ejercicio</Text>
            <Text style={styles.confirmMsg}>
              ¿Quitar <Text style={{ color: '#FFF' }}>{ex.name}</Text> del entrenamiento? El progreso de este ejercicio se perderá.
            </Text>
            <View style={styles.confirmBtns}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={styles.confirmCancelBtn}>
                <Text style={styles.confirmCancelTxt}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={confirmDelete} style={styles.confirmDeleteBtn}>
                <Text style={styles.confirmDeleteTxt}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          FINISH WORKOUT MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showFinishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <View style={[styles.overlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowFinishModal(false)} />
          
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={[styles.finishModalBox, IS_WEB && { maxWidth: 400 }]}
          >
            {/* Header Icon */}
            <View style={[
              styles.finishModalIconBg,
              pendingSets > 0 ? styles.finishIconPending : styles.finishIconSuccess
            ]}>
              {pendingSets > 0 ? (
                <Timer size={22} color="#FFF" />
              ) : (
                <Check size={22} color="#FFF" strokeWidth={3} />
              )}
            </View>

            <Text style={styles.finishModalTitle}>
              {pendingSets > 0 ? 'Entrenamiento Incompleto' : '¡Rutina Completada!'}
            </Text>
            
            <Text style={styles.finishModalMsg}>
              {pendingSets > 0 
                ? `Te quedan ${pendingSets} series por completar en esta sesión. ¿Qué deseas hacer con tu progreso?`
                : '¡Excelente trabajo! Has completado todas las series de tu entrenamiento de hoy.'}
            </Text>

            {/* Progress Bar & Stats */}
            <View style={styles.finishStatsContainer}>
              <View style={styles.finishStatsGrid}>
                <View style={styles.finishStatItem}>
                  <Text style={styles.finishStatVal}>{elapsedMinutes}m</Text>
                  <Text style={styles.finishStatLbl}>Duración</Text>
                </View>
                <View style={styles.finishStatDivider} />
                <View style={styles.finishStatItem}>
                  <Text style={styles.finishStatVal}>{exList.length}</Text>
                  <Text style={styles.finishStatLbl}>Ejercicios</Text>
                </View>
                <View style={styles.finishStatDivider} />
                <View style={styles.finishStatItem}>
                  <Text style={styles.finishStatVal}>{completedSets}/{totalSets}</Text>
                  <Text style={styles.finishStatLbl}>Series</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.finishProgressBg}>
                <View style={[styles.finishProgressFill, { width: `${progressPct * 100}%` }]} />
              </View>
              <Text style={styles.finishProgressText}>
                {Math.round(progressPct * 100)}% del entrenamiento completado
              </Text>
            </View>

            {/* Buttons Stack */}
            <View style={styles.finishModalBtns}>
              {/* Primary action: Guardar */}
              <Pressable 
                onPress={() => {
                  const success = finishWorkoutSession();
                  setShowFinishModal(false);
                  if (success) {
                    setShowWorkoutCompletedToast(true);
                  }
                  navigation.navigate('Tabs');
                }} 
                style={styles.finishModalSaveBtn}
              >
                <Text style={styles.finishModalSaveTxt}>Finalizar y Guardar</Text>
              </Pressable>

              {/* Secondary action: Seguir entrenando */}
              <Pressable 
                onPress={() => setShowFinishModal(false)} 
                style={styles.finishModalResumeBtn}
              >
                <Text style={styles.finishModalResumeTxt}>Seguir Entrenando</Text>
              </Pressable>

              {/* Destructive action: Descartar */}
              <Pressable 
                onPress={() => {
                  confirmAction(
                    'Descartar entrenamiento', 
                    '¿Estás seguro de que deseas cancelar y borrar todo el progreso de esta sesión?', 
                    () => {
                      cancelWorkoutSession();
                      setShowFinishModal(false);
                      navigation.navigate('Tabs');
                    }
                  );
                }} 
                style={styles.finishModalDiscardBtn}
              >
                <Text style={styles.finishModalDiscardTxt}>Descartar Cambios</Text>
              </Pressable>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          REST ADJUST MODAL (POPUP)
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showRestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRestModal(false)}
      >
        <View style={[styles.overlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowRestModal(false)} />
          
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={[styles.restModalBox, IS_WEB && { maxWidth: 360 }]}
          >
            <View style={styles.restModalHeader}>
              <Timer size={20} color="#FFF" />
              <Text style={styles.restModalTitle}>Ajustar Descanso</Text>
            </View>
            <Text style={styles.restModalSub} numberOfLines={1}>{ex.name}</Text>

            {/* Time Adjuster */}
            <View style={styles.adjusterRow}>
              <Pressable 
                onPress={() => setTempRestSeconds(prev => Math.max(15, prev - 15))}
                style={styles.adjustBtn}
              >
                <Minus size={20} color="#FFF" />
              </Pressable>
              
              <View style={styles.adjustValBox}>
                <Text style={styles.adjustValText}>{fmt(tempRestSeconds)}</Text>
                <Text style={styles.adjustValLbl}>minutos</Text>
              </View>

              <Pressable 
                onPress={() => setTempRestSeconds(prev => Math.min(600, prev + 15))}
                style={styles.adjustBtn}
              >
                <Plus size={20} color="#FFF" />
              </Pressable>
            </View>

            {/* Presets Grid */}
            <View style={styles.presetsRow}>
              {[30, 60, 90, 120, 180].map(secs => (
                <Pressable
                  key={secs}
                  onPress={() => setTempRestSeconds(secs)}
                  style={[
                    styles.presetPill,
                    tempRestSeconds === secs && styles.presetPillActive
                  ]}
                >
                  <Text style={[
                    styles.presetPillTxt,
                    tempRestSeconds === secs && styles.presetPillTxtActive
                  ]}>
                    {secs < 60 ? `${secs}s` : `${secs / 60}m`}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.restModalBtns}>
              <Pressable 
                onPress={() => {
                  setExerciseRestTargets(prev => ({
                    ...prev,
                    [ex.exerciseId]: tempRestSeconds
                  }));
                  setShowRestModal(false);
                }}
                style={styles.restModalConfirmBtn}
              >
                <Text style={styles.restModalConfirmTxt}>Aplicar a este Ejercicio</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setShowRestModal(false)}
                style={styles.restModalCancelBtn}
              >
                <Text style={styles.restModalCancelTxt}>Cancelar</Text>
              </Pressable>
            </View>
          </MotiView>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  emptyState: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyTxt: { color: '#555', fontSize: 16 },
  emptyBtn: { backgroundColor: '#1A1A1E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  emptyBtnTxt: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#0E0E14',
  },
  hBtn: { padding: 6, borderRadius: 8 },
  hCenter: { alignItems: 'center', flex: 1 },
  hTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  hSub: { color: '#444', fontSize: 11, marginTop: 1 },
  finishBtn: {
    backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  finishTxt: { color: '#000', fontSize: 13, fontWeight: '800' },

  scroll: { paddingBottom: 120 },

  // Bubbles
  bubbleRow: { paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  bubbleWrap: { alignItems: 'center', gap: 5 },
  bubble: {
    width: 58, height: 58, borderRadius: 29,
    overflow: 'hidden', backgroundColor: '#111',
    borderWidth: 1.5, borderColor: '#222',
  },
  bubbleOn: { borderColor: '#FFF', borderWidth: 2 },
  bubbleImg: { width: '100%', height: '100%' },
  bubbleLbl: { color: '#444', fontSize: 8, textAlign: 'center', width: 58, lineHeight: 11 },

  // Dashboard
  dashboard: {
    flexDirection: 'row', marginHorizontal: 14,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#141420',
    backgroundColor: '#060609', height: 186, marginBottom: 8,
  },
  scanPanel: {
    flex: 1.05, borderRightWidth: 1, borderRightColor: '#141420',
    padding: 10, backgroundColor: '#040408',
  },
  demoPanel: { flex: 1.35, padding: 10 },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  scanDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF' },
  panelLbl: { color: '#444', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  scanBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  demoBox: {
    flex: 1, borderRadius: 8, overflow: 'hidden',
    backgroundColor: '#000', borderWidth: 1, borderColor: '#141420',
    position: 'relative',
  },
  demoBadge: {
    position: 'absolute', bottom: 5, right: 5,
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 4, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  demoBadgeTxt: { color: '#555', fontSize: 7, fontWeight: '800', letterSpacing: 0.7 },

  // Chips
  chips: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, marginBottom: 18 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#0E0E14', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#1E1E28', flex: 1, justifyContent: 'center',
  },
  chipDanger: { borderColor: '#1E1E28' },
  chipTxt: { color: '#CCC', fontSize: 12, fontWeight: '600' },

  // Title row
  titleRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 14, marginBottom: 18, gap: 10,
  },
  exTitle: { color: '#FFF', fontSize: 19, fontWeight: '800', lineHeight: 23, flex: 1 },
  exSub: { color: '#888899', fontSize: 12, marginTop: 3 },

  // Rest config chip
  restConfigChip: {
    backgroundColor: '#0E0E14', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: '#222232', alignItems: 'center', gap: 2, minWidth: 64,
  },
  restConfigInput: { color: '#FFF', fontSize: 15, fontWeight: '700', textAlign: 'center', width: 52 },
  restConfigTime: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  restConfigLbl: { color: '#888899', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },

  // Table
  table: { paddingHorizontal: 14 },
  tableHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 2 },
  th: { color: '#777788', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  setNum: { color: '#CCCCCC', fontSize: 14, fontWeight: '700' },
  setPrev: { color: '#555566', fontSize: 13 },
  setInput: {
    backgroundColor: '#0C0C12', color: '#FFF', height: 40,
    borderRadius: 8, textAlign: 'center', fontSize: 15, fontWeight: '700',
    borderWidth: 1, borderColor: '#1A1A22',
  },
  setInputDone: { backgroundColor: '#090910', color: '#888', borderColor: '#141420' },
  setActions: { width: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  removeBtn: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#111',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#0E0E14', borderWidth: 1, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBtnOn: { backgroundColor: '#FFF', borderColor: '#FFF' },

  // Add set
  addSetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginHorizontal: 14, marginTop: 10, paddingVertical: 13,
    borderRadius: 10, borderWidth: 1, borderColor: '#333345',
    borderStyle: 'dashed',
  },
  addSetTxt: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // REST PANEL
  restPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#060610',
    borderTopWidth: 1, borderTopColor: '#1A1A28',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  restCircleWrap: { position: 'relative', width: 88, height: 88 },
  restCircleBg: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: '#1E1E28',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0A0A14',
  },
  restCircleFill: {
    position: 'absolute', width: 88, height: 88,
    borderRadius: 44, borderWidth: 3,
  },
  restCircleCenter: { alignItems: 'center' },
  restTime: { color: '#FFF', fontSize: 22, fontWeight: '800', lineHeight: 26 },
  restTimeSub: { color: '#444', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  restBarRow: { flexDirection: 'row', gap: 3, marginBottom: 10 },
  restSeg: { flex: 1, height: 3, borderRadius: 2 },
  restTargetRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  restTargetInput: {
    color: '#FFF', fontSize: 12, fontWeight: '600',
    borderBottomWidth: 1, borderBottomColor: '#444', paddingVertical: 0, width: 36, textAlign: 'center',
  },
  restTargetTap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  restTargetTxt: { color: '#888', fontSize: 12, fontWeight: '600' },
  restTargetLabel: { color: '#444', fontSize: 11 },
  restBtns: { flexDirection: 'row', gap: 8 },
  restBtnSecondary: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#111118', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 16, borderWidth: 1, borderColor: '#222',
  },
  restBtnSecTxt: { color: '#AAA', fontSize: 12, fontWeight: '600' },
  restBtnPrimary: {
    backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 16, flex: 1, alignItems: 'center',
  },
  restBtnPriTxt: { color: '#000', fontSize: 12, fontWeight: '700' },

  // Overlay / Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  overlayBackdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: '#08080F', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: SH * 0.88,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#181825',
    overflow: 'hidden',
  },
  sheetTall: { maxHeight: SH * 0.92 },
  sheetWeb: {
    maxWidth: 520, width: '100%', alignSelf: 'center',
    borderRadius: 20, marginBottom: IS_WEB ? 40 : 0,
    marginHorizontal: 'auto' as any,
  },
  sheetClose: {
    position: 'absolute', top: 14, right: 14, width: 30, height: 30,
    borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },

  // Tutorial
  tutHero: { width: '100%', height: 280, backgroundColor: '#000', position: 'relative' },
  noGifBox: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#070710' },
  noGifTxt: { color: '#333', fontSize: 13, marginTop: 10 },
  scanBadge: {
    position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  scanBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  scanBadgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  tabPill: {
    position: 'absolute', bottom: 12,
    alignSelf: 'center', left: '50%',
    transform: [{ translateX: -76 }],
    flexDirection: 'row', width: 152,
    backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 3,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 6, borderRadius: 15,
  },
  tabBtnOn: { backgroundColor: '#FFF' },
  tabTxt: { color: '#555', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  tabTxtOn: { color: '#000' },
  tutBody: { paddingHorizontal: 20, paddingTop: 18 },
  tutName: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  tutBadges: { flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  tutBadge: {
    backgroundColor: '#111118', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tutBadgeTxt: { color: '#888', fontSize: 10, fontWeight: '700' },
  tutSectionLbl: { color: '#333', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  tutDesc: { color: '#888', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  tutCloseBtn: { backgroundColor: '#FFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  tutCloseTxt: { color: '#000', fontSize: 14, fontWeight: '700' },

  // Replace
  replaceTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#111',
  },
  replaceTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 3 },
  replaceSub: { color: '#444', fontSize: 12 },
  searchBar: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: '#0E0E14', color: '#FFF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    borderWidth: 1, borderColor: '#1E1E28',
  },
  emptySearch: { paddingVertical: 48, alignItems: 'center' },
  emptySearchTxt: { color: '#333', fontSize: 14 },
  replaceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#0E0E14',
  },
  replaceThumb: {
    width: 46, height: 46, borderRadius: 10, overflow: 'hidden',
    backgroundColor: '#0E0E14', borderWidth: 1, borderColor: '#1E1E28',
  },
  replaceRowName: { color: '#DDD', fontSize: 13, fontWeight: '600' },
  replaceRowSub: { color: '#444', fontSize: 11 },

  // Delete confirm modal
  confirmBox: {
    backgroundColor: '#0C0C14', borderRadius: 20,
    borderWidth: 1, borderColor: '#1A1A24',
    padding: 24, marginHorizontal: 24, alignItems: 'center',
    maxWidth: 340, width: '100%',
  },
  confirmIcon: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#0C0C12', borderWidth: 1, borderColor: '#1A1A22',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  confirmTitle: { color: '#FFF', fontSize: 17, fontWeight: '800', marginBottom: 8 },
  confirmMsg: { color: '#888899', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 24 },
  confirmBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  confirmCancelBtn: {
    flex: 1, backgroundColor: '#141418', paddingVertical: 13,
    borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#222',
  },
  confirmCancelTxt: { color: '#AAA', fontSize: 14, fontWeight: '600' },
  confirmDeleteBtn: {
    flex: 1, backgroundColor: '#FFF', paddingVertical: 13,
    borderRadius: 12, alignItems: 'center',
  },
  confirmDeleteTxt: { color: '#000', fontSize: 14, fontWeight: '800' },

  // Image containment fixes to avoid excessive zooming
  demoImageContain: {
    width: '94%',
    height: '94%',
    alignSelf: 'center',
    marginTop: '3%',
  },
  tutImageContain: {
    width: '92%',
    height: '92%',
    alignSelf: 'center',
  },

  // Elegant Finish Workout Popup/Modal styles
  finishModalBox: {
    backgroundColor: '#07070F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1C1C28',
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  finishModalIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  finishIconPending: {
    backgroundColor: '#111118',
    borderColor: '#333344',
  },
  finishIconSuccess: {
    backgroundColor: '#111118',
    borderColor: '#FFF',
  },
  finishModalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  finishModalMsg: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  finishStatsContainer: {
    width: '100%',
    backgroundColor: '#0C0C16',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#151522',
    padding: 16,
    marginBottom: 24,
  },
  finishStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  finishStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  finishStatVal: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  finishStatLbl: { 
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  finishStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1C1C28',
  },
  finishProgressBg: {
    height: 6,
    backgroundColor: '#1A1A26',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 8,
  },
  finishProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  finishProgressText: {
    color: '#444',
    fontSize: 11,
    fontWeight: '700', 
    textAlign: 'center',
  },
  finishModalBtns: {
    width: '100%',
    gap: 8,
  },
  finishModalSaveBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishModalSaveTxt: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  finishModalResumeBtn: {
    backgroundColor: '#0F0F1A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222232',
  },
  finishModalResumeTxt: {
    color: '#CCC',
    fontSize: 14,
    fontWeight: '700',
  },
  finishModalDiscardBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishModalDiscardTxt: {
    color: '#666677',
    fontSize: 13,
    fontWeight: '700',
  },

  // Rest Adjust Modal
  restModalBox: {
    backgroundColor: '#07070F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1C1C28',
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  restModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  restModalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  restModalSub: {
    color: '#888899',
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
    width: '100%',
  },
  adjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: '#333345',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustValBox: {
    alignItems: 'center',
  },
  adjustValText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  adjustValLbl: {
    color: '#888899',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  presetPill: {
    backgroundColor: '#0E0E14',
    borderWidth: 1,
    borderColor: '#222232',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  presetPillActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  presetPillTxt: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
  },
  presetPillTxtActive: {
    color: '#000',
    fontWeight: '800',
  },
  restModalBtns: {
    width: '100%',
    gap: 8,
  },
  restModalConfirmBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restModalConfirmTxt: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
  restModalCancelBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restModalCancelTxt: {
    color: '#888899',
    fontSize: 13,
    fontWeight: '600',
  },

});
