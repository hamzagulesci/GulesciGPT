'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ErrorLog {
  id: string
  timestamp: string
  type: 'chat' | 'admin' | 'system' | 'api'
  error: string
  details?: string
  userAgent?: string
  ip?: string
  endpoint?: string
  statusCode?: number
}

interface ErrorStats {
  totalErrors: number
  last24Hours: number
  last7Days: number
  errorRate: number
  byType: {
    chat: number
    admin: number
    system: number
    api: number
  }
  recentErrors: ErrorLog[]
}

interface ErrorData {
  stats: ErrorStats
  trend: { date: string; count: number }[]
}

const TYPE_COLORS: Record<string, string> = {
  chat: '#ef4444',
  admin: '#f59e0b',
  system: '#8b5cf6',
  api: '#3b82f6'
}

const TYPE_LABELS: Record<string, string> = {
  chat: 'Chat',
  admin: 'Admin',
  system: 'Sistem',
  api: 'API'
}

export function ErrorsTab() {
  const [errorData, setErrorData] = useState<ErrorData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const fetchErrors = async () => {
    try {
      const response = await fetch('/api/admin/errors')

      if (!response.ok) {
        throw new Error('Hata verileri alınamadı')
      }

      const data = await response.json()
      setErrorData(data)
      setLastUpdatedAt(new Date())
    } catch (error: any) {
      toast.error(error.message || 'Veri yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm('Tüm hata loglarını temizlemek istediğinizden emin misiniz?')) {
      return
    }

    setIsClearing(true)
    try {
      const response = await fetch('/api/admin/errors', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Loglar temizlenemedi')
      }

      toast.success('Hata logları temizlendi')
      await fetchErrors()
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setIsClearing(false)
    }
  }

  useEffect(() => {
    fetchErrors()
  }, [])

  if (isLoading || !errorData) {
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

  const { stats, trend } = errorData

  // Pie chart data
  const pieData = Object.entries(stats.byType)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: TYPE_LABELS[type],
      value: count,
      color: TYPE_COLORS[type]
    }))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs md:text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Son güncelleme: {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString('tr-TR') : '—'}
        </div>
        <button
          onClick={fetchErrors}
          className="px-3 py-1.5 rounded text-sm"
          style={{ background: 'var(--color-action)', color: 'var(--text-primary)' }}
        >
          Yenile
        </button>
      </div>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Toplam</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.totalErrors}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Son 24 Saat</CardDescription>
            <CardTitle className="text-xl md:text-3xl text-red-500">{stats.last24Hours}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Son 7 Gün</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.last7Days}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Hata Oranı</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.errorRate}/saat</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Error Trend */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-xl">Hata Trendi</CardTitle>
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
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Hatalar"
                  dot={{ fill: '#ef4444', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Types */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-xl">Hata Tipleri</CardTitle>
            <CardDescription className="text-xs md:text-sm">Dağılım</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Henüz hata kaydı yok
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      <Card>
        <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base md:text-xl">Son Hatalar</CardTitle>
            <CardDescription className="text-xs md:text-sm">Son 20 hata kaydı</CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearLogs}
            disabled={isClearing}
          >
            {isClearing ? 'Temizleniyor...' : 'Logları Temizle'}
          </Button>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          {stats.recentErrors.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {stats.recentErrors.map((error) => (
                <div
                  key={error.id}
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
                          background: TYPE_COLORS[error.type] + '20',
                          color: TYPE_COLORS[error.type]
                        }}
                      >
                        {TYPE_LABELS[error.type]}
                      </span>
                      {error.statusCode && (
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'var(--bg-tertiary)' }}
                        >
                          {error.statusCode}
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(error.timestamp).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {error.error}
                  </p>
                  {error.details && (
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {error.details}
                    </p>
                  )}
                  {error.endpoint && (
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Endpoint: {error.endpoint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-tertiary)' }}>Henüz hata kaydı yok</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
