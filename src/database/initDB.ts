import * as SQLite from 'expo-sqlite';

// Inicializa o banco de dados de forma síncrona
export const db = SQLite.openDatabaseSync('daylio_tg.db');

export const initializeDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        mood_score INTEGER NOT NULL,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sleep_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        record_date TEXT NOT NULL,
        bed_time TEXT NOT NULL,
        wake_up_time TEXT NOT NULL,
        perceived_quality INTEGER NOT NULL,
        awakenings INTEGER NOT NULL DEFAULT 0,
        origem_dado TEXT NOT NULL CHECK(origem_dado IN ('manual', 'google_fit', 'apple_health')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
  }
};