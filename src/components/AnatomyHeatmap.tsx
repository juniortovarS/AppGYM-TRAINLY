import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AnatomyHeatmapProps {
  chestIntensity?: number; // 0 to 1
  bicepsIntensity?: number;
  absIntensity?: number;
  quadsIntensity?: number;
}

export const AnatomyHeatmap: React.FC<AnatomyHeatmapProps> = ({
  chestIntensity = 0.8,
  bicepsIntensity = 0.5,
  absIntensity = 0,
  quadsIntensity = 0,
}) => {
  // Calculamos el tamaño responsivo para que encaje perfecto en el celular
  // 2 cuerpos con margen.
  const svgWidth = (SCREEN_WIDTH - 60) / 2;
  const svgHeight = svgWidth * 2.2; // Mantener aspect ratio 100x220

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(255, 255, 255, 0.05)';
    if (intensity < 0.4) return '#8B6508';
    if (intensity < 0.7) return '#CDBA96';
    return '#FFD700'; 
  };

  return (
    <View style={styles.container}>
      {/* Front Body */}
      <View style={styles.bodyWrapper}>
        <Svg width={svgWidth} height={svgHeight} viewBox="0 0 100 220">
          <Defs>
            <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFD700" stopOpacity="1" />
              <Stop offset="1" stopColor="#B8860B" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="bronzeGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#CD7F32" stopOpacity="1" />
              <Stop offset="1" stopColor="#8B4513" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#C0C0C0" stopOpacity="1" />
              <Stop offset="1" stopColor="#808080" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <G stroke="#FFF" strokeWidth="1" fill="none">
            <Path d="M40 20 C40 10, 60 10, 60 20 C60 30, 55 35, 50 35 C45 35, 40 30, 40 20 Z" />
            <Path d="M45 35 L45 42 M55 35 L55 42" />
            <Path d="M50 45 L30 45 L25 65 L50 65 Z" fill={chestIntensity > 0.6 ? "url(#goldGrad)" : chestIntensity > 0 ? "url(#silverGrad)" : "rgba(255,255,255,0.05)"} />
            <Path d="M50 45 L70 45 L75 65 L50 65 Z" fill={chestIntensity > 0.6 ? "url(#goldGrad)" : chestIntensity > 0 ? "url(#silverGrad)" : "rgba(255,255,255,0.05)"} />
            <Path d="M35 65 L65 65 L60 100 L40 100 Z" fill={getColor(absIntensity)} />
            <Path d="M50 65 L50 100 M40 75 L60 75 M40 85 L60 85" strokeWidth="0.5" />
            <Path d="M30 45 C20 45, 15 55, 15 65 L25 65 Z" fill="url(#silverGrad)" />
            <Path d="M70 45 C80 45, 85 55, 85 65 L75 65 Z" fill="url(#silverGrad)" />
            <Path d="M15 65 L10 90 L20 90 L25 65 Z" fill={bicepsIntensity > 0.6 ? "url(#goldGrad)" : bicepsIntensity > 0 ? "url(#bronzeGrad)" : "rgba(255,255,255,0.05)"} />
            <Path d="M85 65 L90 90 L80 90 L75 65 Z" fill={bicepsIntensity > 0.6 ? "url(#goldGrad)" : bicepsIntensity > 0 ? "url(#bronzeGrad)" : "rgba(255,255,255,0.05)"} />
            <Path d="M10 90 L5 120 L15 120 L20 90 Z" />
            <Path d="M90 90 L95 120 L85 120 L80 90 Z" />
            <Path d="M5 120 L0 135 L10 135 L15 120 Z" />
            <Path d="M95 120 L100 135 L90 135 L85 120 Z" />
            <Path d="M40 100 L60 100 L65 115 L50 125 L35 115 Z" />
            <Path d="M35 115 L25 160 L45 160 L50 125 Z" fill={getColor(quadsIntensity)} />
            <Path d="M65 115 L75 160 L55 160 L50 125 Z" fill={getColor(quadsIntensity)} />
            <Path d="M25 160 L20 200 L40 200 L45 160 Z" />
            <Path d="M75 160 L80 200 L60 200 L55 160 Z" />
            <Path d="M20 200 L15 210 L45 210 L40 200 Z" />
            <Path d="M80 200 L85 210 L55 210 L60 200 Z" />
          </G>
        </Svg>
      </View>

      {/* Back Body */}
      <View style={styles.bodyWrapper}>
        <Svg width={svgWidth} height={svgHeight} viewBox="0 0 100 220">
          <G stroke="#FFF" strokeWidth="1" fill="none">
            <Path d="M40 20 C40 10, 60 10, 60 20 C60 30, 55 35, 50 35 C45 35, 40 30, 40 20 Z" />
            <Path d="M45 35 L45 42 M55 35 L55 42" />
            <Path d="M50 42 L25 65 L45 100 L50 100 Z" fill={getColor(0)} />
            <Path d="M50 42 L75 65 L55 100 L50 100 Z" fill={getColor(0)} />
            <Path d="M25 65 L15 65 L30 80 Z" fill="url(#silverGrad)" />
            <Path d="M75 65 L85 65 L70 80 Z" fill="url(#silverGrad)" />
            <Path d="M15 65 L10 90 L20 90 L25 65 Z" fill={bicepsIntensity > 0.6 ? "url(#bronzeGrad)" : "rgba(255,255,255,0.05)"} />
            <Path d="M85 65 L90 90 L80 90 L75 65 Z" fill={bicepsIntensity > 0.6 ? "url(#bronzeGrad)" : "rgba(255,255,255,0.05)"} />
            <Path d="M10 90 L5 120 L15 120 L20 90 Z" />
            <Path d="M90 90 L95 120 L85 120 L80 90 Z" />
            <Path d="M5 120 L0 135 L10 135 L15 120 Z" />
            <Path d="M95 120 L100 135 L90 135 L85 120 Z" />
            <Path d="M45 100 L55 100 L65 115 L50 125 L35 115 Z" />
            <Path d="M35 115 C35 125, 45 125, 50 125 C45 115, 35 115, 35 115 Z" />
            <Path d="M65 115 C65 125, 55 125, 50 125 C55 115, 65 115, 65 115 Z" />
            <Path d="M35 115 L25 160 L45 160 L50 125 Z" />
            <Path d="M65 115 L75 160 L55 160 L50 125 Z" />
            <Path d="M25 160 L20 200 L40 200 L45 160 Z" />
            <Path d="M75 160 L80 200 L60 200 L55 160 Z" />
            <Path d="M20 200 L15 210 L45 210 L40 200 Z" />
            <Path d="M80 200 L85 210 L55 210 L60 200 Z" />
          </G>
        </Svg>
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
    paddingHorizontal: 20,
  },
  bodyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
