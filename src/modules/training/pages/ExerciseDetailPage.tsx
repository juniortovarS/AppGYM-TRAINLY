import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '../../../../src/hooks/useTheme';
import { ChevronLeft, PlayCircle, Trophy, TrendingUp, Info } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { useAppWidth } from '../../../../src/hooks/useAppWidth';
import { getExerciseAnatomicalAsset } from '../../../../src/utils/exerciseAssets';

export const ExerciseDetailPage: React.FC = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { exerciseId } = route.params || {};
  const screenWidth = useAppWidth();

  const { exercises } = useActivityStore();
  const exercise = exercises.find((ex: any) => ex.id === exerciseId);
  const [showGif, setShowGif] = React.useState(false);

  if (!exercise) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textPrimary }}>Ejercicio no encontrado.</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
          {exercise.name.toUpperCase()}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* VIDEO / MEDIA HEADER */}
        <Pressable 
          onPress={() => setShowGif(!showGif)} 
          style={[styles.mediaContainer, { height: screenWidth * 0.75 }]}
        >
          <Image
            source={showGif ? { uri: exercise.gifUrl } : getExerciseAnatomicalAsset(exercise)}
            style={styles.mediaVideo}
            contentFit={showGif ? "contain" : "cover"}
          />
          <View style={[styles.mediaOverlay, { backgroundColor: showGif ? 'transparent' : 'rgba(0,0,0,0.15)' }]}>
            {!showGif && <PlayCircle size={48} color="#FFF" />}
          </View>
          <View style={styles.badgeToggle}>
            <Text style={styles.badgeToggleText}>
              {showGif ? "VER ANATOMÍA" : "VER MOVIMIENTO"}
            </Text>
          </View>
        </Pressable>

        {/* METADATA */}
        <View style={styles.metaSection}>
          <Text style={[styles.exName, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: '900' }]}>
            {exercise.name}
          </Text>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{exercise.bodyPart.toUpperCase()}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{exercise.category.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* RECORDS & HISTORY SECTION */}
        <View style={styles.recordsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
            Récords Personales (PR)
          </Text>
          
          <View style={styles.prCardsRow}>
            <View style={[styles.prCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Trophy size={20} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={[styles.prValue, { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: 'bold' }]}>85 KG</Text>
              <Text style={[styles.prLabel, { color: colors.textSecondary, fontSize: 11 }]}>Peso Máximo</Text>
            </View>
            
            <View style={[styles.prCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TrendingUp size={20} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={[styles.prValue, { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: 'bold' }]}>1,250 KG</Text>
              <Text style={[styles.prLabel, { color: colors.textSecondary, fontSize: 11 }]}>Volumen Máx.</Text>
            </View>
          </View>
        </View>

        {/* INSTRUCTIONS */}
        <View style={styles.instructionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
            Técnica paso a paso
          </Text>
          
          <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={[styles.stepDot, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textPrimary, flex: 1 }]}>
                Ajusta el asiento para que el eje de rotación de la máquina esté alineado con tus rodillas.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={[styles.stepDot, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textPrimary, flex: 1 }]}>
                Sujeta las asas laterales firmemente y mantén la espalda apoyada contra el respaldo.
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.stepDot, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textPrimary, flex: 1 }]}>
                Extiende las piernas completamente con un movimiento controlado, aprieta los cuádriceps y vuelve a la posición inicial lentamente.
              </Text>
            </View>
          </View>
        </View>
        
        <View style={{ height: 60 }} />
      </ScrollView>
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
    letterSpacing: 1,
  },
  content: {
    paddingBottom: 40,
  },
  mediaContainer: {
    width: '100%',
    position: 'relative',
  },
  mediaVideo: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaSection: {
    padding: 20,
    paddingTop: 24,
  },
  exName: {
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  recordsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  prCardsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  prCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  prValue: {
    marginBottom: 4,
  },
  prLabel: {
    textTransform: 'uppercase',
  },
  instructionsSection: {
    paddingHorizontal: 20,
  },
  instructionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
  },
  badgeToggle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeToggleText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
