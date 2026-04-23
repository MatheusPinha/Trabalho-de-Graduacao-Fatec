import * as SecureStore from 'expo-secure-store';
import { UserRepository } from '../repositories/UserRepository';

const SESSION_KEY = 'user_session_id';

export class AuthService {
  
  static async login(email: string, passwordInput: string): Promise<boolean> {
    const user = await UserRepository.findByEmail(email);
    
    if (!user) throw new Error('Usuário não encontrado');

    // Em um app real, use uma biblioteca como 'react-native-bcrypt' para comparar hashes.
    // Para simplificar o exemplo, vamos comparar diretamente (assumindo hash simples).
    const isPasswordValid = user.password_hash === passwordInput; 

    if (isPasswordValid) {
      // Salva o ID do usuário de forma criptografada no dispositivo
      await SecureStore.setItemAsync(SESSION_KEY, user.id.toString());
      return true;
    }
    
    throw new Error('Senha incorreta');
  }

  static async getLoggedUserId(): Promise<number | null> {
    const idString = await SecureStore.getItemAsync(SESSION_KEY);
    return idString ? parseInt(idString, 10) : null;
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}