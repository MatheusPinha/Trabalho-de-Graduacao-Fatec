import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RecordRepository } from '../repositories/RecordRepository';
import { AuthService } from '../services/AuthService';

const MOODS = [
  { score: 5, emoji: '🤩', label: 'radical', color: '#4CAF50' },
  { score: 4, emoji: '🙂', label: 'bem', color: '#88cc00' },
  { score: 3, emoji: '😐', label: 'mais ou menos', color: '#4da6ff' },
  { score: 2, emoji: '🙁', label: 'mal', color: '#ff9933' },
  { score: 1, emoji: '😫', label: 'horrível', color: '#ff4d4d' },
];

const AVAILABLE_ACTIVITIES = [
  { id: 1, icon: '🏃‍♂️', name: 'Esporte' },
  { id: 2, icon: '💧', name: 'Bebeu Água' },
  { id: 3, icon: '🥗', name: 'Saudável' },
  { id: 4, icon: '📖', name: 'Leitura' },
  { id: 5, icon: '🎮', name: 'Jogos' },
  { id: 6, icon: '🧘‍♀️', name: 'Relaxou' },
];

// NOVA SEÇÃO: SONO
const SLEEP_TAGS = [
  { id: 101, icon: '😴', name: 'Bom sono' },
  { id: 102, icon: '😐', name: 'Sono neutro' },
  { id: 103, icon: '🥱', name: 'Sono ruim' },
  { id: 104, icon: '📉', name: 'Pouco sono' },
];

