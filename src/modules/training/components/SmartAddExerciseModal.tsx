import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, TextInput, ScrollView } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useActivityStore, Exercise } from '../../../../src/store/useActivityStore';
import { X, Search, Info, Check, Dumbbell } from 'lucide-react-native';
import { Image } from 'expo-image';
import { getExerciseAnatomicalAsset } from '../../../../src/utils/exerciseAssets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SmartAddExerciseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectOption?: (option: 'ai' | 'scan' | 'manual' | 'catalog') => void; // Maintained for backward compatibility if referenced elsewhere
}

const MUSCLE_GROUPS = ['Todos', 'Bíceps', 'Tríceps', 'Hombros', 'Piernas', 'Pecho', 'Espalda', 'Core'];

export const SmartAddExerciseModal: React.FC<SmartAddExerciseModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { colors, typography } = useTheme();
  const { exercises, draftRoutineExercises, setDraftExercises } = useActivityStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showGifInDetail, setShowGifInDetail] = useState(false);

  useEffect(() => {
    if (detailExercise) {
      setShowGifInDetail(false);
    }
  }, [detailExercise]);

  // Synchronize selection state with draftRoutineExercises when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedIds(new Set(draftRoutineExercises.map((e) => e.id)));
      setSearchQuery('');
      setSelectedMuscle('Todos');
      setDetailExercise(null);
    }
  }, [isVisible, draftRoutineExercises]);

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Todos' || ex.bodyPart === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    // Sincronizar con el draft del store
    const selectedExercisesList = exercises.filter((ex) => selectedIds.has(ex.id));
    setDraftExercises(selectedExercisesList);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          style={styles.absoluteOverlay}
        >
          {/* Background Overlay */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          {/* Modal Container */}
          <MotiView
            from={{ translateY: SCREEN_HEIGHT * 0.5, scale: 0.98 }}
            animate={{ translateY: 0, scale: 1 }}
            exit={{ translateY: SCREEN_HEIGHT * 0.5, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 150 }}
            style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Drag indicator */}
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                  SELECCIONAR EJERCICIOS
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 11 }]}>
                  {selectedIds.size} {selectedIds.size === 1 ? 'seleccionado' : 'seleccionados'}
                </Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View
                style={[
                  styles.searchWrapper,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: isSearchFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  placeholder="Buscar ejercicio..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={[styles.searchInput, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Muscle Chips Filter */}
            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                {MUSCLE_GROUPS.map((muscle) => {
                  const isSelected = selectedMuscle === muscle;
                  return (
                    <Pressable
                      key={muscle}
                      onPress={() => setSelectedMuscle(muscle)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.cardElevated,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? colors.textInverse : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {muscle}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Exercises Checklist */}
            <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {filteredExercises.length === 0 ? (
                <View style={styles.emptyState}>
                  <Dumbbell size={36} color={colors.textMuted} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No encontramos ejercicios.
                  </Text>
                </View>
              ) : (
                filteredExercises.map((ex) => {
                  const isChecked = selectedIds.has(ex.id);
                  return (
                    <Pressable
                      key={ex.id}
                      onPress={() => toggleSelect(ex.id)}
                      style={[
                        styles.exerciseItem,
                        {
                          backgroundColor: isChecked ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                          borderColor: isChecked ? colors.borderFocus : colors.border,
                        },
                      ]}
                    >
                      {/* GIF/Thumbnail */}
                      <View style={styles.thumbnailWrapper}>
                        <Image source={getExerciseAnatomicalAsset(ex)} style={styles.thumbnail} contentFit="cover" />
                      </View>

                      {/* Info & Title */}
                      <View style={styles.infoCol}>
                        <Text style={[styles.exName, { color: colors.textPrimary }]}>{ex.name}</Text>
                        <View style={styles.badgesRow}>
                          <Text style={[styles.exBadge, { color: colors.textSecondary }]}>
                            {ex.bodyPart}
                          </Text>
                          <Text style={[styles.exDot, { color: colors.textMuted }]}>•</Text>
                          <Text style={[styles.exBadge, { color: colors.textSecondary }]}>
                            {ex.category}
                          </Text>
                        </View>
                      </View>

                      {/* Actions Right (Info Button + Checkbox) */}
                      <View style={styles.actionsRight}>
                        <Pressable
                          onPress={() => setDetailExercise(ex)}
                          style={({ pressed }) => [
                            styles.infoBtn,
                            {
                              backgroundColor: colors.cardElevated,
                              borderColor: colors.border,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                        >
                          <Info size={16} color={colors.textSecondary} />
                        </Pressable>

                        <View
                          style={[
                            styles.checkbox,
                            {
                              borderColor: isChecked ? colors.primary : colors.border,
                              backgroundColor: isChecked ? colors.primary : 'transparent',
                            },
                          ]}
                        >
                          {isChecked && <Check size={12} color={colors.textInverse} strokeWidth={3} />}
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Actions Sticky */}
            <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text style={[styles.confirmBtnText, { color: colors.textInverse }]}>
                  CONFIRMAR SELECCIÓN ({selectedIds.size})
                </Text>
              </Pressable>
            </View>

            {/* Sub-modal: Quick Exercise Detail (In-situ) */}
            <AnimatePresence>
              {detailExercise && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={styles.detailOverlay}
                >
                  <Pressable style={StyleSheet.absoluteFill} onPress={() => setDetailExercise(null)} />
                  <MotiView
                    from={{ translateY: 200, scale: 0.95 }}
                    animate={{ translateY: 0, scale: 1 }}
                    exit={{ translateY: 200, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={[styles.detailModal, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={styles.detailHeader}>
                      <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>DETALLE RÁPIDO</Text>
                      <Pressable onPress={() => setDetailExercise(null)} style={styles.closeBtn}>
                        <X size={18} color={colors.textPrimary} />
                      </Pressable>
                    </View>

                    <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                      <View style={[styles.detailGifWrapper, { borderColor: colors.border }]}>
                        <Image
                          source={showGifInDetail ? { uri: detailExercise.gifUrl } : getExerciseAnatomicalAsset(detailExercise)}
                          style={styles.detailGif}
                          contentFit={showGifInDetail ? "contain" : "cover"}
                        />
                        <Pressable
                          onPress={() => setShowGifInDetail(!showGifInDetail)}
                          style={styles.toggleGifBtn}
                        >
                          <Text style={styles.toggleGifBtnText}>
                            {showGifInDetail ? "Ver Anatomía" : "Ver Movimiento"}
                          </Text>
                        </Pressable>
                      </View>

                      <Text style={[styles.detailExName, { color: colors.textPrimary }]}>{detailExercise.name}</Text>
                      
                      <View style={styles.detailBadges}>
                        <View style={[styles.detailBadge, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.border }]}>
                          <Text style={{ color: colors.textPrimary, fontSize: 10, fontWeight: '700' }}>{detailExercise.bodyPart.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.detailBadge, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.border }]}>
                          <Text style={{ color: colors.textPrimary, fontSize: 10, fontWeight: '700' }}>{detailExercise.category.toUpperCase()}</Text>
                        </View>
                      </View>

                      <Text style={[styles.descTitle, { color: colors.textPrimary }]}>CÓMO REALIZARLO</Text>
                      <Text style={[styles.descText, { color: colors.textSecondary }]}>{detailExercise.description}</Text>
                      
                      <Pressable
                        onPress={() => {
                          toggleSelect(detailExercise.id);
                          setDetailExercise(null);
                        }}
                        style={[
                          styles.detailActionBtn,
                          {
                            backgroundColor: selectedIds.has(detailExercise.id) ? colors.accentRed : colors.primary,
                          },
                        ]}
                      >
                        <Text style={[styles.detailActionText, { color: selectedIds.has(detailExercise.id) ? colors.textPrimary : colors.textInverse }]}>
                          {selectedIds.has(detailExercise.id) ? 'Remover de la selección' : 'Añadir a la selección'}
                        </Text>
                      </Pressable>
                      <View style={{ height: 40 }} />
                    </ScrollView>
                  </MotiView>
                </MotiView>
              )}
            </AnimatePresence>
          </MotiView>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modalContent: {
    height: '92%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
  },
  searchIcon: {
    marginLeft: 14,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  filterSection: {
    paddingBottom: 12,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  thumbnailWrapper: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  exName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exBadge: {
    fontSize: 11,
    fontWeight: '500',
  },
  exDot: {
    marginHorizontal: 5,
    fontSize: 12,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: '#121214',
    borderTopWidth: 1,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    zIndex: 10000,
  },
  detailModal: {
    height: '75%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  detailScroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  detailGifWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailGif: {
    width: '100%',
    height: '100%',
  },
  detailExName: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
    marginBottom: 10,
  },
  detailBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  descTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  detailActionBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  detailActionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleGifBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleGifBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
