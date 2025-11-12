import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getErrorStats, getErrorTrend, clearErrorLogs } from '@/lib/errorLogger'
import { logAuditAction } from '@/lib/auditLogger'

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

// GET: Hata istatistiklerini getir
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const stats = getErrorStats()
    const trend = getErrorTrend()

    return NextResponse.json({
      stats,
      trend
    })
  } catch (error) {
    console.error('Error stats fetch hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// DELETE: Hata loglarını temizle
export async function DELETE(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    await clearErrorLogs()

    // Audit log
    await logAuditAction('clear_errors', 'Hata logları temizlendi', {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined
    })

    return NextResponse.json({
      success: true,
      message: 'Hata logları temizlendi'
    })
  } catch (error) {
    console.error('Error logs clear hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
