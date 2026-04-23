import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { initializeDatabase } from './src/database/initDB';
import { AuthService } from './src/services/AuthService';

// IMPORTAÇÃO DE TODOS OS ECRÃS
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DailyLogScreen from './src/screens/DailyLogScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // <- Aqui está o Profile!

const Stack = createNativeStackNavigator();

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepareApp() {
      try {
        await initializeDatabase();
        setIsDbReady(true);

        const userId = await AuthService.getLoggedUserId();
        setIsAuthenticated(!!userId); 
      } catch (e) {
        console.error("Erro fatal ao iniciar:", e);
      }
    }

    prepareApp();
  }, []);

  if (!isDbReady || isAuthenticated === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>A carregar o seu Diário...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* StatusBar light deixa os ícones de bateria/hora do telemóvel brancos */}
      <StatusBar style="light" /> 
      
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1A4D2E' }, headerTintColor: '#fff' }}>
          
          {/* A opção headerShown: false é o que remove a tal faixa branca dupla! */}
          <Stack.Screen name="Dashboard" options={{ headerShown: false }}>
            {(props) => <DashboardScreen {...props} />}
          </Stack.Screen>
          
          <Stack.Screen name="DailyLog" component={DailyLogScreen} options={{ title: 'Novo Registo' }} />
          
          {/* Rota do Perfil registada e a passar a função para deslogar */}
          <Stack.Screen name="Profile" options={{ title: 'O Meu Perfil' }}>
            {(props) => <ProfileScreen {...props} onLogout={() => setIsAuthenticated(false)} />}
          </Stack.Screen>

        </Stack.Navigator>
      ) : (
        <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});