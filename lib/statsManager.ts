import fs from 'fs'
import path from 'path'
import lockfile from 'proper-lockfile'

const DATA_DIR = path.join(process.cwd(), 'data')
const STATS_FILE = path.join(DATA_DIR, 'stats.json')

export interface Stats {
  totalMessages: number
  totalChats: number
  messagesByDate: Record<string, number>
  messagesByModel: Record<string, number>
  lastUpdated: string | null
  averageResponseTime: number
  responseTimes: number[]
}

// Data klasörünü oluştur (yoksa)
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(STATS_FILE)) {
    const initialStats: Stats = {
      totalMessages: 0,
      totalChats: 0,
      messagesByDate: {},
      messagesByModel: {},
      lastUpdated: null,
      averageResponseTime: 0,
      responseTimes: []
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2), 'utf-8')
  }
}

// İstatistikleri oku
function readStats(): Stats {
  ensureDataDir()
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Stats okuma hatası:', error)
    return {
      totalMessages: 0,
      totalChats: 0,
      messagesByDate: {},
      messagesByModel: {},
      lastUpdated: null,
      averageResponseTime: 0,
      responseTimes: []
    }
  }
}

// İstatistikleri yaz (file locking ile)
async function writeStats(stats: Stats): Promise<void> {
  ensureDataDir()

  try {
    let release: (() => Promise<void>) | null = null
    try {
      release = await lockfile.lock(STATS_FILE, {
        retries: {
          retries: 5,
          minTimeout: 100,
          maxTimeout: 500
        }
      })
    } catch (err) {
      console.warn('Lock alınamadı, devam ediliyor:', err)
    }

    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8')

    if (release) {
      await release()
    }
  } catch (error) {
    console.error('Stats yazma hatası:', error)
    throw error
  }
}

// Mesaj sayısını artır
export async function incrementMessageCount(model: string): Promise<void> {
  const stats = readStats()

  stats.totalMessages += 1

  // Bugünün tarihi (YYYY-MM-DD formatında)
  const today = new Date().toISOString().split('T')[0]
  stats.messagesByDate[today] = (stats.messagesByDate[today] || 0) + 1

  // Model bazlı istatistik
  stats.messagesByModel[model] = (stats.messagesByModel[model] || 0) + 1

  stats.lastUpdated = new Date().toISOString()

  await writeStats(stats)
}

// Yeni chat sayısını artır
export async function incrementChatCount(): Promise<void> {
  const stats = readStats()
  stats.totalChats += 1
  stats.lastUpdated = new Date().toISOString()
  await writeStats(stats)
}

// Yanıt süresini ekle (rolling average - son 100 yanıt)
export async function addResponseTime(ms: number): Promise<void> {
  const stats = readStats()

  stats.responseTimes.push(ms)

  // Son 100 yanıt süresini tut
  if (stats.responseTimes.length > 100) {
    stats.responseTimes = stats.responseTimes.slice(-100)
  }

  // Ortalama hesapla
  const sum = stats.responseTimes.reduce((a, b) => a + b, 0)
  stats.averageResponseTime = Math.round(sum / stats.responseTimes.length)

  stats.lastUpdated = new Date().toISOString()

  await writeStats(stats)
}

// Tüm istatistikleri al
export function getStats(): Stats {
  return readStats()
}

// Son N gün mesaj trendini al
export function getMessageTrend(days: number = 7): { date: string; count: number }[] {
  const stats = readStats()
  const result: { date: string; count: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    result.push({
      date: dateStr,
      count: stats.messagesByDate[dateStr] || 0
    })
  }

  return result
}

// Model kullanım sıralamasını al (top N)
export function getTopModels(limit: number = 10): { model: string; count: number }[] {
  const stats = readStats()

  const modelArray = Object.entries(stats.messagesByModel)
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return modelArray
}

// Tüm istatistikleri sıfırla (tehlikeli işlem)
export async function resetStats(): Promise<void> {
  const initialStats: Stats = {
    totalMessages: 0,
    totalChats: 0,
    messagesByDate: {},
    messagesByModel: {},
    lastUpdated: new Date().toISOString(),
    averageResponseTime: 0,
    responseTimes: []
  }

  await writeStats(initialStats)
}

// Bugün atılan mesaj sayısı
export function getTodayMessageCount(): number {
  const stats = readStats()
  const today = new Date().toISOString().split('T')[0]
  return stats.messagesByDate[today] || 0
}
