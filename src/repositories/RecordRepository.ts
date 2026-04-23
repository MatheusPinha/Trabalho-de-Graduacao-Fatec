// src/repositories/RecordRepository.ts
import { db } from '../database/initDB';

export class RecordRepository {
  
  // Salva o Humor do dia
  static async createDailyRecordWithActivities(
    userId: number, 
    date: string, 
    moodScore: number, 
    notes: string,
    activityIds: number[] // Lista das IDs das atividades que o usuário marcou
  ) {
    // 1. Salva o registro diário principal
    const recordResult = await db.runAsync(
      'INSERT INTO daily_records (user_id, date, mood_score, notes) VALUES (?, ?, ?, ?)',
      [userId, date, moodScore, notes]
    );
    
    const recordId = recordResult.lastInsertRowId;

    // 2. Salva todas as atividades vinculadas a este dia
    for (const actId of activityIds) {
      await db.runAsync(
        'INSERT INTO record_activities (record_id, activity_id) VALUES (?, ?)',
        [recordId, actId]
      );
    }

    return recordId;
  }

  // Salva a qualidade do Sono (com a nossa coluna preparatória para relógios!)
  static async createSleepRecord(
    userId: number, 
    recordDate: string, 
    bedTime: string, 
    wakeUpTime: string, 
    quality: number, 
    awakenings: number, 
    origem: 'manual' | 'google_fit' | 'apple_health' = 'manual'
  ) {
    const result = await db.runAsync(
      'INSERT INTO sleep_records (user_id, record_date, bed_time, wake_up_time, perceived_quality, awakenings, origem_dado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, recordDate, bedTime, wakeUpTime, quality, awakenings, origem]
    );
    return result.lastInsertRowId;
  }

static async getDashboardData(userId: number) {
  // Busca os últimos 5 registros combinando humor e sono
  const query = `
    SELECT 
      dr.date, 
      dr.mood_score, 
      sr.perceived_quality as sleep_quality, 
      sr.wake_up_time as sleep_hours
    FROM daily_records dr
    LEFT JOIN sleep_records sr ON dr.date = sr.record_date AND dr.user_id = sr.user_id
    WHERE dr.user_id = ?
    ORDER BY dr.date DESC
    LIMIT 5
  `;
  return await db.getAllAsync(query, [userId]);
}

static async getSleepMoodCorrelation(userId: number) {
  // Uma query para o seu TG: Média de humor para quem dorme pouco vs quem dorme muito
  const query = `
    SELECT 
      CASE WHEN CAST(wake_up_time AS INTEGER) < 7 THEN 'Pouco Sono (<7h)' ELSE 'Sono Suficiente (>=7h)' END as sleep_category,
      AVG(mood_score) as avg_mood
    FROM daily_records dr
    JOIN sleep_records sr ON dr.date = sr.record_date
    WHERE dr.user_id = ?
    GROUP BY sleep_category
  `;
  return await db.getAllAsync(query, [userId]);
}
}