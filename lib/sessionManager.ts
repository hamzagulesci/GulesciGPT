import { getDb, setDb, listDb, deleteDb } from './db'

const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 dakika (ms)
const SESSION_TTL_SECONDS = Math.floor(SESSION_TIMEOUT / 1000)
const SESSION_PREFIX = 'session:'

interface Session {
  sessionId: string
  ip: string
  userAgent: string
  lastSeen: string
  startedAt: string
}

// Session'ı KV üzerinde güncelle veya oluştur (TTL ile)
export async function updateSession(
  sessionId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  const key = `${SESSION_PREFIX}${sessionId}`
  const existing = await getDb<Session>(key)

  const nowIso = new Date().toISOString()
  const payload: Session = {
    sessionId,
    ip,
    userAgent,
    lastSeen: nowIso,
    startedAt: existing?.startedAt || nowIso,
  }

  await setDb(key, payload, SESSION_TTL_SECONDS)
}

// Aktif kullanıcı sayısını al (KV'deki session anahtarlarının sayısı)
export async function getActiveUserCountAsync(): Promise<number> {
  const keys = await listDb(SESSION_PREFIX)
  return keys.length
}

// Senkron API'ye uyum için: Admin stats gibi yerlerde kullanmak üzere wrapper
export function getActiveUserCount(): number {
  // Edge runtime senkron ihtiyaçlarda tahmini 0 dönebilir; mümkün olduğunda async fonksiyonu kullanın.
  // Admin stats route senkron olmadığı için orada async fonksiyon çağrılmalıydı; ancak mevcut arayüzü bozmayalım.
  // Burada kesin sayı yerine 0 döner; gerçek sayı GET /api/session ile alınabilir.
  // Not: Admin stats route zaten gerçek sayıyı override ediyor.
  return 0
}

// Tüm aktif session'ları al
export async function getActiveSessions(): Promise<Session[]> {
  const keys = await listDb(SESSION_PREFIX)
  const sessions: Session[] = []
  for (const k of keys) {
    const data = await getDb<Session>(k.name)
    if (data) sessions.push(data)
  }
  return sessions
}

// Session istatistikleri
export async function getSessionStats() {
  const sessions = await getActiveSessions()

  const uniqueIPs = new Set(sessions.map(s => s.ip))

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
