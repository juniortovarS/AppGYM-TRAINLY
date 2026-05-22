import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../hooks/useTheme';
import { useActivityStore, Exercise } from '../store/useActivityStore';
import { Search, ChevronDown, Check, X, ChevronLeft, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getExerciseAnatomicalAsset } from '../utils/exerciseAssets';
import { useAppHeight } from '../hooks/useAppWidth';
const MUSCLE_GROUPS = ['Cualquier parte del cuerpo', 'Bíceps', 'Tríceps', 'Hombros', 'Piernas', 'Pecho', 'Espalda', 'Core'];
const CATEGORIES = ['Cualquier categoría', 'Mancuernas', 'Máquina', 'Peso corporal'];

export const EjerciciosScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation();
  const { exercises, addExerciseToDraft, draftRoutineExercises } = useActivityStore();
  const SCREEN_HEIGHT = useAppHeight();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Cualquier parte del cuerpo');
  const [selectedCategory, setSelectedCategory] = useState('Cualquier categoría');
  
  const [isMuscleModalVisible, setIsMuscleModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCatalogGif, setShowCatalogGif] = useState(false);

  React.useEffect(() => {
    if (selectedExercise) {
      setShowCatalogGif(false);
    }
  }, [selectedExercise]);

  // Filtering Logic
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Cualquier parte del cuerpo' || ex.bodyPart === selectedMuscle;
    const matchesCategory = selectedCategory === 'Cualquier categoría' || ex.category === selectedCategory;
    return matchesSearch && matchesMuscle && matchesCategory;
  });

  const handleAddExercise = () => {
    if (selectedExercise) {
      addExerciseToDraft(selectedExercise);
      Alert.alert(
        'Añadido', 
        `"${selectedExercise.name}" ha sido añadido a tu rutina.`,
        [
          { text: 'Seguir buscando', onPress: () => setSelectedExercise(null) },
          { text: 'Ver Rutina', onPress: () => {
              setSelectedExercise(null);
              navigation.goBack();
          }}
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Title */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={28} color={colors.textPrimary} />
          </Pressable>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
              EJERCICIOS
            </Text>
            <Text style={[styles.subtitle, { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }]}>
              BASE DE DATOS DE ENTRENAMIENTO
            </Text>
          </View>
        </View>
        {draftRoutineExercises.length > 0 && (
          <View style={styles.draftBadge}>
            <Text style={styles.draftBadgeText}>{draftRoutineExercises.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Search Input */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[styles.searchWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por nombre..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textSecondary} style={{ marginRight: 10 }} />
            </Pressable>
          )}
        </MotiView>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          {/* Muscle Filter */}
          <Pressable
            onPress={() => setIsMuscleModalVisible(true)}
            style={({ pressed }) => [
              styles.filterBtn,
              {
                backgroundColor: colors.card,
                borderColor: selectedMuscle !== 'Cualquier parte del cuerpo' ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.filterBtnText,
                {
                  color: selectedMuscle !== 'Cualquier parte del cuerpo' ? colors.primary : colors.textPrimary,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                },
              ]}
            >
              {selectedMuscle}
            </Text>
            <ChevronDown size={14} color={selectedMuscle !== 'Cualquier parte del cuerpo' ? colors.primary : colors.textSecondary} />
          </Pressable>

          {/* Category Filter */}
          <Pressable
            onPress={() => setIsCategoryModalVisible(true)}
            style={({ pressed }) => [
              styles.filterBtn,
              {
                backgroundColor: colors.card,
                borderColor: selectedCategory !== 'Cualquier categoría' ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.filterBtnText,
                {
                  color: selectedCategory !== 'Cualquier categoría' ? colors.primary : colors.textPrimary,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                },
              ]}
            >
              {selectedCategory}
            </Text>
            <ChevronDown size={14} color={selectedCategory !== 'Cualquier categoría' ? colors.primary : colors.textSecondary} />
          </Pressable>
        </View>

        {/* Exercises List */}
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {filteredExercises.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                No se encontraron ejercicios con los filtros seleccionados.
              </Text>
            </View>
          ) : (
            filteredExercises.map((ex, index) => (
              <Pressable
                key={ex.id}
                onPress={() => setSelectedExercise(ex)}
                style={({ pressed }) => [
                  styles.cardPressable,
                  { opacity: pressed ? 0.9 : 1 }
                ]}
              >
                <MotiView
                  from={{ opacity: 0, translateY: 15 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 350, delay: index * 30 }}
                  style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.imageContainer, { borderColor: colors.border }]}>
                    <Image
                      source={getExerciseAnatomicalAsset(ex)}
                      style={styles.exerciseImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={[styles.exerciseName, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                      {ex.name}
                    </Text>
                    <Text style={[styles.exerciseMuscle, { color: colors.primary }]}>
                      {ex.bodyPart}
                    </Text>
                  </View>
                </MotiView>
              </Pressable>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* MUSCLE GROUP FILTER POPUP */}
      <AnimatePresence>
        {isMuscleModalVisible && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.absoluteOverlay}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsMuscleModalVisible(false)} />
            <MotiView
              from={{ translateY: SCREEN_HEIGHT * 0.3, scale: 0.98 }}
              animate={{ translateY: 0, scale: 1 }}
              exit={{ translateY: SCREEN_HEIGHT * 0.3, scale: 0.98 }}
              transition={{ type: 'spring', damping: 22, stiffness: 140 }}
              style={[styles.detailModalContent, { backgroundColor: colors.card, borderColor: colors.border, height: '55%' }]}
            >
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
              <View style={[styles.detailHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.detailTitleText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                  PARTE DEL CUERPO
                </Text>
                <Pressable onPress={() => setIsMuscleModalVisible(false)} style={styles.closeBtn}>
                  <X size={20} color={colors.textPrimary} />
                </Pressable>
              </View>
              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                {MUSCLE_GROUPS.map((group) => (
                  <Pressable
                    key={group}
                    onPress={() => {
                      setSelectedMuscle(group);
                      setIsMuscleModalVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.modalOption,
                      { 
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: selectedMuscle === group ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                        opacity: pressed ? 0.8 : 1,
                        borderRadius: 10,
                        marginVertical: 2,
                      }
                    ]}
                  >
                    <Text
                      style={{
                        color: selectedMuscle === group ? colors.primary : colors.textPrimary,
                        fontSize: typography.sizes.sm,
                        fontWeight: selectedMuscle === group ? typography.weights.bold : typography.weights.medium,
                      }}
                    >
                      {group}
                    </Text>
                    {selectedMuscle === group && <Check size={18} color={colors.primary} />}
                  </Pressable>
                ))}
                <View style={{ height: 30 }} />
              </ScrollView>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>

      {/* CATEGORY FILTER POPUP */}
      <AnimatePresence>
        {isCategoryModalVisible && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.absoluteOverlay}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsCategoryModalVisible(false)} />
            <MotiView
              from={{ translateY: SCREEN_HEIGHT * 0.25, scale: 0.98 }}
              animate={{ translateY: 0, scale: 1 }}
              exit={{ translateY: SCREEN_HEIGHT * 0.25, scale: 0.98 }}
              transition={{ type: 'spring', damping: 22, stiffness: 140 }}
              style={[styles.detailModalContent, { backgroundColor: colors.card, borderColor: colors.border, height: '40%' }]}
            >
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
              <View style={[styles.detailHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.detailTitleText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                  CATEGORÍA / EQUIPAMIENTO
                </Text>
                <Pressable onPress={() => setIsCategoryModalVisible(false)} style={styles.closeBtn}>
                  <X size={20} color={colors.textPrimary} />
                </Pressable>
              </View>
              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setIsCategoryModalVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.modalOption,
                      { 
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: selectedCategory === cat ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                        opacity: pressed ? 0.8 : 1,
                        borderRadius: 10,
                        marginVertical: 2,
                      }
                    ]}
                  >
                    <Text
                      style={{
                        color: selectedCategory === cat ? colors.primary : colors.textPrimary,
                        fontSize: typography.sizes.sm,
                        fontWeight: selectedCategory === cat ? typography.weights.bold : typography.weights.medium,
                      }}
                    >
                      {cat}
                    </Text>
                    {selectedCategory === cat && <Check size={18} color={colors.primary} />}
                  </Pressable>
                ))}
                <View style={{ height: 30 }} />
              </ScrollView>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedExercise && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.absoluteOverlay}
          >
            <Pressable 
              style={StyleSheet.absoluteFill} 
              onPress={() => setSelectedExercise(null)} 
            />
            
            <MotiView
              from={{ translateY: SCREEN_HEIGHT * 0.4, scale: 0.95 }}
              animate={{ translateY: 0, scale: 1 }}
              exit={{ translateY: SCREEN_HEIGHT * 0.4, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 140 }}
              style={[styles.detailModalContent, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

              <View style={[styles.detailHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.detailTitleText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                  DETALLE DEL EJERCICIO
                </Text>
                <Pressable onPress={() => setSelectedExercise(null)} style={styles.closeBtn}>
                  <X size={20} color={colors.textPrimary} />
                </Pressable>
              </View>

              <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                <View style={[styles.largeGifWrapper, { borderColor: colors.border, backgroundColor: '#050508' }]}>
                  <Image
                    source={showCatalogGif ? { uri: selectedExercise.gifUrl } : getExerciseAnatomicalAsset(selectedExercise)}
                    style={styles.largeGif}
                    contentFit={showCatalogGif ? "contain" : "cover"}
                    transition={200}
                  />
                  <Pressable
                    onPress={() => setShowCatalogGif(!showCatalogGif)}
                    style={styles.toggleGifBtn}
                  >
                    <Text style={styles.toggleGifBtnText}>
                      {showCatalogGif ? "Ver Anatomía" : "Ver Movimiento"}
                    </Text>
                  </Pressable>
                </View>

                <Text style={[styles.detailNameText, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                  {selectedExercise.name}
                </Text>

                <View style={styles.detailBadgesRow}>
                  <View style={[styles.detailBadge, { backgroundColor: `${colors.primary}12`, borderColor: colors.primary }]}>
                    <Text style={[styles.detailBadgeText, { color: colors.primary, fontSize: 10, fontWeight: '700' }]}>
                      {selectedExercise.bodyPart.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.detailBadge, { backgroundColor: '#1C1C1E', borderColor: colors.border }]}>
                    <Text style={[styles.detailBadgeText, { color: colors.textSecondary, fontSize: 10, fontWeight: '600' }]}>
                      {selectedExercise.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.descSection}>
                  <Text style={[styles.descSectionTitle, { color: colors.primary }]}>
                    CÓMO REALIZARLO
                  </Text>
                  <Text style={[styles.descText, { color: colors.textSecondary }]}>
                    {selectedExercise.description}
                  </Text>
                </View>
                
                {/* BOTON DE AÑADIR A RUTINA */}
                <Pressable 
                  onPress={handleAddExercise}
                  style={({ pressed }) => [
                    styles.addRoutineBtn,
                    { opacity: pressed ? 0.8 : 1 }
                  ]}
                >
                  <Plus size={20} color="#000" style={{ marginRight: 8 }} />
                  <Text style={styles.addRoutineBtnText}>Añadir a Rutina</Text>
                </Pressable>
                
                <View style={{ height: 40 }} />
              </ScrollView>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },
  draftBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    letterSpacing: 1,
  },
  subtitle: {
    letterSpacing: 1.5,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: {
    marginLeft: 14,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    paddingHorizontal: 12,
  },
  filterBtnText: {
    flex: 1,
    marginRight: 4,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.8,
  },
  cardPressable: {
    marginBottom: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#0F0F12',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  exerciseName: {
    lineHeight: 18,
    marginBottom: 4,
  },
  exerciseMuscle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  detailModalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: '80%',
    paddingBottom: 30,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  detailTitleText: {
    letterSpacing: 1.2,
  },
  closeBtn: {
    padding: 4,
  },
  detailScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  largeGifWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  largeGif: {
    width: '100%',
    height: '100%',
  },
  detailNameText: {
    lineHeight: 24,
    marginBottom: 10,
  },
  detailBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  detailBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  detailBadgeText: {},
  descSection: {
    marginBottom: 24,
  },
  descSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
  },
  addRoutineBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  addRoutineBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleGifBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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
