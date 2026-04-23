import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthService } from '../services/AuthService';
import { RecordRepository } from '../repositories/RecordRepository';
import HistoryCard from '../components/HistoryCard';

export default function DashboardScreen({ navigation }: any) {
  const [logs, setLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const loadData = async () => {
    try {
      const userId = await AuthService.getLoggedUserId();
      if (userId) {
        const history = await RecordRepository.getDashboardData(userId);
        setLogs(history as any);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleNewRecord = (dateStr: string) => {
    setModalVisible(false);
    navigation.navigate('DailyLog', { selectedDateStr: dateStr });
  };

  // Pega a data de hoje formatada (Ex: 23 de Abril)
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  return (
    // O backgroundColor aqui remove a "faixa branca" do topo
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* 1. NOVO CABEÇALHO (HEADER) ESTILIZADO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerDate}>HOJE, {dateFormatted.toUpperCase()}</Text>
          <Text style={styles.headerTitle}>Seu Dia</Text>
        </View>
        
        {/* Botão de Perfil no Canto Superior Direito */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={48} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* 2. LISTA DE REGISTROS */}
      <View style={styles.content}>
        <FlatList
          data={logs}
          keyExtractor={(item: any, index) => item.date + index} // Evita erro de chave duplicada
          renderItem={({ item }) => <HistoryCard item={item} />}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum registro ainda.</Text>}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      </View>

      {/* 3. POPUP MODAL (Exatamente igual ao anterior) */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.popupMenu}>
              <TouchableOpacity style={styles.popupOption} onPress={() => handleNewRecord('ontem')}>
                <View style={[styles.iconCircle, { backgroundColor: '#4da6ff' }]}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </View>
                <Text style={styles.popupText}>Ontem</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.popupOptionCenter} onPress={() => handleNewRecord('hoje')}>
                <View style={[styles.iconCircle, { backgroundColor: '#2196F3', width: 60, height: 60, borderRadius: 30 }]}>
                  <Ionicons name="time" size={32} color="#fff" />
                </View>
                <Text style={[styles.popupText, { fontWeight: 'bold' }]}>Hoje</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.popupOption} onPress={() => setModalVisible(false)}>
                <View style={[styles.iconCircle, { backgroundColor: '#ff9933' }]}>
                  <Ionicons name="calendar" size={24} color="#fff" />
                </View>
                <Text style={styles.popupText}>Outro dia</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closePopupButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 4. BARRA DE NAVEGAÇÃO INFERIOR */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10, height: 65 + (insets.bottom > 0 ? insets.bottom : 10) }]}>
        <TouchableOpacity style={styles.tabButton}>
          <MaterialCommunityIcons name="text-box-outline" size={24} color="#4CAF50" />
          <Text style={[styles.tabText, { color: '#4CAF50' }]}>Registros</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="stats-chart" size={24} color="#888" />
          <Text style={styles.tabText}>Estatísticas</Text>
        </TouchableOpacity>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={35} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="calendar-outline" size={24} color="#888" />
          <Text style={styles.tabText}>Calendário</Text>
        </TouchableOpacity>

        {/* Botão "Mais" Restaurado! */}
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#888" />
          <Text style={styles.tabText}>Mais</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' }, // O fundo preto total resolve a faixa branca
  
  /* Estilos do Novo Cabeçalho */
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 10,
    backgroundColor: '#000' 
  },
  headerDate: { color: '#aaa', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 2 },

  content: { flex: 1 },
  empty: { textAlign: 'center', color: '#666', marginTop: 50 },

  bottomBar: { flexDirection: 'row', backgroundColor: '#1A4D2E', height: 70, justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10, borderTopWidth: 1, borderTopColor: '#2a5d3e' },
  tabButton: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabText: { color: '#888', fontSize: 10, marginTop: 4 },
  
  fabContainer: { position: 'relative', width: 60, alignItems: 'center' },
  fab: { position: 'absolute', bottom: -10, width: 65, height: 65, borderRadius: 35, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 3, borderColor: '#1A4D2E' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120 },
  popupMenu: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginBottom: 30 },
  popupOption: { alignItems: 'center', marginTop: 20 },
  popupOptionCenter: { alignItems: 'center', zIndex: 10 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  popupText: { color: '#fff', fontSize: 14 },
  closePopupButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginTop: 20 }
});