// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Usado apenas no cadastro
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = async () => {
    if (!email || !password || (!isLoginMode && !name)) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        // Fluxo de Login
        await AuthService.login(email.toLowerCase(), password);
      } else {
        // Fluxo de Cadastro
        const existingUser = await UserRepository.findByEmail(email.toLowerCase());
        if (existingUser) {
          Alert.alert('Erro', 'Este e-mail já está cadastrado.');
          setIsLoading(false);
          return;
        }
        
        // Salva no banco SQLite
        await UserRepository.createUser(name, email.toLowerCase(), password);
        // Já faz o login automático após cadastrar
        await AuthService.login(email.toLowerCase(), password);
      }
      
      // Avisa o App.tsx que o login deu certo para mudar de tela
      onLoginSuccess();
      
    } catch (error: any) {
      Alert.alert('Erro na Autenticação', error.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLoginMode ? 'Bem-vindo de volta' : 'Criar nova conta'}</Text>

      {!isLoginMode && (
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuthenticate} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isLoginMode ? 'Entrar' : 'Cadastrar'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {isLoginMode ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000000' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#9d4edd' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  button: { backgroundColor: '#9d4edd', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toggleButton: { marginTop: 20, alignItems: 'center' },
  toggleText: { color: '#2196F3', fontSize: 16, fontWeight: '600' }
});