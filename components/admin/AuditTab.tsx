'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export interface AuditLog {
  id: string
  timestamp: string
  action: 'login' | 'logout' | 'add_key' | 'remove_key' | 'toggle_key' | 'clear_errors' | 'settings_change' | 'view_stats'
  details: string
  ip?: string
  userAgent?: string
  success: boolean
}

interface AuditStats {
  totalLogs: number
  last24Hours: number
  last7Days: number
  byAction: Record<string, number>
  recentLogs: AuditLog[]
}

interface AuditData {
  stats: AuditStats
  trend: { date: string; count: number }[]
}

const ACTION_LABELS: Record<string, string> = {
  login: 'Giriş',
  logout: 'Çıkış',
  add_key: 'API Key Ekleme',
  remove_key: 'API Key Silme',
  toggle_key: 'API Key Değiştirme',
  clear_errors: 'Hata Logları Temizleme',
  settings_change: 'Ayar Değiştirme',
  view_stats: 'İstatistik Görüntüleme'
}

const ACTION_COLORS: Record<string, string> = {
  login: '#10b981',
  logout: '#6b7280',
  add_key: '#3b82f6',
  remove_key: '#ef4444',
  toggle_key: '#f59e0b',
  clear_errors: '#8b5cf6',
  settings_change: '#06b6d4',
  view_stats: '#84cc16'
}

export function AuditTab() {
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const fetchAudit = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null
      const response = await fetch('/api/admin/audit', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Audit verileri alınamadı')
      }

      const data = await response.json()
      setAuditData(data)
      setLastUpdatedAt(new Date())
    } catch (error: any) {
      toast.error(error.message || 'Veri yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAudit()
  }, [])

  if (isLoading || !auditData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--color-action)' }}
          />
          <p style={{ color: 'var(--text-tertiary)' }}>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const { stats, trend } = auditData

  // Prepare action data for bar chart
  const actionData = Object.entries(stats.byAction).map(([action, count]) => ({
    action: ACTION_LABELS[action] || action,
    count
  }))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs md:text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Son güncelleme: {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString('tr-TR') : '—'}
        </div>
        <button
          onClick={fetchAudit}
          className="px-3 py-1.5 rounded text-sm"
          style={{ background: 'var(--color-action)', color: 'var(--text-primary)' }}
        >
          Yenile
        </button>
      </div>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Toplam Log</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.totalLogs}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Son 24 Saat</CardDescription>
            <CardTitle className="text-xl md:text-3xl text-blue-500">{stats.last24Hours}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Son 7 Gün</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.last7Days}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Trend */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-xl">Aktivite Trendi</CardTitle>
            <CardDescription className="text-xs md:text-sm">Son 7 gün</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(date) => {
                    const d = new Date(date)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  labelFormatter={(date) => {
                    const d = new Date(date as string)
                    return d.toLocaleDateString('tr-TR')
                  }}
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="İşlemler"
                  dot={{ fill: '#3b82f6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actions Distribution */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-xl">İşlem Dağılımı</CardTitle>
            <CardDescription className="text-xs md:text-sm">İşlem tiplerine göre</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            {actionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={actionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="action"
                    tick={{ fontSize: 9 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" name="Adet" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Henüz audit kaydı yok
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div>
            <CardTitle className="text-base md:text-xl">Son İşlemler</CardTitle>
            <CardDescription className="text-xs md:text-sm">Son 50 audit kaydı</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          {stats.recentLogs.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {stats.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: (ACTION_COLORS[log.action] || '#6b7280') + '20',
                          color: ACTION_COLORS[log.action] || '#6b7280'
                        }}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      {log.success ? (
                        <span className="px-2 py-1 rounded text-xs" style={{ background: '#10b98120', color: '#10b981' }}>
                          ✓ Başarılı
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs" style={{ background: '#ef444420', color: '#ef4444' }}>
                          ✗ Başarısız
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(log.timestamp).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {log.details}
                  </p>
                  {log.ip && (
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      IP: {log.ip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-tertiary)' }}>Henüz audit kaydı yok</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
