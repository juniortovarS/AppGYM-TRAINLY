import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { LogOut, User, Activity, Target, Calendar, Scale, Ruler, Edit3 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '../store/useAuthStore';

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
  const { colors, typography } = useTheme();
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: 'bold' }]}>
          PERFIL
        </Text>
        <Pressable style={styles.editBtn}>
          <Edit3 size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE INFO */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }} 
              style={[styles.avatar, { borderColor: colors.border }]} 
              contentFit="cover" 
            />
            <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>Junior Tovar</Text>
          <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@juniortovars</Text>
        </View>

        {/* STATS GRID */}
        <View style={styles.statsGrid}>
          {/* Card 1: Peso */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(58, 134, 255, 0.1)' }]}>
              <Scale size={20} color="#3A86FF" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>75 <Text style={styles.statUnit}>kg</Text></Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peso actual</Text>
            </View>
          </View>

          {/* Card 2: Altura */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Ruler size={20} color={colors.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>180 <Text style={styles.statUnit}>cm</Text></Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Altura</Text>
            </View>
          </View>

          {/* Card 3: Días Entrenados */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
              <Calendar size={20} color="#34C759" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>15 <Text style={styles.statUnit}>días</Text></Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Entrenados</Text>
            </View>
          </View>

          {/* Card 4: Meta */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 69, 58, 0.1)' }]}>
              <Target size={20} color="#FF453A" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.textPrimary, fontSize: 16 }]} numberOfLines={1}>Hipertrofia</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Meta principal</Text>
            </View>
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Actividad Reciente</Text>
        </View>
        
        <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.activityIcon, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
            <Activity size={24} color={colors.primary} />
          </View>
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>Pecho y Tríceps</Text>
            <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>Ayer • 1h 15m</Text>
          </View>
          <Text style={[styles.activityVolume, { color: colors.primary }]}>3.2k kg</Text>
        </View>

        {/* SETTINGS OPTIONS */}
        <View style={styles.settingsGroup}>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingItemText, { color: colors.textPrimary }]}>Cuenta de Usuario</Text>
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingItemText, { color: colors.textPrimary }]}>Notificaciones</Text>
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingItemText, { color: colors.textPrimary }]}>Soporte</Text>
          </Pressable>
        </View>

        {/* LOGOUT */}
        <Pressable 
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutBtn, 
            { borderColor: colors.accentRed, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <LogOut size={20} color={colors.accentRed} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.accentRed, fontWeight: 'bold' }}>Cerrar Sesión</Text>
        </Pressable>
        
        <View style={{ height: 100 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    letterSpacing: 1,
  },
  editBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  proBadge: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
  },
  proBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 40 - 16) / 2, // 2 columns
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    opacity: 0.7,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 13,
  },
  activityVolume: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsGroup: {
    marginBottom: 32,
  },
  settingItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 16,
  }
});
