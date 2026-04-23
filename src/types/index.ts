// src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
}

export interface DailyRecord {
  id: number;
  user_id: number;
  date: string; // Formato YYYY-MM-DD
  mood_score: number; // 1 a 5
  notes: string | null;
}

export interface Activity {
  id: number;
  name: string;
  icon_name: string;
}

export interface SleepRecord {
  id: number;
  user_id: number;
  record_date: string;
  bed_time: string; // ISO 8601
  wake_up_time: string; // ISO 8601
  perceived_quality: number; // 1 a 5
  awakenings: number;
  origem_dado: 'manual' | 'google_fit' | 'apple_health'; // Preparado para Wearables!
}