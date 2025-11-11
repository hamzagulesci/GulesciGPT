import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getStats, getMessageTrend, getTopModels, getTodayMessageCount, resetStats } from '@/lib/statsManager'
import { getAllKeys } from '@/lib/keyManager'
import { getActiveUserCount, getSessionStats } from '@/lib/sessionManager'

// Middleware: Admin auth kontrolü
async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

// GET: İstatistikleri getir
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const stats = getStats()
    const todayMessages = getTodayMessageCount()
    const messageTrend = getMessageTrend(7) // Son 7 gün
    const topModels = getTopModels(10) // Top 10 model

    // Aktif/pasif key sayısı
    const keys = getAllKeys()
    const activeKeyCount = keys.filter(k => k.isActive).length
    const inactiveKeyCount = keys.filter(k => !k.isActive).length

    // Aktif kullanıcı sayısı ve session istatistikleri
    const activeUsers = getActiveUserCount()
    const sessionStats = getSessionStats()

    return NextResponse.json({
      stats: {
        totalMessages: stats.totalMessages,
        totalChats: stats.totalChats,
        todayMessages,
        averageResponseTime: stats.averageResponseTime,
        lastUpdated: stats.lastUpdated,
        activeUsers
      },
      messageTrend,
      topModels,
      keyStats: {
        active: activeKeyCount,
        inactive: inactiveKeyCount,
        total: keys.length
      },
      sessionStats
    })
  } catch (error) {
    console.error('Stats getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// POST: İstatistikleri sıfırla
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const { action } = await request.json()

    if (action === 'reset') {
      await resetStats()
      return NextResponse.json({ success: true, message: 'İstatistikler sıfırlandı' })
    }

    return NextResponse.json(
      { error: 'Geçersiz aksiyon' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Stats sıfırlama hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
