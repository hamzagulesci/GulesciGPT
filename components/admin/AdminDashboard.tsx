'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeyManagementTab } from './KeyManagementTab'
import { StatsTab } from './StatsTab'
import { SystemStatusTab } from './SystemStatusTab'

interface ApiKey {
  id: string
  key: string
  isActive: boolean
  usageCount: number
  addedAt: string
  lastUsed: string | null
}

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

export function AdminDashboard() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/admin/keys')

      if (!response.ok) {
        throw new Error('API key getirme başarısız')
      }

      const data = await response.json()
      setKeys(data.keys)
    } catch (error: any) {
      toast.error(error.message || 'Veri yüklenemedi')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')

      if (!response.ok) {
        throw new Error('İstatistik getirme başarısız')
      }

      const data = await response.json()
      setStatsData(data)
    } catch (error: any) {
      toast.error(error.message || 'Veri yüklenemedi')
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    await Promise.all([fetchKeys(), fetchStats()])
    setIsLoading(false)
  }

  useEffect(() => {
    refreshData()

    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading || !statsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">GüleşciGPT Admin Paneli</h1>
        <p className="text-gray-600 mt-1">Sistem yönetimi ve istatistikler</p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="keys">API Keyler</TabsTrigger>
          <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-6">
          <KeyManagementTab keys={keys} onRefresh={refreshData} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsTab data={statsData} />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemStatusTab
            stats={statsData.stats}
            keyStats={statsData.keyStats}
            onRefresh={refreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
