import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof LucideIcons;
  color?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'accent';
  subtitle?: string;
  index?: number; // For staggered entrance delay
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  trend,
  trendType = 'neutral',
  subtitle,
  index = 0,
  onPress,
}) => {
  const { colors, spacing, typography } = useTheme();
  
  // Dynamic icon selection
  const IconComponent = LucideIcons[icon] as React.ComponentType<any>;
  const activeColor = color || colors.primary;
  
  const cardContent = (
    <View style={[styles.card, { borderColor: colors.border }]}>
      {/* Icon & Title Row */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${activeColor}15` }]}>
          {IconComponent && <IconComponent size={20} color={activeColor} />}
        </View>
        <Text style={[styles.title, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
          {title}
        </Text>
      </View>
      
      {/* Value Row */}
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: colors.textPrimary, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold }]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unit, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
            {' '}{unit}
          </Text>
        )}
      </View>
      
      {/* Footer (Trend / Subtitle) */}
      {(trend || subtitle) && (
        <View style={styles.footer}>
          {trend ? (
            <Text 
              style={[
                styles.trend, 
                { 
                  fontSize: typography.sizes.caption,
                  color: trendType === 'positive' 
                    ? '#4CD964' 
                    : trendType === 'negative' 
                    ? colors.accentRed 
                    : trendType === 'accent'
                    ? colors.secondary
                    : colors.textSecondary
                }
              ]}
            >
              {trend}
            </Text>
          ) : (
            <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: typography.sizes.caption }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const delay = index * 100; // Stagger effect

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay }}
      style={styles.container}
    >
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
          {cardContent}
        </Pressable>
      ) : (
        cardContent
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%', // Default for two column grid
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#16161F',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    height: 125,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  value: {
    letterSpacing: -0.5,
  },
  unit: {
    fontWeight: '500',
  },
  footer: {
    marginTop: 4,
  },
  trend: {
    fontWeight: '600',
  },
  subtitle: {
    fontWeight: '400',
  },
});
