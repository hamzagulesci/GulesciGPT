import fs from 'fs'
import path from 'path'
import lockfile from 'proper-lockfile'

const DATA_DIR = path.join(process.cwd(), 'data')
const SESSIONS_FILE = path.join(DATA_DIR, 'active-sessions.json')
const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 dakika

interface Session {
  sessionId: string
  ip: string
  userAgent: string
  lastSeen: string
  startedAt: string
}

// Data klasörünü oluştur
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, '[]', 'utf-8')
  }
}

// Session'ları oku
function readSessions(): Session[] {
  ensureDataDir()
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Session okuma hatası:', error)
    return []
  }
}

// Session'ları yaz
async function writeSessions(sessions: Session[]): Promise<void> {
  ensureDataDir()

  try {
    let release: (() => Promise<void>) | null = null
    try {
      release = await lockfile.lock(SESSIONS_FILE, {
        retries: {
          retries: 5,
          minTimeout: 100,
          maxTimeout: 500
        }
      })
    } catch (err) {
      console.warn('Lock alınamadı, devam ediliyor:', err)
    }

    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8')

    if (release) {
      await release()
    }
  } catch (error) {
    console.error('Session yazma hatası:', error)
    throw error
  }
}

// Eski session'ları temizle
function cleanExpiredSessions(sessions: Session[]): Session[] {
  const now = Date.now()
  return sessions.filter(session => {
    const lastSeen = new Date(session.lastSeen).getTime()
    return now - lastSeen < SESSION_TIMEOUT
  })
}

// Session'ı güncelle veya oluştur
export async function updateSession(
  sessionId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  let sessions = readSessions()

  // Eski session'ları temizle
  sessions = cleanExpiredSessions(sessions)

  const existingIndex = sessions.findIndex(s => s.sessionId === sessionId)

  if (existingIndex >= 0) {
    // Mevcut session'ı güncelle
    sessions[existingIndex].lastSeen = new Date().toISOString()
    sessions[existingIndex].ip = ip
    sessions[existingIndex].userAgent = userAgent
  } else {
    // Yeni session ekle
    sessions.push({
      sessionId,
      ip,
      userAgent,
      lastSeen: new Date().toISOString(),
      startedAt: new Date().toISOString()
    })
  }

  await writeSessions(sessions)
}

// Aktif kullanıcı sayısını al
export function getActiveUserCount(): number {
  let sessions = readSessions()
  sessions = cleanExpiredSessions(sessions)
  return sessions.length
}

// Tüm aktif session'ları al
export function getActiveSessions(): Session[] {
  let sessions = readSessions()
  return cleanExpiredSessions(sessions)
}

// Session istatistikleri
export function getSessionStats() {
  const sessions = getActiveSessions()

  // Unique IP'ler
  const uniqueIPs = new Set(sessions.map(s => s.ip))

  // En çok kullanılan browser'lar
  const browsers = sessions.map(s => {
    const ua = s.userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari')) return 'Safari'
    if (ua.includes('edge')) return 'Edge'
    return 'Other'
  })

  const browserCounts: Record<string, number> = {}
  browsers.forEach(b => {
    browserCounts[b] = (browserCounts[b] || 0) + 1
  })

  return {
    totalSessions: sessions.length,
    uniqueIPs: uniqueIPs.size,
    browsers: browserCounts,
    sessions: sessions.map(s => ({
      ip: s.ip,
      lastSeen: s.lastSeen,
      duration: Date.now() - new Date(s.startedAt).getTime()
    }))
  }
}
