import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { User, Award, ShieldAlert, Settings, Bell, CircleCheck, LogOut } from 'lucide-react-native';

import { useActivityStore } from '../store/useActivityStore';

export const ProfileScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { user, logout } = useAuthStore();
  const { workoutHistory, metrics } = useActivityStore();

  const [isMetric, setIsMetric] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Level progress animation parameters
  const xpCurrent = user?.xp || 4250;
  const xpTarget = 5000;
  const progressRatio = xpCurrent / xpTarget;

  const xpProgress = useSharedValue(0);

  useEffect(() => {
    xpProgress.value = withDelay(400, withSpring(progressRatio, { damping: 15 }));
  }, [progressRatio]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${xpProgress.value * 100}%`,
  }));

  const achievements = [
    { title: 'Consistencia', desc: 'Racha 7-días', icon: 'CircleCheck', unlocked: true },
    { title: 'Hierro Puro', desc: 'Entrenamiento Completado', icon: 'Award', unlocked: workoutHistory.length > 0 },
    { title: 'Élite', desc: '3+ Ejercicios Loggeados', icon: 'Award', unlocked: workoutHistory.some(w => w.exercises.length >= 3) },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Title Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold }]}>
          Perfil de Atleta
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
          Monitorea tus metas y configuración personal
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(212, 175, 55, 0.08)', borderColor: colors.primary }]}>
              <User size={36} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold }]}>
                {user?.name || 'Alex Rivera'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                {user?.email || 'alex@trainly.io'}
              </Text>
              <View style={[styles.targetBadge, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
                <Text style={[styles.targetBadgeText, { color: colors.primary, fontSize: 10, fontWeight: '700' }]}>
                  META: {user?.target.toUpperCase() || 'RENDIMIENTO'}
                </Text>
              </View>
            </View>
          </View>

          {/* Real-time Stats Row */}
          <View style={[styles.statsDashboardRow, { borderColor: colors.border }]}>
            <View style={styles.statsDashboardItem}>
              <Text style={[styles.statsVal, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: '800' }]}>
                {workoutHistory.length}
              </Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary, fontSize: 10 }]}>Sesiones</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsDashboardItem}>
              <Text style={[styles.statsVal, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: '800' }]}>
                {metrics.activeTime}
              </Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary, fontSize: 10 }]}>Min Activos</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statsDashboardItem}>
              <Text style={[styles.statsVal, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: '800' }]}>
                {metrics.caloriesBurned}
              </Text>
              <Text style={[styles.statsLabel, { color: colors.textSecondary, fontSize: 10 }]}>Kcal</Text>
            </View>
          </View>

          {/* Gamification Level-Up Bar */}
          <View style={[styles.xpSection, { borderTopColor: colors.border }]}>
            <View style={styles.xpTextRow}>
              <Text style={[styles.xpLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold }]}>
                Nivel {user?.level || 12}
              </Text>
              <Text style={[styles.xpValues, { color: colors.textPrimary, fontSize: typography.sizes.xs }]}>
                {xpCurrent} <Text style={{ color: colors.textSecondary }}>/ {xpTarget} XP</Text>
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.cardElevated }]}>
              <Animated.View style={[styles.progressBarFill, { backgroundColor: colors.primary }, progressStyle]} />
            </View>
          </View>
        </MotiView>

        {/* Achievements Section */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginBottom: 12 }]}>
            Logros Desbloqueados
          </Text>
          <View style={styles.achievementsRow}>
            {achievements.map((item, idx) => {
              const activeColor = item.unlocked ? colors.primary : colors.textMuted;
              return (
                <View 
                  key={idx} 
                  style={[
                    styles.achievementCard, 
                    { 
                      backgroundColor: colors.card, 
                      borderColor: colors.border,
                      opacity: item.unlocked ? 1 : 0.6 
                    }
                  ]}
                >
                  <View style={[styles.achievementIconBg, { backgroundColor: item.unlocked ? 'rgba(212, 175, 55, 0.08)' : 'rgba(99, 99, 102, 0.05)' }]}>
                    {item.icon === 'CircleCheck' ? (
                      <CircleCheck size={20} color={activeColor} />
                    ) : (
                      <Award size={20} color={activeColor} />
                    )}
                  </View>
                  <Text style={[styles.achievementName, { color: colors.textPrimary, fontSize: 11, fontWeight: '700' }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: colors.textSecondary, fontSize: 9 }]}>
                    {item.desc}
                  </Text>
                </View>
              );
            })}
          </View>
        </MotiView>

        {/* Configuration settings list */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.sectionContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginBottom: 12 }]}>
            Configuración de Atleta
          </Text>
          <View style={[styles.settingsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            {/* Setting: Units system */}
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Settings size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <View>
                  <Text style={[styles.settingName, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '500' }]}>
                    Sistema Métrico (kg)
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: typography.sizes.caption }]}>
                    Usar kilogramos y kilómetros
                  </Text>
                </View>
              </View>
              <Switch
                value={isMetric}
                onValueChange={setIsMetric}
                trackColor={{ false: colors.cardElevated, true: 'rgba(212, 175, 55, 0.4)' }}
                thumbColor={isMetric ? colors.primary : colors.textSecondary}
              />
            </View>

            {/* Setting: Notifications */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <View>
                  <Text style={[styles.settingName, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: '500' }]}>
                    Notificaciones de Coach
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: typography.sizes.caption }]}>
                    Consejos diarios sobre carga y recuperación
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.cardElevated, true: 'rgba(212, 175, 55, 0.4)' }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
              />
            </View>

          </View>
        </MotiView>

        {/* Logout button */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.logoutWrapper}
        >
          <Pressable 
            onPress={logout} 
            style={({ pressed }) => [
              styles.logoutBtn, 
              { 
                borderColor: colors.accentRed,
                backgroundColor: pressed ? 'rgba(255, 59, 48, 0.05)' : 'transparent' 
              }
            ]}
          >
            <LogOut size={18} color={colors.accentRed} style={{ marginRight: 8 }} />
            <Text style={[styles.logoutBtnText, { color: colors.accentRed, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
              Cerrar Sesión
            </Text>
          </Pressable>
        </MotiView>

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
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.8,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  profileEmail: {
    marginBottom: 8,
  },
  targetBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  targetBadgeText: {
    letterSpacing: 0.5,
  },
  statsDashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 14,
    marginVertical: 16,
  },
  statsDashboardItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsDivider: {
    width: 1,
    height: 24,
  },
  statsVal: {},
  statsLabel: {
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpSection: {
    borderTopWidth: 1,
    borderTopColor: '#252533',
    paddingTop: 16,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpLabel: {
    letterSpacing: 0.2,
  },
  xpValues: {
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpPrompt: {},
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  achievementIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementName: {
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDesc: {
    textAlign: 'center',
  },
  settingsList: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingName: {},
  settingDesc: {
    marginTop: 2,
  },
  logoutWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    width: '100%',
  },
  logoutBtnText: {},
});
