import { db } from '../database/initDB';
import { User } from '../types';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    // Usamos getFirstAsync para retornar apenas uma linha
    const user = await db.getFirstAsync<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return user;
  }

  static async createUser(name: string, email: string, passwordHash: string): Promise<number> {
    const result = await db.runAsync(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    return result.lastInsertRowId;
  }
}