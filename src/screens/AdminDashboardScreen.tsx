import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { AnimatedButton } from '../components/AnimatedButton';
import { 
  Users, 
  Layout, 
  Shield, 
  ArrowRight, 
  RefreshCw, 
  Layers,
  ChevronLeft,
  X,
  Dumbbell,
  Flame,
  Activity,
  TrendingUp
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminDashboard'>;

interface AdminDashboardScreenProps {
  navigation: AdminDashboardScreenNavigationProp;
}

interface WorkoutTimelineEntry {
  date: string;
  title: string;
  category: string;
  duration: number;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  weight: number;
  target: string;
  level: number;
  xp: number;
  created_at?: string;
  // Progress additions
  workoutsCompleted: number;
  activeMinutesThisWeek: number;
  caloriesBurnedThisWeek: number;
  workoutTimeline: WorkoutTimelineEntry[];
}

// Stagger wrappers for Web animations
const UserCardWrapper = ({ children, index, style }: { children: any; index: number; style: any }) => {
  if (Platform.OS === 'web') {
    const WebCard = View as any;
    return (
      <WebCard className="user-card-anim" style={[style, { opacity: 0 }]}>
        {children}
      </WebCard>
    );
  }
  const { MotiView } = require('moti');
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: Math.min(index * 60, 600) }}
      style={style}
    >
      {children}
    </MotiView>
  );
};

const StatCardWrapper = ({ children, style }: any) => {
  if (Platform.OS === 'web') {
    const WebCard = View as any;
    return (
      <WebCard className="stat-card-anim" style={[style, { opacity: 0 }]}>
        {children}
      </WebCard>
    );
  }
  return (
    <View style={style}>
      {children}
    </View>
  );
};

const ChartRowWrapper = ({ children, style }: any) => {
  if (Platform.OS === 'web') {
    const WebRow = View as any;
    return (
      <WebRow className="chart-row-anim" style={[style, { opacity: 0 }]}>
        {children}
      </WebRow>
    );
  }
  return (
    <View style={style}>
      {children}
    </View>
  );
};

