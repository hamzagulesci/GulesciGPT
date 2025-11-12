import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getAuditStats, getAuditTrend, clearAuditLogs } from '@/lib/auditLogger'

export const runtime = 'edge'
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

// GET: Audit istatistiklerini getir
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const stats = getAuditStats()
    const trend = getAuditTrend()

    return NextResponse.json({
      stats,
      trend
    })
  } catch (error) {
    console.error('Audit stats fetch hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// DELETE: Audit loglarını temizle
export async function DELETE(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    await clearAuditLogs()

    return NextResponse.json({
      success: true,
      message: 'Audit logları temizlendi'
    })
  } catch (error) {
    console.error('Audit logs clear hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
