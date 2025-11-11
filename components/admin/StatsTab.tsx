'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StatsData {
  stats: {
    totalMessages: number
    totalChats: number
    todayMessages: number
    averageResponseTime: number
    lastUpdated: string | null
  }
  messageTrend: { date: string; count: number }[]
  topModels: { model: string; count: number }[]
  keyStats: {
    active: number
    inactive: number
    total: number
  }
}

interface StatsTabProps {
  data: StatsData
}

export function StatsTab({ data }: StatsTabProps) {
  const { stats, messageTrend, topModels, keyStats } = data

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Bugün</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.todayMessages}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Mesajlar</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.totalMessages}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">Sohbetler</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{stats.totalChats}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 md:p-6">
            <CardDescription className="text-xs md:text-sm">API Keys</CardDescription>
            <CardTitle className="text-xl md:text-3xl">{keyStats.active}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Message Trend Chart */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-xl">Son 7 Gün</CardTitle>
          <CardDescription className="text-xs md:text-sm">Günlük mesaj sayısı</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messageTrend}>
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
                stroke="#2563eb"
                strokeWidth={2}
                name="Mesajlar"
                dot={{ fill: '#2563eb', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Models Chart */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-xl">Top 10 Model</CardTitle>
          <CardDescription className="text-xs md:text-sm">En çok kullanılan</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topModels.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="model"
                width={100}
                tick={{ fontSize: 9 }}
                tickFormatter={(model) => {
                  // Model adını kısalt
                  const parts = model.split('/')
                  const name = parts[parts.length - 1]
                  return name.length > 15 ? name.substring(0, 12) + '...' : name
                }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="count" fill="#10b981" name="Kullanım" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
