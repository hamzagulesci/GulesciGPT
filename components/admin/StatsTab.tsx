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
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bugün Atılan Mesajlar</CardDescription>
            <CardTitle className="text-3xl">{stats.todayMessages}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Mesajlar</CardDescription>
            <CardTitle className="text-3xl">{stats.totalMessages}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Sohbetler</CardDescription>
            <CardTitle className="text-3xl">{stats.totalChats}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktif API Keyler</CardDescription>
            <CardTitle className="text-3xl">{keyStats.active}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Message Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Son 7 Gün Mesaj Trendi</CardTitle>
          <CardDescription>Günlük mesaj sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={messageTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date)
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => {
                  const d = new Date(date as string)
                  return d.toLocaleDateString('tr-TR')
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                name="Mesajlar"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Models Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Model Kullanım Dağılımı</CardTitle>
          <CardDescription>En çok kullanılan 10 model</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topModels} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="model"
                width={200}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Kullanım" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
