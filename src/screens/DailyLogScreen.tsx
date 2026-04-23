import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecordRepository } from '../repositories/RecordRepository';
import { AuthService } from '../services/AuthService';

const MOODS = [
  { score: 1, emoji: '😫', label: 'Horrível' },
  { score: 2, emoji: '🙁', label: 'Mal' },
  { score: 3, emoji: '😐', label: 'Médio' },
  { score: 4, emoji: '🙂', label: 'Bem' },
  { score: 5, emoji: '🤩', label: 'Radical' },
];

// Simulando as atividades que estariam no banco de dados
const AVAILABLE_ACTIVITIES = [
  { id: 1, icon: '🏃‍♂️', name: 'Esporte' },
  { id: 2, icon: '💧', name: 'Bebeu Água' },
  { id: 3, icon: '🥗', name: 'Saudável' },
  { id: 4, icon: '📖', name: 'Leitura' },
  { id: 5, icon: '🎮', name: 'Jogos' },
  { id: 6, icon: '🧘‍♀️', name: 'Relaxou' },
];

export default function DailyLogScreen({ navigation, route}: any) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [sleepHours, setSleepHours] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Controle de Data
  const [selectedDateStr, setSelectedDateStr] = useState(route.params?.selectedDateStr || 'hoje');

  // Lógica de Múltipla Seleção (Liga/Desliga a atividade)
  const toggleActivity = (id: number) => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter(actId => actId !== id));
    } else {
      setSelectedActivities([...selectedActivities, id]);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Atenção', 'Por favor, selecione pelo menos como você estava se sentindo.');
      return;
    }

    setIsSaving(true);
      try {
      const userId = await AuthService.getLoggedUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      // 4. Usa a data que veio da rota
      const dateObj = new Date();
      if (selectedDateStr === 'ontem') {
        dateObj.setDate(dateObj.getDate() - 1);
      }
      const finalDateString = dateObj.toISOString().split('T')[0];

      // Salva Registro + Atividades Extras
      await RecordRepository.createDailyRecordWithActivities(
        userId, 
        finalDateString, 
        selectedMood, 
        notes,
        selectedActivities
      );

      // Salva o Sono (Opcional)
      if (sleepHours) {
        await RecordRepository.createSleepRecord(
          userId, 
          finalDateString, 
          '00:00', 
          `${sleepHours}:00`, 
          3, // Qualidade média default
          0
        );
      }

      Alert.alert('Sucesso!', 'Seu registro foi salvo no diário.');
      navigation.goBack();
      
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' /* Fundo escuro estilo o vídeo */ }}>
      {/* KeyboardAvoidingView "empurra" a tela pra cima quando o teclado abre */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          {/* HUMOR */}
          <Text style={styles.headerTitle}>Como você estava?</Text>
          <View style={styles.moodContainer}>
            {MOODS.map((mood) => (
              <TouchableOpacity 
                key={mood.score} 
                style={[styles.moodButton, selectedMood === mood.score && styles.moodSelected]}
                onPress={() => setSelectedMood(mood.score)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ATIVIDADES EXTRAS (Tags) */}
          <Text style={styles.headerTitle}>O que você tem feito?</Text>
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
                  <Text style={[styles.activityName, isSelected && styles.activityNameSelected]}>
                    {act.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SONO E NOTAS */}
          <Text style={styles.headerTitle}>Detalhes</Text>
          <TextInput
            style={styles.input}
            placeholder="Horas de sono (ex: 8)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={sleepHours}
            onChangeText={setSleepHours}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Anotação rápida..."
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
            <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : '✔️ Salvar Registro'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 20, marginBottom: 15, textAlign: 'center' },
  
  dateSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  dateButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#333', marginHorizontal: 5 },
  dateSelected: { backgroundColor: '#4CAF50' },
  dateText: { color: '#aaa', fontWeight: 'bold' },
  dateTextSelected: { color: '#fff' },

  moodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  moodButton: { alignItems: 'center', padding: 10, borderRadius: 15, width: '18%' },
  moodSelected: { backgroundColor: '#333', borderWidth: 1, borderColor: '#4CAF50' },
  moodEmoji: { fontSize: 35, marginBottom: 5 },
  moodLabel: { fontSize: 10, color: '#aaa', fontWeight: 'bold' },

  activitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  activityButton: { width: '30%', backgroundColor: '#222', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  activitySelected: { backgroundColor: '#1A4D2E', borderColor: '#4CAF50', borderWidth: 1 },
  activityIcon: { fontSize: 28, marginBottom: 5 },
  activityName: { fontSize: 12, color: '#aaa', textAlign: 'center' },
  activityNameSelected: { color: '#fff', fontWeight: 'bold' },

  input: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  saveButton: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});