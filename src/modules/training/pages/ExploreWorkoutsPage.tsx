import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../../../src/hooks/useTheme';
import { Play, Dumbbell, Edit3, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

const EXPLORE_CARDS = [
  {
    id: '1',
    title: 'Fuerza Bruta',
    subtitle: 'Por Chris B.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    tags: ['Avanzado', 'Hipertrofia'],
  },
  {
    id: '2',
    title: 'Piernas de Acero',
    subtitle: 'Por Fit Coach',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop',
    tags: ['Intermedio', 'Fuerza'],
  },
  {
    id: '3',
    title: 'Cardio HIIT',
    subtitle: 'Quema Grasa',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1325&auto=format&fit=crop',
    tags: ['Principiante', 'Cardio'],
  }
];

export const ExploreWorkoutsPage: React.FC = () => {
  const { colors, typography } = useTheme();
  const { routines } = useActivityStore();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: 'bold' }]}>
          ENTRENAR
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* === TUS ENTRENAMIENTOS (Rutinas del Usuario) === */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tus Entrenamientos</Text>
        
        {routines.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIconBg, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Dumbbell size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: 'bold' }]}>
              No hay rutinas aún
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              Usa el botón central [+] para crear una.
            </Text>
          </View>
        ) : (
          routines.map((routine, idx) => (
            <MotiView 
              key={routine.id}
              from={{ opacity: 0, translateY: 10 }}
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
                    <Text style={[styles.routineName, { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: 'bold' }]}>
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

                {/* Thumbnails */}
                <View style={styles.exerciseThumbnails}>
                  {routine.exercises.slice(0, 4).map((ex, i) => (
                    <Image key={i} source={{ uri: ex.gifUrl }} style={[styles.miniThumb, { borderColor: colors.border }]} />
                  ))}
                  {routine.exercises.length > 4 && (
                    <View style={[styles.miniThumbMore, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
                      <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: 'bold' }}>+{routine.exercises.length - 4}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </MotiView>
          ))
        )}

        {/* === EXPLORAR (Cards Fitness) === */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>Explorar</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreSliderContainer}>
          {EXPLORE_CARDS.map((card) => (
            <Pressable key={card.id} style={styles.cardContainerSquare}>
              <Image source={{ uri: card.image }} style={styles.cardImage} contentFit="cover" />
              <View style={[styles.cardOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                <View style={styles.tagsRow}>
                  {card.tags.map(tag => (
                    <View key={tag} style={[styles.tag, { backgroundColor: 'rgba(255, 215, 0, 0.8)' }]}>
                      <Text style={[styles.tagText, { color: '#000' }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.cardBottom}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: '#FFF' }]}>{card.title}</Text>
                    <Text style={[styles.cardSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>{card.subtitle}</Text>
                  </View>
                  <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
                    <Play size={20} color="#000" style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    letterSpacing: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  /* ESTILOS DE RUTINAS */
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  routineCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routineName: {
    marginBottom: 4,
  },
  routineMeta: {},
  exerciseThumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -12, // overlap
  },
  miniThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: '#1C1C1E',
  },
  miniThumbMore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  /* ESTILOS DE EXPLORE CARDS */
  exploreSliderContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cardContainerSquare: {
    width: 280, // Square-ish width
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
