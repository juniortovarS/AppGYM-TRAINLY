import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Clipboard, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Search, UserPlus, Users, MessageCircle, Send, Link, Mail, X, Lock, Bell } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useActivityStore } from '../store/useActivityStore';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { height } = Dimensions.get('window');
const LaurelWreathSource = require('../../assets/silver_laurel_wreath.png');

// Limit suggestions to exactly 4 people, making the final list have 5 people total (Me + 4)
const SUGGESTED_CONTACTS = [
  { id: '1', name: 'Sofía', handle: '@sofia_strong', initials: 'SF', workouts: 24, rankLabel: 'Rango IV: Campeón', desc: 'Entrena con regularidad' },
  { id: '2', name: 'Lucas', handle: '@lucas_fit', initials: 'LC', workouts: 12, rankLabel: 'Rango III: Guerrero', desc: 'Sugerido de tus contactos' },
  { id: '3', name: 'Mateo', handle: '@mateo_train', initials: 'MT', workouts: 1, rankLabel: 'Rango I: Recluta', desc: 'Sugerido de tus contactos' },
  { id: '4', name: 'Valeria', handle: '@val_fit', initials: 'VL', workouts: 22, rankLabel: 'Rango IV: Campeón', desc: 'Nueva en Trainly' },
];

// Position 4 bubbles in a perfect cross pattern around the center (Top, Right, Bottom, Left)
const ORBIT_BUBBLES = [
  { name: 'Sofía', initials: 'SF', top: 3, left: 88 },
  { name: 'Lucas', initials: 'LC', top: 88, left: 173 },
  { name: 'Mateo', initials: 'MT', top: 173, left: 88 },
  { name: 'Valeria', initials: 'VL', top: 88, left: 3 },
];

