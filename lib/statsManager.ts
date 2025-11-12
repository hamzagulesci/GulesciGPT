import { getDb, setDb } from './db';

const STATS_KEY = 'app_stats';

// İstatistik verileri için arayüz
export interface StatsData {
  totalMessages: number;
  totalChats: number;
  messagesByDate: Record<string, number>;
  messagesByModel: Record<string, number>;
  lastUpdated: string | null;
  activeUsers: number; // Son 5 dakika içinde aktif olan kullanıcılar
  averageResponseTime: number;
}

// Başlangıç istatistik verisi
const initialStats: StatsData = {
  totalMessages: 0,
  totalChats: 0,
  messagesByDate: {},
  messagesByModel: {},
  lastUpdated: null,
  activeUsers: 0,
  averageResponseTime: 0,
};

// İstatistikleri KV'den al
async function getStatsFromDb(): Promise<StatsData> {
  const stats = await getDb<StatsData>(STATS_KEY);
  return stats || initialStats;
}

// İstatistikleri KV'ye kaydet
async function persistStats(stats: StatsData): Promise<void> {
  stats.lastUpdated = new Date().toISOString();
  await setDb(STATS_KEY, stats);
}

// Mesaj sayısını artır
export async function incrementMessageCount(model: string): Promise<void> {
  const stats = await getStatsFromDb();
  const today = new Date().toISOString().split('T')[0];

  stats.totalMessages++;
  stats.messagesByDate[today] = (stats.messagesByDate[today] || 0) + 1;
  stats.messagesByModel[model] = (stats.messagesByModel[model] || 0) + 1;

  await persistStats(stats);
}

// Sohbet sayısını artır
export async function incrementChatCount(): Promise<void> {
  const stats = await getStatsFromDb();
  stats.totalChats++;
  await persistStats(stats);
}

// Aktif kullanıcı sayısını güncelle
export async function setActiveUsers(count: number): Promise<void> {
  const stats = await getStatsFromDb();
  stats.activeUsers = count;
  await persistStats(stats);
}

// Tüm istatistikleri al
export async function getStats(): Promise<StatsData> {
  return await getStatsFromDb();
}

// Ortalama yanıt süresini ve toplam yanıtları günceller
export async function addResponseTime(newTime: number): Promise<void> {
  const stats = await getStatsFromDb();
  const total = stats.totalMessages; // Use total messages as the count of responses
  
  // Prevent division by zero if it's the first message
  if (total > 0) {
    stats.averageResponseTime =
      (stats.averageResponseTime * (total - 1) + newTime) / total;
  } else {
    stats.averageResponseTime = newTime;
  }
  
  await persistStats(stats);
}

// Son N gün mesaj trendini al
export async function getMessageTrend(days: number = 7): Promise<{ date: string; count: number }[]> {
  const stats = await getStatsFromDb();
  const result: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    result.push({
      date: dateStr,
      count: stats.messagesByDate[dateStr] || 0,
    });
  }

  return result;
}

// Model kullanım sıralamasını al (top N)
export async function getTopModels(limit: number = 10): Promise<{ model: string; count: number }[]> {
  const stats = await getStatsFromDb();
  
  const modelArray = Object.entries(stats.messagesByModel)
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return modelArray;
}

// Tüm istatistikleri sıfırla (tehlikeli işlem)
export async function resetStats(): Promise<void> {
  await setDb(STATS_KEY, initialStats);
}
