import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Dimensions, Alert, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { useNavigation } from '@react-navigation/native';
import { Check, X, Play, RefreshCw, Trash2, Timer, Plus, Minus } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ActiveWorkoutPage: React.FC = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  const { activeWorkoutSession, updateWorkoutSet, addSetToExercise, finishWorkoutSession, cancelWorkoutSession } = useActivityStore();

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const handleFinish = () => {
    finishWorkoutSession();
    Alert.alert('¡Buen trabajo!', 'Tu entrenamiento ha sido guardado.', [
      { text: 'Aceptar', onPress: () => navigation.navigate('Tabs') }
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Descartar', '¿Seguro que quieres descartar este entrenamiento?', [
      { text: 'No' },
      { text: 'Sí', style: 'destructive', onPress: () => {
        cancelWorkoutSession();
        navigation.navigate('Tabs');
      }}
    ]);
  };

  if (!activeWorkoutSession) {
    return (
      <View style={[styles.container, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>No hay sesión activa.</Text>
        <Pressable onPress={() => navigation.navigate('Tabs')} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const activeExercise = activeWorkoutSession.exercises[activeExerciseIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.iconBtn}>
          <X size={24} color="#A0A0A0" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: '#FFF' }]}>
          {activeWorkoutSession.routineName || 'Entrenamiento'}
        </Text>
        <Pressable onPress={handleFinish} style={styles.iconBtn}>
          <Check size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* BUBBLE CAROUSEL */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bubbleCarousel}>
          {activeWorkoutSession.exercises.map((ex, index) => {
            const isActive = index === activeExerciseIndex;
            return (
              <Pressable key={index} onPress={() => setActiveExerciseIndex(index)}>
                <View style={[styles.bubbleWrapper, isActive && { borderColor: '#FFF', borderWidth: 2 }]}>
                  <Image source={{ uri: ex.gifUrl }} style={styles.bubbleImg} contentFit="cover" />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 3D BODY MOCKUP */}
        <View style={styles.bodyMockupContainer}>
          <Image source={require('../../../../assets/ai_body_scan.png')} style={styles.bodyImage} contentFit="contain" />
          <View style={[styles.muscleHighlight, { backgroundColor: '#3A86FF' }]} />
        </View>

        {/* ACTIONS ROW */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBtn}>
            <Play size={16} color="#FFF" fill="#FFF" />
            <Text style={styles.actionBtnText}>Tutorial</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <RefreshCw size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Reemplazar</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: '#FF453A' }]}>
            <Trash2 size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Borrar</Text>
          </Pressable>
        </View>

        {/* EXERCISE TITLE & TIMER */}
        <View style={styles.titleRow}>
          <Text style={styles.exerciseTitle}>{activeExercise.name}</Text>
          <View style={styles.timerBox}>
            <Timer size={20} color="#3A86FF" />
            <Text style={styles.timerText}>150s</Text>
          </View>
        </View>
        
        <Text style={styles.exerciseSubtitle}>
          Prioriza profundidad y técnica. Descansa todo lo que necesites.
        </Text>

        {/* SETS TABLE */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 0.8 }]}>SERIE</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>PREVIA</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'center' }]}>KG</Text>
            <Text style={[styles.th, { flex: 1.5, textAlign: 'center' }]}>REPES</Text>
            <View style={{ width: 40 }} />
          </View>

          {activeExercise.sets.map((set, setIdx) => {
            const isCompleted = set.completed;
            return (
              <View key={setIdx} style={styles.tableRow}>
                <Text style={[styles.tdIdx, { flex: 0.8 }]}>{setIdx + 1}</Text>
                <Text style={[styles.tdPrev, { flex: 1.2 }]}>-</Text>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, isCompleted && styles.inputCompleted]}
                    keyboardType="numeric"
                    value={set.weight ? set.weight.toString() : ''}
                    placeholder="0"
                    placeholderTextColor="#555"
                    onChangeText={(val) => updateWorkoutSet(activeExercise.exerciseId, setIdx, 'weight', parseFloat(val) || 0)}
                    editable={!isCompleted}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, isCompleted && styles.inputCompleted]}
                    keyboardType="numeric"
                    value={set.reps ? set.reps.toString() : ''}
                    placeholder="0"
                    placeholderTextColor="#555"
                    onChangeText={(val) => updateWorkoutSet(activeExercise.exerciseId, setIdx, 'reps', parseInt(val) || 0)}
                    editable={!isCompleted}
                  />
                </View>

                <Pressable 
                  onPress={() => updateWorkoutSet(activeExercise.exerciseId, setIdx, 'completed', !isCompleted)}
                  style={[styles.checkBtn, isCompleted ? { backgroundColor: '#34C759' } : { backgroundColor: '#FF453A' }]}
                >
                  {isCompleted ? <Check size={18} color="#FFF" /> : <Minus size={18} color="#FFF" />}
                </Pressable>
              </View>
            );
          })}
        </View>
        
        {/* ADD SET BUTTON */}
        <Pressable onPress={() => addSetToExercise(activeExercise.exerciseId)} style={styles.addSetBtn}>
          <Text style={styles.addSetBtnText}>Añadir serie</Text>
        </Pressable>

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
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bubbleCarousel: {
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  bubbleWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    padding: 2,
    backgroundColor: '#1C1C1E',
  },
  bubbleImg: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  bodyMockupContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  bodyImage: {
    width: 200,
    height: 200,
    opacity: 0.8,
  },
  muscleHighlight: {
    position: 'absolute',
    width: 20,
    height: 40,
    borderRadius: 10,
    top: '55%',
    opacity: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  exerciseTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  timerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#3A86FF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  exerciseSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tableContainer: {
    paddingHorizontal: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  th: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tdIdx: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tdPrev: {
    color: '#8E8E93',
    fontSize: 16,
  },
  inputContainer: {
    flex: 1.5,
    paddingHorizontal: 6,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    height: 44,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputCompleted: {
    backgroundColor: '#2C2C2E',
    color: '#34C759',
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addSetBtn: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addSetBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
