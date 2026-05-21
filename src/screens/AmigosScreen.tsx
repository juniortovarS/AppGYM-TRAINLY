import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Search, UserPlus, Users } from 'lucide-react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export const AmigosScreen: React.FC = () => {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.xl, fontWeight: 'bold' }]}>
          AMIGOS
        </Text>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }} 
          style={[styles.profileAvatar, { borderColor: colors.border }]} 
          contentFit="cover" 
        />
      </View>

      {/* CONTENT (Empty State) */}
      <View style={styles.content}>
        
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          style={styles.illustrationContainer}
        >
          {/* We use a high quality 3D-like placeholder from unsplash or abstract graphic */}
          <View style={[styles.glowBackground, { backgroundColor: `${colors.primary}20` }]} />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.illustration}
            contentFit="cover"
          />
          <View style={styles.iconOverlay}>
            <Users size={32} color="#000" />
          </View>
        </MotiView>

        <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: typography.sizes.xl }]}>
          Comunidad
        </Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
          Aún no has registrado a tus amigos, ¿qué esperas?{'\n'}Entrenar en equipo multiplica tus resultados.
        </Text>

        <Pressable 
          style={({ pressed }) => [
            styles.primaryBtn, 
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Search size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={[styles.primaryBtnText, { color: '#000', fontSize: typography.sizes.sm }]}>
            Buscar Amigos
          </Text>
        </Pressable>
        
        <Pressable 
          style={({ pressed }) => [
            styles.secondaryBtn, 
            { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <UserPlus size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryBtnText, { color: colors.textPrimary, fontSize: typography.sizes.sm }]}>
            Invitar Contactos
          </Text>
        </Pressable>

      </View>
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
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.35,
    transform: [{ scale: 1.2 }],
    opacity: 0.5,
  },
  illustration: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.35,
    borderWidth: 2,
    borderColor: '#3A3A3C',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    backgroundColor: '#FFD700',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDesc: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
  },
  primaryBtnText: {
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontWeight: '600',
  },
});
