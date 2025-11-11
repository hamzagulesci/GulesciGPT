import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getTokenStats } from '@/lib/tokenTracker'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin auth kontrolü
async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

// GET: Token istatistiklerini getir
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const stats = getTokenStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Token stats fetch hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
