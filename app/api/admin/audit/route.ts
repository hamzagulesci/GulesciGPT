import { NextRequest, NextResponse } from 'next/server'
import { getAuditStats, getAuditTrend, clearAuditLogs } from '@/lib/auditLogger'
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

// GET: Audit istatistiklerini getir
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
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
  if (!isAdmin(request)) {
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