export default function DailyLogScreen({ navigation, route }: any) {
  // Recebe a data OU o ID de edição
  const { selectedDateStr, editRecordId } = route.params || { selectedDateStr: 'hoje' };

  // Inicializa a data real
  const [recordDate, setRecordDate] = useState<Date>(() => {
    const dateObj = new Date();
    if (selectedDateStr === 'ontem') {
      dateObj.setDate(dateObj.getDate() - 1);
    } else if (selectedDateStr !== 'hoje' && selectedDateStr) {
      const [year, month, day] = selectedDateStr.split('-');
      dateObj.setFullYear(Number(year), Number(month) - 1, Number(day));
    }
    return dateObj;
  });

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // EFEITO: Carrega dados caso seja Modo Edição
  useEffect(() => {
    if (editRecordId) {
      loadExistingData();
    }
  }, [editRecordId]);

  const loadExistingData = async () => {
    setIsLoading(true);
    try {
      const data = await RecordRepository.getRecordById(editRecordId);
      setSelectedMood(data.mood_score);
      setNotes(data.notes || '');
      setSelectedActivities(data.activities || []);
      // Previne problemas de fuso horário definindo meio-dia
      setRecordDate(new Date(data.date + "T12:00:00")); 
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os dados do registro.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivity = (id: number) => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter(actId => actId !== id));
    } else {
      setSelectedActivities([...selectedActivities, id]);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Atenção', 'Selecione pelo menos o seu humor.');
      return;
    }

    setIsSaving(true);
    try {
      const userId = await AuthService.getLoggedUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const finalDateString = recordDate.toISOString().split('T')[0];

      if (editRecordId) {
        // MODO ATUALIZAÇÃO
        await RecordRepository.updateDailyRecord(
          editRecordId, 
          selectedMood, 
          notes, 
          selectedActivities
        );
      } else {
        // MODO CRIAÇÃO
        await RecordRepository.createDailyRecordWithActivities(
          userId, 
          finalDateString, 
          selectedMood, 
          notes,
          selectedActivities
        );
      }

      Alert.alert('Sucesso!', editRecordId ? 'Registro atualizado.' : 'Registro salvo.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  // Formata a data para a UI: "Ontem, 23 de abril" ou "20 de outubro"
  const formatDateText = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

    if (isToday) return `Hoje, ${dateStr}`;
    if (isYesterday) return `Ontem, ${dateStr}`;
    return dateStr;
  };

  const timeStr = `${recordDate.getHours().toString().padStart(2, '0')}:${recordDate.getMinutes().toString().padStart(2, '0')}`;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9d4edd" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Botão de Fechar no topo */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          <Text style={styles.headerTitle}>{editRecordId ? 'Editar Registro' : 'Como você estava?'}</Text>
          
          <View style={styles.dateTimeContainer}>
            {/* Só permite abrir o calendário se não for edição */}
            <TouchableOpacity onPress={() => !editRecordId && setShowDatePicker(true)} style={styles.dateSelectorRow}>
              <Ionicons name="calendar-outline" size={16} color="#9d4edd" />
              <Text style={styles.dateSelectorText}>{formatDateText(recordDate)}</Text>
              {!editRecordId && <Ionicons name="caret-down" size={12} color="#9d4edd" />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateSelectorRow}>
              <Ionicons name="time-outline" size={18} color="#9d4edd" />
              <Text style={styles.dateSelectorText}>{timeStr}</Text>
              {!editRecordId && <Ionicons name="caret-down" size={12} color="#9d4edd" />}
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={recordDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (event.type === 'set' && selectedDate) {
                  setRecordDate(selectedDate);
                }
              }}
            />
          )}

          {/* SELEÇÃO DE HUMOR */}
          <View style={styles.moodContainer}>
            {MOODS.map((mood) => (
              <TouchableOpacity 
                key={mood.score} 
                style={styles.moodButton}
                onPress={() => setSelectedMood(mood.score)}
              >
                <View style={[styles.emojiCircle, { backgroundColor: selectedMood === mood.score ? mood.color : '#333' }]}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </View>
                <Text style={[styles.moodLabel, { color: selectedMood === mood.score ? mood.color : '#4CAF50' }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ATIVIDADES */}
          <Text style={styles.sectionTitle}>O que você tem feito?</Text>
          <View style={styles.activitiesGrid}>
            {AVAILABLE_ACTIVITIES.map((act) => {
              const isSelected = selectedActivities.includes(act.id);
              return (
                <TouchableOpacity 
                  key={act.id} 
                  style={[styles.activityButton, isSelected && styles.activitySelected]}
                  onPress={() => toggleActivity(act.id)}
                >
                  <Text style={styles.activityIcon}>{act.icon}</Text>
                  <Text style={[styles.activityName, isSelected && styles.activityNameSelected]}>{act.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SONO */}
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Sono</Text>
          <View style={styles.activitiesGrid}>
            {SLEEP_TAGS.map((tag) => {
              const isSelected = selectedActivities.includes(tag.id);
              return (
                <TouchableOpacity 
                  key={tag.id} 
                  style={[styles.activityButton, isSelected && styles.activitySelected]}
                  onPress={() => toggleActivity(tag.id)}
                >
                  <Text style={styles.activityIcon}>{tag.icon}</Text>
                  <Text style={[styles.activityName, isSelected && styles.activityNameSelected]}>{tag.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ANOTAÇÕES */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Adicionar Nota..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity 
            style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : '✔️'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  topBar: { paddingHorizontal: 15, paddingTop: 10, alignItems: 'flex-start' },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 10, marginBottom: 20, textAlign: 'center' },
  
  dateTimeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40, gap: 20 },
  dateSelectorRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4CAF50', paddingBottom: 5 },
  dateSelectorText: { color: '#9d4edd', fontSize: 16, marginHorizontal: 8 },

  moodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  moodButton: { alignItems: 'center', width: '18%' },
  emojiCircle: { width: 55, height: 55, borderRadius: 27.5, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  moodEmoji: { fontSize: 32 },
  moodLabel: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  
  activitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  activityButton: { width: '30%', backgroundColor: '#222', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  activitySelected: { backgroundColor: '#1A4D2E', borderColor: '#9d4edd', borderWidth: 1 },
  activityIcon: { fontSize: 28, marginBottom: 5 },
  activityName: { fontSize: 12, color: '#aaa', textAlign: 'center' },
  activityNameSelected: { color: '#fff', fontWeight: 'bold' },

  input: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15, marginTop: 10 },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  saveButton: { backgroundColor: '#9d4edd', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' }
});