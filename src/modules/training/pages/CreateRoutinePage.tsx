import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, SafeAreaView, Alert, Platform, Modal } from 'react-native';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { ChevronLeft, Plus, Download, Trash2, Dumbbell, X, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SmartAddExerciseModal } from '../components/SmartAddExerciseModal';
import { Image } from 'expo-image';
import { MotiView, AnimatePresence } from 'moti';
import { getExerciseAnatomicalAsset } from '../../../../src/utils/exerciseAssets';

export const CreateRoutinePage: React.FC = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  const [routineName, setRoutineName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [savedRoutineId, setSavedRoutineId] = useState<string | null>(null);

  const { draftRoutineExercises, createRoutine, clearDraft, removeExerciseFromDraft } = useActivityStore();

  const handleSave = () => {
    if (!routineName.trim()) {
      if (Platform.OS === 'web') {
        alert('Por favor, dale un nombre a tu rutina.');
      } else {
        Alert.alert('Falta nombre', 'Por favor, dale un nombre a tu rutina.');
      }
      return;
    }
    if (draftRoutineExercises.length === 0) {
      if (Platform.OS === 'web') {
        alert('Añade al menos un ejercicio a tu rutina.');
      } else {
        Alert.alert('Rutina vacía', 'Añade al menos un ejercicio a tu rutina.');
      }
      return;
    }

    const newId = createRoutine(routineName, '', draftRoutineExercises);
    setSavedRoutineId(newId);
    setSuccessModalVisible(true);
  };

  const handleClose = () => {
    if (draftRoutineExercises.length > 0 || routineName.length > 0) {
      if (Platform.OS === 'web') {
        const confirmDiscard = window.confirm('¿Estás seguro de que quieres salir? Se perderán los ejercicios que has añadido.');
        if (confirmDiscard) {
          clearDraft();
          navigation.goBack();
        }
      } else {
        Alert.alert(
          'Descartar cambios',
          '¿Estás seguro de que quieres salir? Se perderán los ejercicios que has añadido.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Descartar', style: 'destructive', onPress: () => {
                clearDraft();
                navigation.goBack();
            }}
          ]
        );
      }
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={handleClose} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
          NUEVA RUTINA
        </Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={[styles.saveBtnText, { color: colors.primary, fontSize: 13, fontWeight: '800' }]}>
            GUARDAR
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Name Input Section */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 }]}>
            NOMBRE DE LA RUTINA
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.card,
                borderColor: isInputFocused ? colors.primary : colors.border,
              },
            ]}
          >
            <Dumbbell size={18} color={routineName ? colors.textPrimary : colors.textMuted} style={styles.inputIcon} />
            <TextInput
              placeholder="Ej. Día de Piernas & Abdomen"
              placeholderTextColor={colors.textMuted}
              value={routineName}
              onChangeText={setRoutineName}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              style={[styles.input, { color: colors.textPrimary }]}
              maxLength={40}
            />
            {routineName.length > 0 && (
              <Pressable onPress={() => setRoutineName('')} style={styles.clearBtn}>
                <X size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <Plus size={16} color={colors.textInverse} style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: '700' }]}>
              Añadir Ejercicios
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtnSecondary,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Download size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnTextSecondary, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '700' }]}>
              Importar Rutina
            </Text>
          </Pressable>
        </View>

        {/* Added Exercises list header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 }]}>
            EJERCICIOS AÑADIDOS ({draftRoutineExercises.length})
          </Text>
        </View>

        {/* List of Added Exercises */}
        <View style={styles.exercisesList}>
          <AnimatePresence>
            {draftRoutineExercises.length === 0 ? (
              <MotiView
                key="empty"
                from={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={[styles.emptyState, { borderColor: colors.border, borderStyle: 'dashed' }]}
              >
                <Dumbbell size={28} color={colors.textMuted} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 13 }]}>
                  No hay ejercicios en esta rutina todavía.
                </Text>
                <Text style={[styles.emptySubText, { color: colors.textMuted, fontSize: 11, marginTop: 4 }]}>
                  Presiona "Añadir Ejercicios" para comenzar.
                </Text>
              </MotiView>
            ) : (
              draftRoutineExercises.map((ex, idx) => (
                <MotiView
                  key={ex.id}
                  from={{ opacity: 0, translateY: 15 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'timing', duration: 250 }}
                  style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Image source={getExerciseAnatomicalAsset(ex)} style={styles.exImage} contentFit="cover" />
                  <View style={styles.exInfo}>
                    <Text style={[styles.exName, { color: colors.textPrimary }]}>{ex.name}</Text>
                    <View style={styles.badgesRow}>
                      <Text style={[styles.exBadgeText, { color: colors.textSecondary }]}>{ex.bodyPart}</Text>
                      <Text style={[styles.exBadgeDot, { color: colors.textMuted }]}>•</Text>
                      <Text style={[styles.exBadgeText, { color: colors.textSecondary }]}>{ex.category}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => removeExerciseFromDraft(ex.id)}
                    style={({ pressed }) => [
                      styles.removeBtn,
                      { opacity: pressed ? 0.7 : 1 }
                    ]}
                  >
                    <Trash2 size={18} color={colors.accentRed} />
                  </Pressable>
                </MotiView>
              ))
            )}
          </AnimatePresence>
        </View>
      </ScrollView>

      {/* Multi-select Exercise Selector Modal */}
      <SmartAddExerciseModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Success Icon */}
            <View style={styles.successIconWrapper}>
              <View style={[styles.successIconOuter, { borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <View style={[styles.successIconInner, { backgroundColor: colors.primary }]}>
                  <Check size={28} color={colors.textInverse} strokeWidth={3} />
                </View>
              </View>
            </View>

            {/* Success Text */}
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              ¡RUTINA CREADA!
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Tu rutina ha sido guardada exitosamente en tu catálogo.
            </Text>

            {/* Actions Buttons */}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setSuccessModalVisible(false);
                  if (savedRoutineId) {
                    navigation.replace('RoutineDetail', { routineId: savedRoutineId });
                  } else {
                    navigation.goBack();
                  }
                }}
                style={({ pressed }) => [
                  styles.modalBtnPrimary,
                  { backgroundColor: '#FFFFFF', opacity: pressed ? 0.9 : 1 }
                ]}
              >
                <Text style={[styles.modalBtnTextPrimary, { color: '#000000', fontSize: typography.sizes.sm, fontWeight: '700' }]}>
                  Ver rutina
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setSuccessModalVisible(false);
                  navigation.goBack();
                }}
                style={({ pressed }) => [
                  styles.modalBtnSecondary,
                  { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <Text style={[styles.modalBtnTextSecondary, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '700' }]}>
                  Cerrar
                </Text>
              </Pressable>
            </View>
          </MotiView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    letterSpacing: 1.5,
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveBtnText: {
    letterSpacing: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {},
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnTextSecondary: {},
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {},
  exercisesList: {
    gap: 10,
  },
  emptyState: {
    paddingVertical: 32,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontWeight: '600',
  },
  emptySubText: {
    fontWeight: '400',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  exImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  exInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  exName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  exBadgeDot: {
    marginHorizontal: 5,
    fontSize: 11,
  },
  removeBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successIconOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  successIconInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 28,
  },
  modalActions: {
    width: '100%',
    gap: 10,
  },
  modalBtnPrimary: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnTextPrimary: {
    textAlign: 'center',
  },
  modalBtnSecondary: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnTextSecondary: {
    textAlign: 'center',
  },
});
