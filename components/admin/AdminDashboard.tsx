'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeyManagementTab } from './KeyManagementTab'
import { StatsTab } from './StatsTab'
import { SystemStatusTab } from './SystemStatusTab'
import { SettingsTab } from './SettingsTab'
import { ErrorsTab } from './ErrorsTab'
import { TokensTab } from './TokensTab'
import { AuditTab } from './AuditTab'

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
    activeUsers: number
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

  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem('jwt');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  };

  const fetchKeys = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/keys');
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'API key getirme başarısız');
      }
      setKeys(data.keys)
    } catch (error: any) {
      toast.error(error.message || 'Veri yüklenemedi')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/stats');
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'İstatistik getirme başarısız');
      }
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
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'var(--bg-primary)' }}
      >
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

  return (
    <div
      className="container mx-auto p-3 md:p-6 min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          HamzaGPT Admin
        </h1>
        <p className="mt-1 text-sm md:text-base" style={{ color: 'var(--text-tertiary)' }}>
          Sistem yönetimi
        </p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList
            className="inline-flex w-auto md:grid md:w-full md:grid-cols-4 xl:grid-cols-7 md:max-w-5xl gap-2"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}
          >
          <TabsTrigger
            value="keys"
            className="text-xs md:text-sm px-2 md:px-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="API Key yönetimi"
          >
            Keys
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="text-xs md:text-sm px-2 md:px-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="İstatistikler"
          >
            Stats
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="text-xs md:text-sm px-2 md:px-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Sistem durumu"
          >
            Sistem
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-xs md:text-sm px-2 md:px-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Ayarlar"
          >
            Ayarlar
          </TabsTrigger>
          <TabsTrigger
            value="errors"
            className="text-xs md:text-sm px-2 md:px-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Hata Logları"
          >
            Hatalar
          </TabsTrigger>
          <TabsTrigger
            value="tokens"
            className="text-xs md:text-sm px-2 md:px-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Token İstatistikleri"
          >
            Tokenler
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="text-xs md:text-sm px-2 md:px-4"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Audit Logları"
          >
            Audit
          </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="keys" className="mt-3 md:mt-6">
          <KeyManagementTab keys={keys} onRefresh={refreshData} />
        </TabsContent>

        <TabsContent value="stats" className="mt-3 md:mt-6">
          <StatsTab data={statsData} />
        </TabsContent>

        <TabsContent value="system" className="mt-3 md:mt-6">
          <SystemStatusTab
            stats={statsData.stats}
            keyStats={statsData.keyStats}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-3 md:mt-6">
          <SettingsTab />
        </TabsContent>

        <TabsContent value="errors" className="mt-3 md:mt-6">
          <ErrorsTab />
        </TabsContent>

        <TabsContent value="tokens" className="mt-3 md:mt-6">
          <TokensTab />
        </TabsContent>

        <TabsContent value="audit" className="mt-3 md:mt-6">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
