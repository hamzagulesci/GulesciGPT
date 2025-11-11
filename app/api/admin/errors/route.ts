import { NextRequest, NextResponse } from 'next/server'
import { getErrorStats, getErrorTrend, clearErrorLogs } from '@/lib/errorLogger'
import { logAuditAction } from '@/lib/auditLogger'
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

// GET: Hata istatistiklerini getir
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
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
  if (!isAdmin(request)) {
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
