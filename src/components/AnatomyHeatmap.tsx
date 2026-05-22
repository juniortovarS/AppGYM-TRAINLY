import React from 'react';
import { View, StyleSheet } from 'react-native';
import Body from 'react-native-body-highlighter';
import { useAppWidth } from '../hooks/useAppWidth';
import { useActivityStore } from '../store/useActivityStore';

export interface AnatomyHeatmapProps {
  // Keeping props optional for compatibility, but we now read directly from store
  chestIntensity?: number;
  bicepsIntensity?: number;
  absIntensity?: number;
  quadsIntensity?: number;
}

export const AnatomyHeatmap: React.FC<AnatomyHeatmapProps> = () => {
  const { workoutHistory } = useActivityStore();
  const SCREEN_WIDTH = useAppWidth();
  
  // Calculate responsive sizing
  const containerWidth = SCREEN_WIDTH - 40;
  const itemWidth = (containerWidth - 16) / 2;
  const itemHeight = itemWidth * 1.95; // Aspect ratio of body outline

  // Calculate completed sets per body part
  const completedSetsByPart: Record<string, number> = {
    'Bíceps': 0,
    'Tríceps': 0,
    'Hombros': 0,
    'Piernas': 0,
    'Pecho': 0,
    'Espalda': 0,
    'Core': 0,
  };

  workoutHistory.forEach((session) => {
    session.exercises.forEach((ex) => {
      const part = ex.bodyPart;
      if (completedSetsByPart[part] !== undefined) {
        const completedSets = ex.sets.filter((s) => s.completed).length;
        completedSetsByPart[part] += completedSets;
      }
    });
  });

  // Helper to resolve custom muscle highlighting styles based on completed sets
  const getStyleForPart = (part: string) => {
    const sets = completedSetsByPart[part] || 0;
    if (sets === 0) {
      return {
        fill: '#121216',
        stroke: '#252533',
        strokeWidth: 0.5,
      };
    }

    // Color intensity: 1-4 sets (bronze/dark gray), 5-10 sets (silver), 11+ sets (white)
    const fill = sets <= 4 ? '#4E4E52' : sets <= 10 ? '#AEAEB2' : '#FFFFFF';

    return {
      fill,
      stroke: '#FFFFFF',
      strokeWidth: 0.8,
    };
  };

  // Build data arrays for front and back using computed styles
  const frontData = [
    { slug: 'chest', styles: getStyleForPart('Pecho') },
    { slug: 'biceps', styles: getStyleForPart('Bíceps') },
    { slug: 'abs', styles: getStyleForPart('Core') },
    { slug: 'obliques', styles: getStyleForPart('Core') },
    { slug: 'quadriceps', styles: getStyleForPart('Piernas') },
    { slug: 'front-deltoids', styles: getStyleForPart('Hombros') },
  ];

  const backData = [
    { slug: 'triceps', styles: getStyleForPart('Tríceps') },
    { slug: 'hamstring', styles: getStyleForPart('Piernas') },
    { slug: 'calves', styles: getStyleForPart('Piernas') },
    { slug: 'gluteal', styles: getStyleForPart('Piernas') },
    { slug: 'upper-back', styles: getStyleForPart('Espalda') },
    { slug: 'lower-back', styles: getStyleForPart('Espalda') },
    { slug: 'trapezius', styles: getStyleForPart('Espalda') },
    { slug: 'back-deltoids', styles: getStyleForPart('Hombros') },
  ];

  // Dynamic scaling factor based on column width
  const scaleFactor = itemWidth / 140;

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      {/* Front Body */}
      <View style={[styles.bodyWrapper, { width: itemWidth, height: itemHeight }]}>
        <Body
          data={frontData as any}
          gender="male"
          side="front"
          scale={scaleFactor * 0.9}
          border="#2C2C35"
          defaultFill="#121216"
        />
      </View>

      {/* Back Body */}
      <View style={[styles.bodyWrapper, { width: itemWidth, height: itemHeight }]}>
        <Body
          data={backData as any}
          gender="male"
          side="back"
          scale={scaleFactor * 0.9}
          border="#2C2C35"
          defaultFill="#121216"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
    alignSelf: 'center',
  },
  bodyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: '#1C1C24',
    overflow: 'hidden',
  },
});