// Details Drawer Component
interface DetailDrawerProps {
  user: ProfileRow;
  onClose: () => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ user, onClose }) => {
  const { colors, spacing, typography } = useTheme();
  
  const xpPercent = Math.min(100, Math.round((user.xp % 1000) / 10));

  const handleClose = () => {
    if (Platform.OS === 'web') {
      try {
        const { gsap } = require('gsap');
        gsap.to('.drawer-backdrop', { opacity: 0, duration: 0.2 });
        gsap.to('.admin-detail-drawer', { 
          xPercent: 100, 
          duration: 0.25, 
          ease: 'power2.in',
          onComplete: onClose 
        });
      } catch (e) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const { gsap } = require('gsap');
        gsap.fromTo('.drawer-backdrop', { opacity: 0 }, { opacity: 0.6, duration: 0.25 });
        gsap.fromTo('.admin-detail-drawer', 
          { xPercent: 100 }, 
          { xPercent: 0, duration: 0.35, ease: 'power2.out' }
        );
      } catch (e) {}
    }
  }, []);

  const DrawerHeader = () => (
    <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }}>{user.name}</Text>
        <Text style={{ color: '#8E8E93', fontSize: 12, marginTop: 2 }}>{user.email}</Text>
      </View>
      <Pressable onPress={handleClose} style={styles.drawerCloseBtn}>
        <X size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  const DrawerBody = () => (
    <View style={{ paddingBottom: 40 }}>
      {/* Rank and XP */}
      <View style={[styles.drawerRankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Shield size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>
              NIVEL {user.level}
            </Text>
          </View>
          <Text style={{ color: '#8E8E93', fontSize: 11 }}>
            {user.xp % 1000} / 1000 XP
          </Text>
        </View>
        
        <View style={[styles.progressBarContainer, { backgroundColor: '#1C1C24' }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: '#FFFFFF', 
                width: `${xpPercent}%`,
                shadowColor: '#FFFFFF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 5,
              }
            ]} 
          />
        </View>
      </View>

      {/* Metrics Grid */}
      <Text style={[styles.drawerSectionTitle, { color: colors.textPrimary }]}>PROGRESO FÍSICO</Text>
      <View style={styles.drawerStatsGrid}>
        <View style={[styles.drawerStatMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Dumbbell size={16} color="#FFFFFF" style={{ marginBottom: 6 }} />
          <Text style={{ color: '#8E8E93', fontSize: 10 }}>WORKOUTS</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>
            {user.workoutsCompleted} completados
          </Text>
        </View>

        <View style={[styles.drawerStatMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Layers size={16} color="#FFFFFF" style={{ marginBottom: 6 }} />
          <Text style={{ color: '#8E8E93', fontSize: 10 }}>PESO ACTUAL</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>
            {user.weight} kg
          </Text>
        </View>

        <View style={[styles.drawerStatMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Activity size={16} color="#FFFFFF" style={{ marginBottom: 6 }} />
          <Text style={{ color: '#8E8E93', fontSize: 10 }}>TIEMPO ACTIVO</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>
            {user.activeMinutesThisWeek} min / sem
          </Text>
        </View>

        <View style={[styles.drawerStatMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Flame size={16} color="#FFFFFF" style={{ marginBottom: 6 }} />
          <Text style={{ color: '#8E8E93', fontSize: 10 }}>CALORÍAS</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>
            {user.caloriesBurnedThisWeek} kcal
          </Text>
        </View>
      </View>

      <View style={[styles.drawerTargetBox, { backgroundColor: '#111115', borderColor: colors.border }]}>
        <TrendingUp size={16} color={colors.primary} style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#8E8E93', fontSize: 10 }}>OBJETIVO DE ENTRENAMIENTO</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>{user.target}</Text>
        </View>
      </View>

      {/* Workout Timeline */}
      <Text style={[styles.drawerSectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>
        HISTORIAL DE ENTRENAMIENTOS
      </Text>
      
      {user.workoutTimeline && user.workoutTimeline.length > 0 ? (
        user.workoutTimeline.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLineContainer}>
              <View style={[styles.timelineDot, { backgroundColor: '#FFFFFF' }]} />
              {index < user.workoutTimeline.length - 1 && (
                <View style={[styles.timelineVerticalLine, { backgroundColor: colors.border }]} />
              )}
            </View>
            <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.timelineCardHeader}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: '#8E8E93', fontSize: 10, marginLeft: 4 }}>{item.date}</Text>
              </View>
              <View style={styles.timelineCardMeta}>
                <Text style={{ color: '#8E8E93', fontSize: 10 }}>{item.duration} min • {item.category}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <Text style={{ color: '#8E8E93', fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 10 }}>
          Sin entrenamientos registrados esta semana.
        </Text>
      )}
    </View>
  );

  if (Platform.OS === 'web') {
    const WebDrawer = View as any;
    const WebBackdrop = Pressable as any;
    
    return (
      <View style={styles.drawerOverlay} pointerEvents="auto">
        <WebBackdrop className="drawer-backdrop" style={styles.drawerBackdrop} onPress={handleClose} />
        <WebDrawer className="admin-detail-drawer" style={[styles.drawerContent, { backgroundColor: '#09090C', borderColor: colors.border }]}>
          <DrawerHeader />
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <DrawerBody />
          </ScrollView>
        </WebDrawer>
      </View>
    );
  }

  const { MotiView } = require('moti');
  return (
    <View style={styles.drawerOverlay} pointerEvents="auto">
      <Pressable style={styles.drawerBackdrop} onPress={handleClose} />
      <MotiView
        from={{ translateY: 700 }}
        animate={{ translateY: 0 }}
        exit={{ translateY: 700 }}
        transition={{ type: 'timing', duration: 300 }}
        style={[styles.nativeDrawerContent, { backgroundColor: '#09090C', borderColor: colors.border }]}
      >
        <DrawerHeader />
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <DrawerBody />
        </ScrollView>
      </MotiView>
    </View>
  );
};

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const { logout, user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'stats' | 'designs' | 'users'>('stats');
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileRow | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    avgWeight: 70,
    targets: {
      Fuerza: 0,
      Masa: 0,
      Grasa: 0,
      Rendimiento: 0,
    }
  });

  const fetchProfilesData = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Mock users loaded with fitness progress metrics
      const mockUsers: ProfileRow[] = [
        {
          id: 'mock-1',
          name: 'Eduardo Valenzuela',
          email: 'eduardo.val@trainly.com',
          weight: 78,
          target: 'Ganar Masa Muscular',
          level: 8,
          xp: 850,
          workoutsCompleted: 34,
          activeMinutesThisWeek: 310,
          caloriesBurnedThisWeek: 2150,
          workoutTimeline: [
            { date: 'Ayer', title: 'Rutina Tirón (Espalda/Bíceps)', category: 'Hipertrofia', duration: 55 },
            { date: 'Hace 3 días', title: 'Rutina Empuje (Pecho/Hombro)', category: 'Fuerza', duration: 50 },
            { date: 'Hace 5 días', title: 'Rutina de Piernas Completa', category: 'Hipertrofia', duration: 65 },
          ]
        },
        {
          id: 'mock-2',
          name: 'Camila Rojas',
          email: 'camila.rojas@gmail.com',
          weight: 62,
          target: 'Pérdida de Grasa',
          level: 5,
          xp: 420,
          workoutsCompleted: 19,
          activeMinutesThisWeek: 240,
          caloriesBurnedThisWeek: 1680,
          workoutTimeline: [
            { date: 'Hoy', title: 'Cardio HIIT & Core', category: 'Resistencia', duration: 35 },
            { date: 'Hace 2 días', title: 'Acondicionamiento Físico', category: 'Funcional', duration: 40 },
            { date: 'Hace 4 días', title: 'Pierna y Glúteo - Fuerza', category: 'Fuerza', duration: 50 },
          ]
        },
        {
          id: 'mock-3',
          name: 'Diego Torres',
          email: 'diego.t94@outlook.com',
          weight: 85,
          target: 'Aumento de Fuerza',
          level: 2,
          xp: 180,
          workoutsCompleted: 7,
          activeMinutesThisWeek: 110,
          caloriesBurnedThisWeek: 750,
          workoutTimeline: [
            { date: 'Hace 3 días', title: 'Rutina Fuerza A (Sentadilla/Banca)', category: 'Fuerza', duration: 60 },
            { date: 'Hace 6 días', title: 'Acondicionamiento General', category: 'Funcional', duration: 45 },
          ]
        },
        {
          id: 'mock-4',
          name: 'Sofía Bennett',
          email: 'sofia.bennett@gmail.com',
          weight: 58,
          target: 'Rendimiento Atlético',
          level: 12,
          xp: 1350,
          workoutsCompleted: 78,
          activeMinutesThisWeek: 420,
          caloriesBurnedThisWeek: 3100,
          workoutTimeline: [
            { date: 'Ayer', title: 'Levantamiento Olímpico', category: 'Fuerza', duration: 75 },
            { date: 'Hace 2 días', title: 'Entrenamiento de Velocidad', category: 'Rendimiento', duration: 60 },
            { date: 'Hace 4 días', title: 'Pecho y Tríceps - Hipertrofia', category: 'Hipertrofia', duration: 50 },
          ]
        }
      ];

      let combined = [...mockUsers];

      if (data && data.length > 0) {
        // Map database profiles and decorate them with progress parameters
        const dbUsers = (data as any[]).map(dbUser => {
          const workouts = Math.max(1, Math.round((dbUser.xp || 100) / 90));
          return {
            id: dbUser.id,
            name: dbUser.name || 'Usuario de Trainly',
            email: dbUser.email || 'usuario@trainly.com',
            weight: dbUser.weight || 70,
            target: dbUser.target || 'Rendimiento',
            level: dbUser.level || 1,
            xp: dbUser.xp || 100,
            created_at: dbUser.created_at,
            workoutsCompleted: workouts,
            activeMinutesThisWeek: workouts * 45,
            caloriesBurnedThisWeek: workouts * 285,
            workoutTimeline: [
              { date: 'Hace 2 días', title: 'Entrenamiento General', category: dbUser.target || 'Rendimiento', duration: 45 },
              { date: 'Hace 5 días', title: 'Acondicionamiento Físico', category: 'Acondicionamiento', duration: 40 }
            ]
          };
        });
        
        // Merge database profiles and mock profiles, removing matching emails
        combined = [...dbUsers, ...mockUsers.filter(m => !dbUsers.some(db => db.email === m.email))];
      }

      setProfiles(combined);
      
      // Calculate dynamic statistics based on combined dataset
      const total = combined.length;
      const totalWeight = combined.reduce((acc, p) => acc + (p.weight || 70), 0);
      const avgW = total > 0 ? Math.round(totalWeight / total) : 70;
      
      const targetsCount = { Fuerza: 0, Masa: 0, Grasa: 0, Rendimiento: 0 };
      combined.forEach(p => {
        const t = p.target || '';
        if (t.includes('Fuerza') || t.includes('Hipertrofia')) targetsCount.Fuerza++;
        else if (t.includes('Masa') || t.includes('Volumen') || t.includes('Muscular')) targetsCount.Masa++;
        else if (t.includes('Grasa') || t.includes('Pérdida')) targetsCount.Grasa++;
        else targetsCount.Rendimiento++;
      });

      setStats({
        totalUsers: total,
        avgWeight: avgW,
        targets: targetsCount,
      });
    } catch (err) {
      console.error('Error fetching admin profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfilesData();
  }, []);

  // Web GSAP trigger on tab changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const { gsap } = require('gsap');
        if (activeTab === 'users' && profiles.length > 0) {
          gsap.fromTo('.user-card-anim', 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
          );
        } else if (activeTab === 'stats') {
          gsap.fromTo('.stat-card-anim',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
          );
          gsap.fromTo('.chart-row-anim',
            { opacity: 0, x: -15 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
          );
        }
      } catch (e) {
        console.warn('GSAP animation error:', e);
      }
    }
  }, [activeTab, profiles.length]);

  const handleLogout = async () => {
    await logout();
  };

  const renderStats = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Stat Cards Row */}
      <View style={styles.statsGrid}>
        <StatCardWrapper style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Users size={20} color="#FFFFFF" />
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>USUARIOS REGISTRADOS</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.sizes.xl }]}>
            {loadingProfiles ? <ActivityIndicator size="small" color="#fff" /> : stats.totalUsers}
          </Text>
        </StatCardWrapper>

        <StatCardWrapper style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Layers size={20} color="#FFFFFF" />
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>PESO PROMEDIO</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.sizes.xl }]}>
            {stats.avgWeight} kg
          </Text>
        </StatCardWrapper>
      </View>

      {/* Target Goals breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md }]}>
        Distribución de Objetivos
      </Text>
      
      <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {Object.entries(stats.targets).map(([key, val]) => {
          const percentage = stats.totalUsers > 0 ? (val / stats.totalUsers) * 100 : 0;
          return (
            <ChartRowWrapper key={key} style={styles.chartRow}>
              <View style={styles.chartLabelRow}>
                <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.sm }}>{key}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                  {val} ({Math.round(percentage)}%)
                </Text>
              </View>
              <View style={[styles.barBackground, { backgroundColor: '#1C1C24' }]}>
                <View style={[styles.barFill, { backgroundColor: '#FFFFFF', width: `${Math.max(5, percentage)}%` }]} />
              </View>
            </ChartRowWrapper>
          );
        })}
      </View>

      {/* Database sync status */}
      <View style={[styles.syncBox, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
          Conectado a la base de datos en tiempo real de Supabase.
        </Text>
        <Pressable onPress={fetchProfilesData} style={styles.syncBtn}>
          <RefreshCw size={14} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: typography.sizes.xs, marginLeft: 6 }}>Recargar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderDesigns = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md }]}>
        Esquema de Colores (Theme Tokens)
      </Text>
      
      <View style={styles.themeGrid}>
        <View style={[styles.colorBlock, { backgroundColor: colors.background }]}>
          <Text style={styles.colorBlockText}>Background</Text>
          <Text style={styles.colorBlockSub}>{colors.background}</Text>
        </View>
        <View style={[styles.colorBlock, { backgroundColor: colors.card }]}>
          <Text style={styles.colorBlockText}>Card</Text>
          <Text style={styles.colorBlockSub}>{colors.card}</Text>
        </View>
        <View style={[styles.colorBlock, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.colorBlockText, { color: '#000' }]}>Primary</Text>
          <Text style={[styles.colorBlockSub, { color: '#000' }]}>#FFFFFF</Text>
        </View>
        <View style={[styles.colorBlock, { backgroundColor: colors.border }]}>
          <Text style={styles.colorBlockText}>Border</Text>
          <Text style={styles.colorBlockSub}>{colors.border}</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, marginTop: 24 }]}>
        Componente: AnimatedButton
      </Text>

      <View style={styles.buttonShowcase}>
        <View style={styles.buttonShowcaseItem}>
          <Text style={[styles.showcaseLabel, { color: colors.textSecondary }]}>PRIMARY LARGE</Text>
          <AnimatedButton title="Iniciar Sesión" variant="primary" size="lg" onPress={() => {}} />
        </View>

        <View style={styles.buttonShowcaseItem}>
          <Text style={[styles.showcaseLabel, { color: colors.textSecondary }]}>OUTLINE LARGE</Text>
          <AnimatedButton title="Continuar con Google" variant="outline" size="lg" onPress={() => {}} />
        </View>

        <View style={styles.buttonShowcaseItem}>
          <Text style={[styles.showcaseLabel, { color: colors.textSecondary }]}>SECONDARY MEDIUM</Text>
          <AnimatedButton title="Registrarse" variant="secondary" size="md" onPress={() => {}} />
        </View>

        <View style={styles.buttonShowcaseItem}>
          <Text style={[styles.showcaseLabel, { color: colors.textSecondary }]}>LOADING STATE</Text>
          <AnimatedButton title="Cargando" variant="primary" size="lg" loading={true} onPress={() => {}} />
        </View>
      </View>
    </ScrollView>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      {loadingProfiles && profiles.length === 0 ? (
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item, index }) => (
            <UserCardWrapper index={index} style={{ marginBottom: 12 }}>
              <Pressable
                onPress={() => setSelectedUser(item)}
                style={({ pressed }) => [
                  styles.userRow, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1
                  }
                ]}
              >
                <View style={styles.userInfo}>
                  <Text style={[styles.userNameText, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                    {item.email}
                  </Text>
                </View>
                
                <View style={styles.userBadgeContainer}>
                  <View style={[styles.targetBadge, { backgroundColor: '#1C1C24' }]}>
                    <Text style={[styles.targetBadgeText, { color: '#FFFFFF', fontSize: 10 }]}>
                      {item.target || 'Rendimiento'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Shield size={10} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.userWeightText, { color: colors.textSecondary, fontSize: 10 }]}>
                      Nivel {item.level} • {item.weight} kg
                    </Text>
                  </View>
                </View>
              </Pressable>
            </UserCardWrapper>
          )}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Bidirectional Back arrow */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <Pressable 
            onPress={() => navigation.navigate('Tabs')}
            style={({ pressed }) => [
              styles.backArrowBtn,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Shield size={18} color="#FFFFFF" style={{ marginRight: 8, marginLeft: 4 }} />
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, marginLeft: 0 }]}>
            ADMIN PANEL
          </Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{ color: colors.accentRed, fontSize: typography.sizes.sm }}>Salir</Text>
        </Pressable>
      </View>

      {/* Quick Navigation Banner */}
      <View style={[styles.navigationBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.bannerInfo}>
          <Text style={[styles.bannerTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}>
            Vista de Administrador
          </Text>
          <Text style={[styles.bannerSub, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
            Estás visualizando como: {user?.email}
          </Text>
        </View>
        <Pressable 
          onPress={() => navigation.navigate('Tabs')}
          style={({ pressed }) => [
            styles.clientViewBtn, 
            { backgroundColor: '#FFFFFF', opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Text style={[styles.clientViewBtnText, { fontSize: typography.sizes.xs }]}>Ver App</Text>
          <ArrowRight size={14} color="#000" style={{ marginLeft: 4 }} />
        </Pressable>
      </View>

      {/* Custom Tab Selector */}
      <View style={styles.tabSelector}>
        <Pressable
          onPress={() => setActiveTab('stats')}
          style={[
            styles.tabItem,
            { borderBottomColor: activeTab === 'stats' ? '#FFFFFF' : 'transparent' }
          ]}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'stats' ? '#FFFFFF' : colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: activeTab === 'stats' ? typography.weights.bold : typography.weights.regular
            }
          ]}>
            Estadísticas
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('designs')}
          style={[
            styles.tabItem,
            { borderBottomColor: activeTab === 'designs' ? '#FFFFFF' : 'transparent' }
          ]}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'designs' ? '#FFFFFF' : colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: activeTab === 'designs' ? typography.weights.bold : typography.weights.regular
            }
          ]}>
            Diseños
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('users')}
          style={[
            styles.tabItem,
            { borderBottomColor: activeTab === 'users' ? '#FFFFFF' : 'transparent' }
          ]}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'users' ? '#FFFFFF' : colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: activeTab === 'users' ? typography.weights.bold : typography.weights.regular
            }
          ]}>
            Usuarios (Progreso)
          </Text>
        </Pressable>
      </View>

      {/* Render active content */}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'designs' && renderDesigns()}
      {activeTab === 'users' && renderUsers()}

      {/* Details Drawer Overlay */}
      {selectedUser && (
        <DetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        paddingTop: 10,
      }
    })
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrowBtn: {
    padding: 6,
    marginRight: 6,
    marginLeft: -6,
  },
  title: {
    letterSpacing: 0.5,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navigationBanner: {
    marginVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontWeight: 'bold',
  },
  bannerSub: {
    marginTop: 2,
  },
  clientViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  clientViewBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabText: {
    letterSpacing: 0.5,
  },
  tabContent: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statLabel: {
    marginTop: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statValue: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  chartRow: {
    marginBottom: 16,
  },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorBlock: {
    width: '48%',
    height: 80,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'flex-end',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  colorBlockText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  colorBlockSub: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  buttonShowcase: {
    padding: 16,
  },
  buttonShowcaseItem: {
    marginBottom: 24,
  },
  showcaseLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  userInfo: {
    flex: 1,
  },
  userNameText: {
    fontWeight: 'bold',
  },
  userEmail: {
    marginTop: 2,
  },
  userBadgeContainer: {
    alignItems: 'flex-end',
  },
  targetBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  targetBadgeText: {
    fontWeight: '500',
  },
  userWeightText: {
    fontWeight: 'bold',
  },
  // Details Drawer Styles
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawerContent: {
    width: 420,
    height: '100%',
    borderLeftWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  nativeDrawerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  drawerCloseBtn: {
    padding: 6,
    marginRight: -6,
  },
  drawerRankCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  drawerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  drawerStatMiniCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  drawerTargetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  drawerSectionTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 12,
    letterSpacing: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLineContainer: {
    width: 16,
    alignItems: 'center',
    position: 'relative',
    marginRight: 6,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 16,
  },
  timelineVerticalLine: {
    position: 'absolute',
    top: 22,
    bottom: -16,
    width: 1,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineCardMeta: {
    flexDirection: 'row',
  },
});
