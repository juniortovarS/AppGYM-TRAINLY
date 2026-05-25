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
import { Users, Layout, Shield, ArrowRight, RefreshCw, Layers } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AdminDashboard'>;

interface AdminDashboardScreenProps {
  navigation: AdminDashboardScreenNavigationProp;
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
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const { logout, user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'stats' | 'designs' | 'users'>('stats');
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
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

      if (data) {
        const typedData = data as ProfileRow[];
        setProfiles(typedData);
        
        // Calculate basic statistics
        const total = typedData.length;
        const totalWeight = typedData.reduce((acc, p) => acc + (p.weight || 70), 0);
        const avgW = total > 0 ? Math.round(totalWeight / total) : 70;
        
        const targetsCount = { Fuerza: 0, Masa: 0, Grasa: 0, Rendimiento: 0 };
        typedData.forEach(p => {
          const t = p.target || '';
          if (t.includes('Fuerza') || t.includes('Hipertrofia')) targetsCount.Fuerza++;
          else if (t.includes('Masa') || t.includes('Volumen')) targetsCount.Masa++;
          else if (t.includes('Grasa') || t.includes('Pérdida')) targetsCount.Grasa++;
          else targetsCount.Rendimiento++;
        });

        setStats({
          totalUsers: total,
          avgWeight: avgW,
          targets: targetsCount,
        });
      }
    } catch (err) {
      console.error('Error fetching admin profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfilesData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const renderStats = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Stat Cards Row */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Users size={20} color={colors.primary} />
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>USUARIOS TOTALES</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.sizes.xl }]}>
            {loadingProfiles ? <ActivityIndicator size="small" color="#fff" /> : stats.totalUsers}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Layers size={20} color={colors.primary} />
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>PESO PROMEDIO</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: typography.sizes.xl }]}>
            {stats.avgWeight} kg
          </Text>
        </View>
      </View>

      {/* Target Goals breakdown */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: typography.sizes.md }]}>
        Distribución de Objetivos
      </Text>
      
      <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {Object.entries(stats.targets).map(([key, val]) => {
          const percentage = stats.totalUsers > 0 ? (val / stats.totalUsers) * 100 : 0;
          return (
            <View key={key} style={styles.chartRow}>
              <View style={styles.chartLabelRow}>
                <Text style={{ color: colors.textPrimary, fontSize: typography.sizes.sm }}>{key}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                  {val} ({Math.round(percentage)}%)
                </Text>
              </View>
              <View style={[styles.barBackground, { backgroundColor: '#1C1C24' }]}>
                <View style={[styles.barFill, { backgroundColor: colors.primary, width: `${Math.max(5, percentage)}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Database sync status */}
      <View style={[styles.syncBox, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
          Conectado a la base de datos en tiempo real de Supabase.
        </Text>
        <Pressable onPress={fetchProfilesData} style={styles.syncBtn}>
          <RefreshCw size={14} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: typography.sizes.xs, marginLeft: 6 }}>Recargar</Text>
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
        <View style={[styles.colorBlock, { backgroundColor: colors.primary }]}>
          <Text style={[styles.colorBlockText, { color: '#000' }]}>Primary</Text>
          <Text style={[styles.colorBlockSub, { color: '#000' }]}>{colors.primary}</Text>
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
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={[styles.userRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}>
                  {item.name}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                  {item.email}
                </Text>
              </View>
              <View style={styles.userBadgeContainer}>
                <View style={[styles.targetBadge, { backgroundColor: '#1C1C24' }]}>
                  <Text style={[styles.targetBadgeText, { color: colors.primary, fontSize: typography.sizes.xs }]}>
                    {item.target || 'Rendimiento'}
                  </Text>
                </View>
                <Text style={[styles.userWeightText, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                  {item.weight} kg
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <Shield size={22} color={colors.primary} />
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold }]}>
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
          style={[styles.clientViewBtn, { backgroundColor: colors.primary }]}
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
            { borderBottomColor: activeTab === 'stats' ? colors.primary : 'transparent' }
          ]}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'stats' ? colors.primary : colors.textSecondary,
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
            { borderBottomColor: activeTab === 'designs' ? colors.primary : 'transparent' }
          ]}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'designs' ? colors.primary : colors.textSecondary,
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
            { borderBottomColor: activeTab === 'users' ? colors.primary : 'transparent' }
          ]}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'users' ? colors.primary : colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: activeTab === 'users' ? typography.weights.bold : typography.weights.regular
            }
          ]}>
            Base de Datos
          </Text>
        </Pressable>
      </View>

      {/* Render active content */}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'designs' && renderDesigns()}
      {activeTab === 'users' && renderUsers()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        paddingTop: 20,
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
  title: {
    marginLeft: 10,
    letterSpacing: 1,
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
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
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
    marginBottom: 6,
  },
  targetBadgeText: {
    fontWeight: '500',
  },
  userWeightText: {
    fontWeight: 'bold',
  },
});
