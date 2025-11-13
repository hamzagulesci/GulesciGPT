import { NextRequest, NextResponse } from 'next/server'
import { updateSession, getActiveUserCountAsync } from '@/lib/sessionManager'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// GET: Aktif kullanıcı sayısını al
export async function GET() {
  try {
    const count = await getActiveUserCountAsync()

    return NextResponse.json({
      activeUsers: count,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Session GET hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// POST: Session'ı güncelle (heartbeat)
export async function POST(request: NextRequest) {
  try {
    // Session ID al veya oluştur
    let sessionId = request.cookies.get('session_id')?.value

    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }

    // IP al
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // User Agent al
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Session'ı güncelle
    await updateSession(sessionId, ip, userAgent)

    const response = NextResponse.json({
      success: true,
      sessionId
    })

    // Session ID'yi cookie'ye kaydet (5 dakika)
    response.cookies.set('session_id', sessionId, {
      maxAge: 5 * 60, // 5 dakika
      httpOnly: true,
      sameSite: 'strict',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Session POST hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
