import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Zap, Heart, Flame } from 'lucide-react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ActivitySummaryCardProps {
  recoveryScore: number; // 0 to 100
  strainScore: number; // 0 to 21
  caloriesBurned: number;
  caloriesTarget: number;
  activeTime: number;
  activeTimeTarget: number;
  hrv: number;
  restingHr: number;
}

export const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({
  recoveryScore,
  strainScore,
  caloriesBurned,
  caloriesTarget,
  activeTime,
  activeTimeTarget,
  hrv,
  restingHr,
}) => {
  const { colors, spacing, typography } = useTheme();

  // SVG parameters
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Reanimated shared values
  const recoveryProgress = useSharedValue(0);
  const activeCaloriesProgress = useSharedValue(0);

  useEffect(() => {
    // Animate the values on mount
    recoveryProgress.value = withDelay(300, withTiming(recoveryScore / 100, { duration: 1200 }));
    activeCaloriesProgress.value = withDelay(500, withTiming(caloriesBurned / caloriesTarget, { duration: 1200 }));
  }, [recoveryScore, caloriesBurned, caloriesTarget]);

  // Animated circle properties
  const recoveryCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - recoveryProgress.value),
  }));

  const calorieCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - Math.min(1, activeCaloriesProgress.value)),
  }));

  // Determine recovery state color
  const getRecoveryColor = (score: number) => {
    if (score >= 67) return colors.primary; // Green / Neon Lime
    if (score >= 34) return colors.accentGold; // Yellow / Gold
    return colors.accentRed; // Red / Strain danger
  };

  const recoveryColor = getRecoveryColor(recoveryScore);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Recovery Ring Indicator Container */}
      <View style={styles.gaugeContainer}>
        <View style={styles.svgWrapper}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="recoveryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={recoveryColor} />
                <Stop offset="100%" stopColor={`${recoveryColor}aa`} />
              </LinearGradient>
              <LinearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={colors.secondary} />
                <Stop offset="100%" stopColor={`${colors.secondary}aa`} />
              </LinearGradient>
            </Defs>

            {/* Inner Ring (Active Progress / Calories) Background */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius - 12}
              stroke="#252533"
              strokeWidth={6}
              fill="transparent"
            />
            {/* Inner Ring (Active Progress / Calories) */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius - 12}
              stroke="url(#calorieGrad)"
              strokeWidth={6}
              fill="transparent"
              strokeDasharray={2 * Math.PI * (radius - 12)}
              animatedProps={calorieCircleProps}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />

            {/* Outer Ring (Recovery) Background */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#252533"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Outer Ring (Recovery) */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#recoveryGrad)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              animatedProps={recoveryCircleProps}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>

          {/* Absolute text in the center */}
          <View style={styles.centerTextContainer}>
            <Text style={[styles.centerNumber, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
              {recoveryScore}%
            </Text>
            <Text style={[styles.centerLabel, { color: colors.textSecondary, fontSize: 8 }]}>
              RECUPERACIÓN
            </Text>
          </View>
        </View>

        {/* Short Metrics description */}
        <View style={styles.leftMetrics}>
          <Text style={[styles.statusTitle, { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold }]}>
            Óptimo para Entrenar
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
            Tu HRV y descanso indican que puedes tolerar alta carga hoy.
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Grid of Secondary Metrics */}
      <View style={styles.metricsGrid}>
        {/* Metric Item: Strain */}
        <View style={styles.gridItem}>
          <View style={styles.itemHeader}>
            <Zap size={14} color={colors.primary} style={styles.itemIcon} />
            <Text style={[styles.itemLabel, { color: colors.textSecondary, fontSize: typography.sizes.caption }]}>
              Carga Diaria
            </Text>
          </View>
          <Text style={[styles.itemValue, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold }]}>
            {strainScore} <Text style={{ fontSize: 10, color: colors.textSecondary }}>/ 21.0</Text>
          </Text>
        </View>

        {/* Metric Item: HRV */}
        <View style={styles.gridItem}>
          <View style={styles.itemHeader}>
            <Heart size={14} color={colors.secondary} style={styles.itemIcon} />
            <Text style={[styles.itemLabel, { color: colors.textSecondary, fontSize: typography.sizes.caption }]}>
              VFC (HRV)
            </Text>
          </View>
          <Text style={[styles.itemValue, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold }]}>
            {hrv} <Text style={{ fontSize: 10, color: colors.textSecondary }}>ms</Text>
          </Text>
        </View>

        {/* Metric Item: Calories / Progress */}
        <View style={styles.gridItem}>
          <View style={styles.itemHeader}>
            <Flame size={14} color={colors.accentRed} style={styles.itemIcon} />
            <Text style={[styles.itemLabel, { color: colors.textSecondary, fontSize: typography.sizes.caption }]}>
              Calorías
            </Text>
          </View>
          <Text style={[styles.itemValue, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold }]}>
            {caloriesBurned} <Text style={{ fontSize: 10, color: colors.textSecondary }}>kcal</Text>
          </Text>
        </View>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  svgWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
  },
  centerNumber: {
    letterSpacing: -0.5,
  },
  centerLabel: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  leftMetrics: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  statusTitle: {
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  statusSubtitle: {
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    width: '100%',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemIcon: {
    marginRight: 4,
  },
  itemLabel: {
    fontWeight: '500',
  },
  itemValue: {
    letterSpacing: -0.2,
  },
});