export const AmigosScreen: React.FC = () => {
  const { colors, typography } = useTheme();
  const { workoutHistory } = useActivityStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('¡Enlace copiado al portapapeles!');

  const searchInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const workoutCount = workoutHistory.length;

  // Build sorted leaderboard data combining Tú and 4 suggested contacts (exactly 5 items total)
  const leaderboardData = useMemo(() => {
    let myRankLabel = 'Rango I: Recluta';
    if (workoutCount >= 3 && workoutCount <= 7) myRankLabel = 'Rango II: Atleta';
    else if (workoutCount >= 8 && workoutCount <= 14) myRankLabel = 'Rango III: Guerrero';
    else if (workoutCount >= 15 && workoutCount <= 24) myRankLabel = 'Rango IV: Campeón';
    else if (workoutCount >= 25) myRankLabel = 'Rango V: Leyenda';

    const me = {
      id: 'me',
      name: 'Junior Tovar',
      initials: 'JT',
      handle: '@juniortovars',
      workouts: workoutCount,
      rankLabel: myRankLabel,
      desc: 'Tú',
    };

    const list = [me, ...SUGGESTED_CONTACTS];
    // Sort descending by number of workouts
    return list.sort((a, b) => b.workouts - a.workouts);
  }, [workoutCount]);

  // Filter leaderboard based on search query
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboardData;
    return leaderboardData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboardData, searchQuery]);

  const handleCopyLink = () => {
    try {
      Clipboard.setString('https://trainly.app/invite/juniortovars');
    } catch (e) {
      console.log('Clipboard copy fallback');
    }
    setToastMessage('¡Enlace copiado al portapapeles!');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    scrollViewRef.current?.scrollTo({ y: 310, animated: true });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#050508' }]}>
      
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: '#1C1C1E' }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <View style={styles.logoBlock1} />
            <View style={styles.logoBlock2} />
          </View>
          <Text style={styles.logoText}>Symmetry</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={handleFocusSearch} style={styles.headerIconBtn}>
            <Search size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => {
            setToastMessage('¡No tienes notificaciones pendientes!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
          }} style={styles.headerIconBtn}>
            <Bell size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CENTRAL RADAR HUB WITH LAUREL WREATH */}
        <View style={styles.hubContainer}>
          {/* Orbit Dashed Circle */}
          <View style={styles.orbitCircle} />

          {/* Floating Suggestion Bubbles (All Blurred) */}
          {ORBIT_BUBBLES.map((bubble, idx) => (
            <View 
              key={idx}
              style={[
                styles.floatingBubbleContainer, 
                { top: bubble.top, left: bubble.left }
              ]}
            >
              <View style={[styles.floatingBubble, styles.bubbleBlur]}>
                <Text style={[styles.bubbleText, styles.textBlurNative]}>{bubble.initials}</Text>
              </View>
              <Text style={[styles.bubbleLabel, styles.textBlurNative]}>
                {bubble.name}
              </Text>
            </View>
          ))}

          {/* Center Laurel Frame (Crisp, User) */}
          <View style={styles.centralWreathWrapper}>
            <Image 
              source={LaurelWreathSource}
              style={styles.laurelImage}
              contentFit="contain"
            />
            <View style={[styles.centralAvatar, { borderColor: '#FFFFFF', backgroundColor: '#121216' }]}>
              <Text style={styles.centralAvatarText}>JT</Text>
            </View>
          </View>
        </View>

        {/* HUB SUBTITLES */}
        <View style={styles.hubTitleWrapper}>
          <Text style={styles.hubTitleText}>Compite contra tus amigos</Text>
          <Text style={styles.hubSubtitleText}>Comparte tu enlace de invitación para añadir a tus amigos</Text>
        </View>

        {/* LOOKING FOR FRIENDS MAIN WHITE BUTTON */}
        <Pressable 
          onPress={handleFocusSearch}
          style={({ pressed }) => [
            styles.searchMainBtn,
            { backgroundColor: '#FFFFFF', opacity: pressed ? 0.9 : 1 }
          ]}
        >
          <Search size={16} color="#000000" style={{ marginRight: 6 }} />
          <Text style={styles.searchMainBtnText}>Buscar amigos</Text>
        </Pressable>

        {/* SEARCH BAR (SCROLL TARGET) */}
        <View style={[styles.searchBox, { backgroundColor: '#121216', borderColor: '#222226' }]}>
          <Search size={18} color="#8E8E93" style={{ marginRight: 8 }} />
          <TextInput
            ref={searchInputRef}
            placeholder="Buscar por nombre o usuario..."
            placeholderTextColor="#4E4E52"
            style={[styles.searchInput, { color: '#FFFFFF' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={16} color="#8E8E93" />
            </Pressable>
          ) : null}
        </View>

        {/* LEADERBOARD LIST */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>TABLA DE POSICIONES (RANKING)</Text>
        </View>

        <View style={styles.leaderboardContainer}>
          {filteredLeaderboard.map((item, index) => {
            const isMe = item.id === 'me';

            return (
              <View 
                key={item.name} 
                style={[
                  styles.contactCard, 
                  { 
                    backgroundColor: '#121216', 
                    borderColor: isMe ? '#FFFFFF' : '#222226',
                    borderWidth: isMe ? 1.5 : 1,
                  }
                ]}
              >
                {/* Ranking Position Badge */}
                <View style={styles.rankIndexCol}>
                  {index === 0 ? (
                    <View style={[styles.medalBadge, { backgroundColor: '#FFFFFF' }]}>
                      <Text style={[styles.medalText, { color: '#000000' }]}>1</Text>
                    </View>
                  ) : index === 1 ? (
                    <View style={[styles.medalBadge, { backgroundColor: '#AEAEB2' }]}>
                      <Text style={[styles.medalText, { color: '#000000' }]}>2</Text>
                    </View>
                  ) : index === 2 ? (
                    <View style={[styles.medalBadge, { backgroundColor: '#3A3A40' }]}>
                      <Text style={[styles.medalText, { color: '#FFFFFF' }]}>3</Text>
                    </View>
                  ) : (
                    <Text style={styles.rankIndexText}>{index + 1}</Text>
                  )}
                </View>

                {/* Blurrable Row Content */}
                <View style={[styles.contactLeft, !isMe && styles.rowBlurStyle]}>
                  <View style={[styles.contactAvatar, { backgroundColor: isMe ? '#FFFFFF' : '#1E1E24' }]}>
                    <Text style={[styles.contactAvatarText, { color: isMe ? '#000000' : '#FFFFFF' }, !isMe && styles.textBlurNative]}>
                      {item.initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.contactName, !isMe && styles.textBlurNative]}>{item.name}</Text>
                      {isMe && <Text style={styles.meBadge}>Tú</Text>}
                    </View>
                    <Text style={[styles.contactHandle, !isMe && styles.textBlurNative]}>{item.handle}</Text>
                    <Text style={[styles.contactRank, { color: isMe ? '#AEAEB2' : '#4E4E52' }, !isMe && styles.textBlurNative]}>
                      {item.rankLabel}
                    </Text>
                    <Text style={[styles.contactDesc, { color: isMe ? '#8E8E93' : '#3A3A40' }, !isMe && styles.textBlurNative]}>
                      {`${item.workouts} entrenamientos completados`}
                    </Text>
                  </View>
                </View>

                {/* Locked / Preview Indicator */}
                <View style={styles.actionColumn}>
                  {isMe ? (
                    <View style={[styles.meStarBadge, { borderColor: '#FFFFFF' }]}>
                      <Text style={styles.meStarText}>Pro</Text>
                    </View>
                  ) : (
                    <View style={styles.lockBadge}>
                      <Lock size={13} color="#636366" />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* BOTTOM ACTION BUTTON */}
        <Pressable 
          onPress={() => setShowInviteSheet(true)}
          style={({ pressed }) => [
            styles.inviteBtn,
            { backgroundColor: '#FFFFFF', opacity: pressed ? 0.9 : 1, marginTop: 12 }
          ]}
        >
          <UserPlus size={18} color="#000000" style={{ marginRight: 8 }} />
          <Text style={styles.inviteBtnText}>Invitar Contactos</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FLOATING TOAST */}
      {showToast && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.toastContainer, { backgroundColor: '#121216', borderColor: '#222226' }]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* BOTTOM SHEET BACKDROP */}
      {showInviteSheet && (
        <Pressable 
          style={StyleSheet.absoluteFillObject}
          onPress={() => setShowInviteSheet(false)}
        >
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.backdrop}
          />
        </Pressable>
      )}

      {/* BOTTOM SHEET PANEL */}
      {showInviteSheet && (
        <Animated.View 
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.bottomSheet, { backgroundColor: '#09090C', borderColor: '#222226' }]}
        >
          <View style={styles.sheetIndicator} />
          
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>INVITAR CONTACTOS</Text>
            <Text style={styles.sheetSub}>Envía un enlace para unirse a Symmetry</Text>
            <Pressable 
              onPress={() => setShowInviteSheet(false)} 
              style={styles.sheetCloseBtn}
            >
              <X size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.sheetGrid}>
            <Pressable 
              onPress={() => {
                alert('Compartiendo invitación vía WhatsApp...');
                setShowInviteSheet(false);
              }}
              style={({ pressed }) => [styles.sheetItem, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.sheetIconWrapper, { backgroundColor: '#121216', borderColor: '#222226' }]}>
                <MessageCircle size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.sheetItemLabel}>WhatsApp</Text>
            </Pressable>

            <Pressable 
              onPress={() => {
                alert('Compartiendo invitación vía Telegram...');
                setShowInviteSheet(false);
              }}
              style={({ pressed }) => [styles.sheetItem, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.sheetIconWrapper, { backgroundColor: '#121216', borderColor: '#222226' }]}>
                <Send size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.sheetItemLabel}>Telegram</Text>
            </Pressable>

            <Pressable 
              onPress={() => {
                handleCopyLink();
                setShowInviteSheet(false);
              }}
              style={({ pressed }) => [styles.sheetItem, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.sheetIconWrapper, { backgroundColor: '#121216', borderColor: '#222226' }]}>
                <Link size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.sheetItemLabel}>Copiar Link</Text>
            </Pressable>

            <Pressable 
              onPress={() => {
                alert('Compartiendo invitación vía Email...');
                setShowInviteSheet(false);
              }}
              style={({ pressed }) => [styles.sheetItem, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.sheetIconWrapper, { backgroundColor: '#121216', borderColor: '#222226' }]}>
                <Mail size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.sheetItemLabel}>Email</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 22,
    height: 22,
    position: 'relative',
    marginRight: 8,
  },
  logoBlock1: {
    width: 11,
    height: 11,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    top: 1,
    left: 1,
  },
  logoBlock2: {
    width: 11,
    height: 11,
    backgroundColor: '#8E8E93',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    bottom: 1,
    right: 1,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 6,
    marginLeft: 14,
  },
  scrollContent: {
    padding: 20,
  },
  hubContainer: {
    height: 220,
    width: 220,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  orbitCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    top: 25,
    left: 25,
  },
  floatingBubbleContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
    width: 38,
    height: 52,
    justifyContent: 'center',
  },
  floatingBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: '#121214',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bubbleLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    color: '#8E8E93',
  },
  bubbleBlur: Platform.select({
    web: {
      filter: 'blur(3px)',
      opacity: 0.35,
      borderColor: '#222226',
    } as any,
    default: {
      opacity: 0.2,
      borderColor: '#222226',
    },
  }),
  centralWreathWrapper: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 45,
    left: 45,
  },
  laurelImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  centralAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'absolute',
    top: 35,
    left: 35,
  },
  centralAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hubTitleWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  hubTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  hubSubtitleText: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  searchMainBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchMainBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionHeading: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  leaderboardContainer: {
    marginBottom: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rankIndexCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rankIndexText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: 'bold',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowBlurStyle: Platform.select({
    web: {
      filter: 'blur(6px)',
      opacity: 0.35,
    } as any,
    default: {
      opacity: 0.35,
    },
  }),
  textBlurNative: Platform.select({
    web: {} as any,
    default: {
      color: 'transparent',
      textShadowColor: 'rgba(255,255,255,0.45)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
  }),
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2C2C32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  meBadge: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    overflow: 'hidden',
  },
  contactHandle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 1,
  },
  contactRank: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  contactDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  actionColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
    zIndex: 20,
  },
  meStarBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  meStarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: '#2C2C32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1001,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    opacity: 0.6,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 40,
    zIndex: 1000,
  },
  sheetIndicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2C2C32',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    position: 'relative',
    marginBottom: 24,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sheetSub: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 4,
  },
  sheetCloseBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sheetItem: {
    alignItems: 'center',
    flex: 1,
  },
  sheetIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetItemLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
});
