'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SystemStatusTabProps {
  stats: {
    totalMessages: number
    totalChats: number
    todayMessages: number
    averageResponseTime: number
    lastUpdated: string | null
  }
  keyStats: {
    active: number
    inactive: number
    total: number
  }
  onRefresh: () => void
}

export function SystemStatusTab({ stats, keyStats, onRefresh }: SystemStatusTabProps) {
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleResetStats = async () => {
    setIsResetting(true)

    try {
      const response = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sıfırlama başarısız')
      }

      toast.success('İstatistikler sıfırlandı')
      setShowResetDialog(false)
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setIsResetting(false)
    }
  }

  // Uptime hesapla (basit - sayfa yüklendiğinden itibaren)
  const [uptime] = useState(() => {
    const now = new Date()
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
  })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Sistem Durumu</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>API Key İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Aktif Key Sayısı:</span>
              <span className="font-semibold text-green-600">{keyStats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pasif Key Sayısı:</span>
              <span className="font-semibold text-red-600">{keyStats.inactive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Key:</span>
              <span className="font-semibold">{keyStats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performans</CardTitle>
            <CardDescription className="text-xs">Formül: Ortalama = Toplam yanıt süresi / Yanıt sayısı</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ortalama Yanıt Süresi:</span>
              <span className="font-semibold">{Math.max(0, Math.round(stats.averageResponseTime)).toLocaleString('tr-TR')} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bugünkü Mesajlar:</span>
              <span className="font-semibold">{stats.todayMessages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Mesajlar:</span>
              <span className="font-semibold">{stats.totalMessages}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sistem Uptime:</span>
              <span className="font-semibold">{uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Son Güncelleme:</span>
              <span className="font-semibold text-sm">
                {stats.lastUpdated
                  ? new Date(stats.lastUpdated).toLocaleString('tr-TR')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Sohbetler:</span>
              <span className="font-semibold">{stats.totalChats}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Tehlikeli İşlemler</CardTitle>
            <CardDescription>Bu işlemler geri alınamaz!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowResetDialog(true)}
              className="w-full"
            >
              Tüm İstatistikleri Sıfırla
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İstatistikleri Sıfırla</DialogTitle>
            <DialogDescription>
              Tüm istatistikler kalıcı olarak silinecek. Bu işlem geri alınamaz!
              Devam etmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={isResetting}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetStats}
              disabled={isResetting}
            >
              {isResetting ? 'Sıfırlanıyor...' : 'Evet, Sıfırla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
