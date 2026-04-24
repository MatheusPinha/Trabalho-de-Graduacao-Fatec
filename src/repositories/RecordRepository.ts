import { db } from '../database/initDB';

export class RecordRepository {
  
  static async getRecordById(recordId: number) {
    // 1. Busca o registro principal
    const record = await db.getFirstAsync<any>(
      'SELECT * FROM daily_records WHERE id = ?',
      [recordId]
    );
    
    if (!record) throw new Error("Registro não encontrado");

    // 2. Busca as tags da tabela nova (agora ela existe!)
    let activities: any[] = [];
    try {
      activities = await db.getAllAsync<any>(
        'SELECT activity_id FROM record_activities WHERE record_id = ?',
        [recordId]
      );
    } catch (e) {
      console.warn("Aviso: Tabela de atividades ainda vazia ou não criada.");
    }

    return {
      ...record,
      activities: activities.map(a => a.activity_id)
    };
  }

  static async updateDailyRecord(recordId: number, moodScore: number, notes: string, activityIds: number[]) {
    await db.runAsync(
      'UPDATE daily_records SET mood_score = ?, notes = ? WHERE id = ?',
      [moodScore, notes, recordId]
    );

    // Limpa tags antigas e salva as novas
    await db.runAsync('DELETE FROM record_activities WHERE record_id = ?', [recordId]);
    for (const actId of activityIds) {
      await db.runAsync(
        'INSERT INTO record_activities (record_id, activity_id) VALUES (?, ?)',
        [recordId, actId]
      );
    }
  }

  static async createDailyRecordWithActivities(userId: number, date: string, moodScore: number, notes: string, activityIds: number[]) {
    const recordResult = await db.runAsync(
      'INSERT INTO daily_records (user_id, date, mood_score, notes) VALUES (?, ?, ?, ?)',
      [userId, date, moodScore, notes]
    );
    const recordId = recordResult.lastInsertRowId;
    
    for (const actId of activityIds) {
      await db.runAsync('INSERT INTO record_activities (record_id, activity_id) VALUES (?, ?)', [recordId, actId]);
    }
    return recordId;
  }

  // MÉTODO RESTAURADO: Devolve as informações do Dashboard que haviam sumido!
  static async getDashboardData(userId: number) {
    const query = `
      SELECT 
        dr.id, 
        dr.date, 
        dr.mood_score, 
        dr.notes,
        sr.perceived_quality as sleep_quality, 
        sr.wake_up_time as sleep_hours
      FROM daily_records dr
      LEFT JOIN sleep_records sr ON dr.date = sr.record_date AND dr.user_id = sr.user_id
      WHERE dr.user_id = ? 
      ORDER BY dr.date DESC 
      LIMIT 15
    `;
    return await db.getAllAsync(query, [userId]);
  }
}