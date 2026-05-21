import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../../../src/hooks/useTheme';
import { useActivityStore } from '../../../../src/store/useActivityStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, MoreVertical, Sparkles, Plus, ArrowDownUp, Edit2, Play } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const RoutineDetailPage: React.FC = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { routineId } = route.params || {};

  const { routines, startWorkoutSession } = useActivityStore();
  
  // Si no hay ID, usamos la primera rutina como fallback para visualizar
  const routine = routineId ? routines.find(r => r.id === routineId) : routines[0];

  if (!routine) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textPrimary }}>Rutina no encontrada</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER: <- | [Adaptar] : */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={[styles.adaptBtn, { borderColor: 'rgba(58, 134, 255, 0.5)' }]}>
            <Sparkles size={14} color="#3A86FF" />
            <Text style={[styles.adaptBtnText, { color: colors.textPrimary }]}>Adaptar</Text>
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <MoreVertical size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{routine.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {routine.exercises.length} ejercicios, 68 min
          </Text>
        </View>

        {/* DISTRIBUCIÓN MUSCULAR */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Distribución muscular</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {/* Fake data to match the screenshot exactly */}
            {[
              { name: 'Femoral', percent: '29%' },
              { name: 'Cuádriceps', percent: '20%' },
              { name: 'Glúteos', percent: '20%' }
            ].map((muscle, idx) => (
              <View key={idx} style={[styles.muscleCard, { backgroundColor: '#141414' }]}>
                {/* 3D Body mockup placeholder */}
                <View style={styles.bodyMockup}>
                  <Image source={require('../../../../assets/ai_body_scan.png')} style={styles.bodyImg} contentFit="cover" />
                  <View style={[styles.muscleHighlight, { backgroundColor: '#3A86FF' }]} />
                </View>
                <View style={styles.muscleInfo}>
                  <Text style={[styles.muscleName, { color: colors.textSecondary }]}>{muscle.name}</Text>
                  <Text style={[styles.musclePercent, { color: colors.textPrimary }]}>{muscle.percent}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* LISTA DE EJERCICIOS */}
        <View style={styles.section}>
          <View style={styles.listHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              {routine.exercises.length} ejercicios
            </Text>
            <Pressable style={[styles.addBtn, { backgroundColor: '#1C1C1E' }]}>
              <Plus size={16} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.exercisesList}>
            {routine.exercises.map((ex, index) => (
              <View key={ex.id || index} style={styles.exerciseRow}>
                <View style={styles.exImageContainer}>
                  <Image source={{ uri: ex.gifUrl }} style={styles.exImage} contentFit="cover" />
                </View>
                <View style={styles.exDetails}>
                  <Text style={[styles.exMeta, { color: colors.textSecondary }]}>
                    3 series x 10 reps
                  </Text>
                  <Text style={[styles.exName, { color: colors.textPrimary }]}>
                    {ex.name}
                  </Text>
                </View>
                <Pressable style={styles.dragHandle}>
                  <ArrowDownUp size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* BOTTOM ABSOLUTE BUTTONS */}
      <View style={[styles.bottomActions, { backgroundColor: colors.background }]}>
        <Pressable style={[styles.editBtn, { backgroundColor: '#1C1C1E' }]}>
          <Edit2 size={18} color={colors.textPrimary} />
          <Text style={[styles.editBtnText, { color: colors.textPrimary }]}>Editar Entrenamiento</Text>
        </Pressable>
        <Pressable 
          onPress={() => {
            startWorkoutSession(routine);
            navigation.navigate('ActiveWorkout');
          }}
          style={[styles.startBtn, { backgroundColor: '#FFF' }]}
        >
          <Play size={20} color="#000" fill="#000" />
          <Text style={[styles.startBtnText, { color: '#000' }]}>Empezar Entrenamiento</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  iconBtn: {
    padding: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adaptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    gap: 6,
  },
  adaptBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: 10,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  muscleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    borderRadius: 16,
    height: 60,
  },
  bodyMockup: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bodyImg: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  muscleHighlight: {
    position: 'absolute',
    width: 10,
    height: 20,
    borderRadius: 5,
  },
  muscleInfo: {
    justifyContent: 'center',
  },
  muscleName: {
    fontSize: 13,
    marginBottom: 2,
  },
  musclePercent: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exercisesList: {
    paddingHorizontal: 20,
    gap: 24,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    padding: 2,
    marginRight: 16,
  },
  exImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  exDetails: {
    flex: 1,
  },
  exMeta: {
    fontSize: 13,
    marginBottom: 4,
  },
  exName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dragHandle: {
    padding: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    gap: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
