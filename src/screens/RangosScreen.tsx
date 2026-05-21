import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Settings, ChevronDown, ChevronRight, Flame } from 'lucide-react-native';
import { Image } from 'expo-image';
import { AnatomyHeatmap } from '../components/AnatomyHeatmap';

const { width } = Dimensions.get('window');

export const RangosScreen: React.FC = () => {
  const { colors, typography } = useTheme();
  const [activeTab, setActiveTab] = useState('Rangos');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#050508' }]}>
      
      {/* HEADER LOGO & ACTIONS */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TRAINLY</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={16} color="#A0A0A0" />
            <Text style={styles.streakText}>0</Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <Settings size={22} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {/* TOP TABS */}
      <View style={styles.tabsRow}>
        <Pressable onPress={() => setActiveTab('Rangos')} style={[styles.tabBtn, activeTab === 'Rangos' && styles.activeTabBtn]}>
          <Text style={[styles.tabText, activeTab === 'Rangos' ? styles.activeTabText : styles.inactiveTabText]}>Rangos</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('Estadísticas')} style={[styles.tabBtn, activeTab === 'Estadísticas' && styles.activeTabBtn]}>
          <Text style={[styles.tabText, activeTab === 'Estadísticas' ? styles.activeTabText : styles.inactiveTabText]}>Estadísticas</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* RANKING ALERT */}
        <View style={styles.rankAlert}>
          <Text style={styles.rankAlertText}>Eres parte del top 67% más fuerte</Text>
        </View>

        {/* 3D HEATMAP SVG */}
        <AnatomyHeatmap chestIntensity={0.9} bicepsIntensity={0.6} />

        {/* RANKINGS MUSCULARES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rankings Musculares</Text>
        </View>

        {/* CARD 1: Brazos */}
        <Pressable style={styles.rankingCard}>
          <View style={styles.cardIconWrapper}>
            {/* Using a placeholder since we don't have the exact hexagon asset */}
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=150&auto=format&fit=crop' }} 
              style={styles.hexagonIcon}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Brazos</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.cardSubtitle}>BRONZE II</Text>
              <Text style={styles.cardDot}> • </Text>
              <Text style={styles.cardSubtitle}>2/3</Text>
            </View>
          </View>
          <ChevronDown size={20} color="#8E8E93" />
        </Pressable>

        {/* CARD 2: Desafío Inicial */}
        <Pressable style={styles.challengeCard}>
          <View style={styles.circleProgress}>
            <Text style={styles.progressText}>50%</Text>
          </View>
          <View style={styles.challengeContent}>
            <Text style={styles.challengeTitle}>Desafío Inicial</Text>
            <Text style={styles.challengeAction}>Activa las notificaciones push</Text>
          </View>
          <ChevronRight size={20} color="#8E8E93" />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  inactiveTabText: {
    color: '#8E8E93',
  },
  scrollContent: {
    paddingTop: 20,
  },
  rankAlert: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#B8860B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(184, 134, 11, 0.05)',
  },
  rankAlertText: {
    color: '#CDBA96',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  hexagonIcon: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#CDBA96',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardDot: {
    color: '#8E8E93',
    fontSize: 12,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1218',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1C2433',
  },
  circleProgress: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#3A86FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderLeftColor: '#1C2433', // Fake 50%
    transform: [{ rotate: '-45deg' }],
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    transform: [{ rotate: '45deg' }],
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeAction: {
    color: '#3A86FF',
    fontSize: 13,
    fontWeight: '500',
  },
});
