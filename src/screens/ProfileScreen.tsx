// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/AuthService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen({ onLogout }: any) {
  
  const handleLogout = async () => {
    // Apaga a sessão do SecureStore
    await AuthService.logout();
    // Avisa o App.tsx para recarregar a tela de Login
    onLogout(); 
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {/* Ícone gigante simulando a foto */}
          <Ionicons name="person-circle" size={120} color="#555" />
          
          {/* Botão de editar foto */}
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>Matheus</Text>
        <Text style={styles.subtitle}>Acesso via SQLite</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ff4d4d" />
        <Text style={styles.logoutText}>Sair do Aplicativo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 50 },
  imageContainer: { position: 'relative' },
  editBadge: { position: 'absolute', bottom: 10, right: 5, backgroundColor: '#9d4edd', padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#121212' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  
  logoutButton: { flexDirection: 'row', backgroundColor: '#2a1a1a', padding: 18, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4d1a1a' },
  logoutText: { color: '#ff4d4d', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }
});