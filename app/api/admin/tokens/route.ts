import { NextRequest, NextResponse } from 'next/server'
import { getTokenStats } from '@/lib/tokenTracker'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Basit admin kontrolü
function isAdmin(request: NextRequest): boolean {
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

  if (!isAuthenticated) {
    return false
  }

  return true
}

// GET: Token istatistiklerini getir
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
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
