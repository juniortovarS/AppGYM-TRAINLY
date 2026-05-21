import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, SafeAreaView, Alert } from 'react-native';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { ChevronLeft, Plus, Download, Save, Trash2, Dumbbell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SmartAddExerciseModal } from '../components/SmartAddExerciseModal';
import { Image } from 'expo-image';
import { MotiView } from 'moti';

export const CreateRoutinePage: React.FC = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  const [routineName, setRoutineName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const { draftRoutineExercises, createRoutine, clearDraft, removeExerciseFromDraft } = useActivityStore();

  // Clear draft when unmounting or starting fresh
  useEffect(() => {
    return () => {
      // Don't clear draft on unmount so they can go to Ejercicios and back without losing it
    };
  }, []);

  const handleSelectOption = (option: string) => {
    setModalVisible(false);
    if (option === 'catalog') {
      navigation.navigate('Ejercicios');
    } else {
      // Handle other options like AI or scan
    }
  };

  const handleSave = () => {
    if (!routineName.trim()) {
      Alert.alert('Falta nombre', 'Por favor, dale un nombre a tu rutina.');
      return;
    }
    if (draftRoutineExercises.length === 0) {
      Alert.alert('Rutina vacía', 'Añade al menos un ejercicio a tu rutina.');
      return;
    }

    createRoutine(routineName, '', draftRoutineExercises);
    Alert.alert('¡Rutina Creada!', 'Tu rutina ha sido guardada exitosamente.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleClose = () => {
    if (draftRoutineExercises.length > 0 || routineName.length > 0) {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro de que quieres salir? Se perderán los ejercicios que has añadido.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => {
              clearDraft();
              navigation.goBack();
          }}
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={handleClose} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }]}>
          CREAR NUEVA RUTINA
        </Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Save size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Input Name */}
        <TextInput
          placeholder="Nombre de la rutina (ej. Día de Piernas)"
          placeholderTextColor={colors.textMuted}
          value={routineName}
          onChangeText={setRoutineName}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
        />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Plus size={18} color={colors.textInverse} style={{ marginRight: 8 }} />
            <Text style={[styles.actionBtnText, { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
              Añadir ejercicios
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtnSecondary,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Download size={18} color={colors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={[styles.actionBtnTextSecondary, { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }]}>
              Importar rutina
            </Text>
          </Pressable>
        </View>

        {/* Lista de Ejercicios Añadidos */}
        {draftRoutineExercises.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.border, borderStyle: 'dashed' }]}>
            <Dumbbell size={32} color={colors.textMuted} style={{ marginBottom: 10 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aún no has añadido ejercicios a esta rutina.
            </Text>
          </View>
        ) : (
          <View style={styles.exercisesList}>
            {draftRoutineExercises.map((ex, idx) => (
              <MotiView
                key={ex.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Image source={{ uri: ex.gifUrl }} style={styles.exImage} contentFit="cover" />
                <View style={styles.exInfo}>
                  <Text style={[styles.exName, { color: colors.textPrimary }]}>{ex.name}</Text>
                  <Text style={[styles.exBodyPart, { color: colors.primary }]}>{ex.bodyPart}</Text>
                </View>
                <Pressable onPress={() => removeExerciseFromDraft(ex.id)} style={styles.removeBtn}>
                  <Trash2 size={20} color="#FF3B30" />
                </Pressable>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Inteligente */}
      <SmartAddExerciseModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelectOption={handleSelectOption}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    letterSpacing: 1,
  },
  saveBtn: {
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {},
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnTextSecondary: {},
  emptyState: {
    height: 140,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  exImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  exInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exBodyPart: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeBtn: {
    padding: 8,
  },
});
