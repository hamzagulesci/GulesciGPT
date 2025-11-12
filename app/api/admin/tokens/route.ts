import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt';
import { getTokenStats } from '@/lib/tokenTracker'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

async function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return null;
  }

  return await verifyToken(token);
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
