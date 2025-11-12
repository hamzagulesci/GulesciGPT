'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeyManagementTab } from './KeyManagementTab'
import { StatsTab } from './StatsTab'
import { ErrorsTab } from './ErrorsTab'
import { SystemStatusTab } from './SystemStatusTab'
import { SettingsTab } from './SettingsTab'
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

  const fetchAllData = async () => {
    const token = localStorage.getItem('jwt')
    if (!token) {
      toast.error('Yetkilendirme tokeni bulunamadı. Lütfen tekrar giriş yapın.')
      setIsLoading(false)
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [keysRes, statsRes] = await Promise.all([
        fetch('/api/admin/keys', { headers }),
        fetch('/api/admin/stats', { headers }),
      ])

      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setKeys(keysData.keys)
      } else {
        toast.error('API key getirme başarısız')
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStatsData(statsData)
      } else {
        toast.error('İstatistik getirme başarısız')
      }
    } catch (error: any) {
      toast.error(error.message || 'Veri alınırken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData() // Initial fetch
    const interval = setInterval(fetchAllData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--text-primary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Yönetim Paneli</h1>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('jwt')
              window.location.href = '/login'
            }}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            Çıkış Yap
          </Button>
        </header>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-4">
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="errors">Hatalar</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
            <TabsTrigger value="tokens">Tokenler</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            {statsData ? <StatsTab data={statsData} /> : <p>İstatistikler yüklenemedi.</p>}
          </TabsContent>

          <TabsContent value="keys">
            <KeyManagementTab keys={keys} onRefresh={fetchAllData} />
          </TabsContent>

          <TabsContent value="errors">
            <ErrorsTab />
          </TabsContent>

          <TabsContent value="system">
            {statsData ? <SystemStatusTab stats={statsData.stats} keyStats={statsData.keyStats} onRefresh={fetchAllData} /> : <p>Sistem durumu yüklenemedi.</p>}
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="tokens">
            <TokensTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
