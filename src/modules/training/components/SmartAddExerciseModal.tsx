import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../../../../src/hooks/useTheme';
import { X, Wand2, Camera, Search, Plus } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SmartAddExerciseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectOption: (option: 'ai' | 'scan' | 'manual' | 'catalog') => void;
}

export const SmartAddExerciseModal: React.FC<SmartAddExerciseModalProps> = ({
  isVisible,
  onClose,
  onSelectOption,
}) => {
  const { colors, typography } = useTheme();

  return (
    <AnimatePresence>
      {isVisible && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          style={styles.absoluteOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          
          <MotiView
            from={{ translateY: SCREEN_HEIGHT * 0.4, scale: 0.95 }}
            animate={{ translateY: 0, scale: 1 }}
            exit={{ translateY: SCREEN_HEIGHT * 0.4, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 140 }}
            style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
                AÑADIR A RUTINA
              </Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.content}>
              {/* Opción 1: IA Asistente */}
              <Pressable
                onPress={() => onSelectOption('ai')}
                style={({ pressed }) => [
                  styles.optionCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.primary, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                  <Wand2 size={24} color={colors.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    Generar con IA (Próximamente)
                  </Text>
                  <Text style={[styles.optionSub, { color: colors.textSecondary, fontSize: 11 }]}>
                    Describe qué quieres entrenar y crearemos la rutina perfecta.
                  </Text>
                </View>
              </Pressable>

              {/* Opción 2: Escanear */}
              <Pressable
                onPress={() => onSelectOption('scan')}
                style={({ pressed }) => [
                  styles.optionCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                  <Camera size={24} color={colors.textPrimary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    Escanear Rutina (Próximamente)
                  </Text>
                  <Text style={[styles.optionSub, { color: colors.textSecondary, fontSize: 11 }]}>
                    Toma una foto a una rutina escrita y la detectaremos por ti.
                  </Text>
                </View>
              </Pressable>

              {/* Opción 3: Catálogo */}
              <Pressable
                onPress={() => onSelectOption('catalog')}
                style={({ pressed }) => [
                  styles.optionCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                  <Search size={24} color={colors.textPrimary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    Buscar Ejercicios
                  </Text>
                  <Text style={[styles.optionSub, { color: colors.textSecondary, fontSize: 11 }]}>
                    Explora nuestra biblioteca de más de 30 ejercicios premium.
                  </Text>
                </View>
              </Pressable>

              {/* Opción 4: Manual */}
              <Pressable
                onPress={() => onSelectOption('manual')}
                style={({ pressed }) => [
                  styles.optionCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                  <Plus size={24} color={colors.textPrimary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
                    Crear Personalizado
                  </Text>
                  <Text style={[styles.optionSub, { color: colors.textSecondary, fontSize: 11 }]}>
                    Añade un ejercicio único que no esté en la base de datos.
                  </Text>
                </View>
              </Pressable>
            </View>
          </MotiView>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    letterSpacing: 1.2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    marginBottom: 4,
  },
  optionSub: {
    lineHeight: 16,
  },
});
