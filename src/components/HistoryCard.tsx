import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MOODS: any = { 
  1: { emoji: '😫', label: 'horrível', color: '#ff4d4d' }, 
  2: { emoji: '🙁', label: 'mal', color: '#ff9933' }, 
  3: { emoji: '😐', label: 'médio', color: '#4da6ff' }, 
  4: { emoji: '🙂', label: 'bem', color: '#88cc00' }, 
  5: { emoji: '🤩', label: 'radical', color: '#4CAF50' } 
};

export default function HistoryCard({ item }: any) {
  const mood = MOODS[item.mood_score] || MOODS[3];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.optionsIcon}>•••</Text>
      </View>
      
      <View style={styles.body}>
        <View style={[styles.emojiContainer, { backgroundColor: mood.color }]}>
          <Text style={styles.emoji}>{mood.emoji}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
            <Text style={styles.timeText}>14:26 {/* Horário fixo por enquanto */}</Text>
          </View>
          
          <Text style={styles.tagsText}>
            {item.sleep_hours ? `🛌 ${item.sleep_hours}h de sono` : 'Nenhuma tag extra'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 20, marginBottom: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateText: { fontSize: 12, color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold' },
  optionsIcon: { color: '#666', fontSize: 16 },
  body: { flexDirection: 'row', alignItems: 'center' },
  emojiContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  emoji: { fontSize: 30 },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  moodLabel: { fontSize: 20, fontWeight: 'bold', marginRight: 8, textTransform: 'lowercase' },
  timeText: { fontSize: 14, color: '#aaa' },
  tagsText: { fontSize: 13, color: '#ccc' }
});