'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface TokenStats {
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  totalCost: number
  todayUsage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }
  last7Days: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }
  byModel: {
    model: string
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }[]
  dailyTrend: {
    date: string
    tokens: number
    cost: number
  }[]
}

export function TokensTab() {
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTokenStats = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/admin/tokens', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token istatistikleri alınamadı')
      }

      const data = await response.json()
      setTokenStats(data)
    } catch (error: any) {
      toast.error(error.message || 'Veri yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTokenStats()

    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(fetchTokenStats, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading || !tokenStats) {
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

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M'
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCost = (cost: number) => {
    return '$' + cost.toFixed(4)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Bugün</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{formatNumber(tokenStats.todayUsage.totalTokens)}</CardTitle>
            <CardDescription className="text-xs" style={{ color: 'var(--color-action)' }}>
              {formatCost(tokenStats.todayUsage.cost)}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Son 7 Gün</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{formatNumber(tokenStats.last7Days.totalTokens)}</CardTitle>
            <CardDescription className="text-xs" style={{ color: 'var(--color-action)' }}>
              {formatCost(tokenStats.last7Days.cost)}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Toplam Token</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{formatNumber(tokenStats.totalTokens)}</CardTitle>
            <CardDescription className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {formatNumber(tokenStats.totalInputTokens)} giriş / {formatNumber(tokenStats.totalOutputTokens)} çıkış
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Tahmini Maliyet</CardDescription>
            <CardTitle className="text-xl md:text-3xl text-green-500">{formatCost(tokenStats.totalCost)}</CardTitle>
            <CardDescription className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Tüm zamanlar
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-xl">Günlük Kullanım</CardTitle>
          <CardDescription className="text-xs md:text-sm">Token kullanımı ve maliyet trendi</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tokenStats.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(date) => {
                  const d = new Date(date)
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10 }}
                tickFormatter={formatNumber}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10 }}
                tickFormatter={formatCost}
              />
              <Tooltip
                labelFormatter={(date) => {
                  const d = new Date(date as string)
                  return d.toLocaleDateString('tr-TR')
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'Tokenler') {
                    return [formatNumber(value), name]
                  } else {
                    return [formatCost(value), name]
                  }
                }}
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="tokens"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Tokenler"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                stroke="#10b981"
                strokeWidth={2}
                name="Maliyet"
                dot={{ fill: '#10b981', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Usage by Model */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-xl">Model Bazlı Kullanım</CardTitle>
          <CardDescription className="text-xs md:text-sm">Top 10 model</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tokenStats.byModel.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatNumber} />
              <YAxis
                type="category"
                dataKey="model"
                width={120}
                tick={{ fontSize: 9 }}
                tickFormatter={(model) => {
                  const parts = model.split('/')
                  const name = parts[parts.length - 1]
                  return name.length > 18 ? name.substring(0, 15) + '...' : name
                }}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'Maliyet') {
                    return [formatCost(value), name]
                  }
                  return [formatNumber(value), name]
                }}
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
              />
              <Legend />
              <Bar dataKey="totalTokens" fill="#3b82f6" name="Tokenler" />
              <Bar dataKey="cost" fill="#10b981" name="Maliyet" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Details Table */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-xl">Detaylı İstatistikler</CardTitle>
          <CardDescription className="text-xs md:text-sm">Model bazlı token dağılımı</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th className="text-left p-2" style={{ color: 'var(--text-secondary)' }}>Model</th>
                  <th className="text-right p-2" style={{ color: 'var(--text-secondary)' }}>Giriş</th>
                  <th className="text-right p-2" style={{ color: 'var(--text-secondary)' }}>Çıkış</th>
                  <th className="text-right p-2" style={{ color: 'var(--text-secondary)' }}>Toplam</th>
                  <th className="text-right p-2" style={{ color: 'var(--text-secondary)' }}>Maliyet</th>
                </tr>
              </thead>
              <tbody>
                {tokenStats.byModel.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: index % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'
                    }}
                  >
                    <td className="p-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.model.split('/').pop()}
                    </td>
                    <td className="text-right p-2" style={{ color: 'var(--text-secondary)' }}>
                      {formatNumber(item.inputTokens)}
                    </td>
                    <td className="text-right p-2" style={{ color: 'var(--text-secondary)' }}>
                      {formatNumber(item.outputTokens)}
                    </td>
                    <td className="text-right p-2" style={{ color: 'var(--text-primary)' }}>
                      {formatNumber(item.totalTokens)}
                    </td>
                    <td className="text-right p-2" style={{ color: 'var(--color-action)' }}>
                      {formatCost(item.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
