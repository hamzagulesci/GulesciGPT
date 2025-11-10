'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'

interface ApiKey {
  id: string
  key: string
  isActive: boolean
  usageCount: number
  addedAt: string
  lastUsed: string | null
}

interface KeyManagementTabProps {
  keys: ApiKey[]
  onRefresh: () => void
}

export function KeyManagementTab({ keys, onRefresh }: KeyManagementTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddKey = async () => {
    if (!newKey.trim()) {
      toast.error('API key gerekli')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ekleme başarısız')
      }

      toast.success('API key eklendi')
      setNewKey('')
      setShowAddDialog(false)
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Bu API key\'i silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Silme başarısız')
      }

      toast.success('API key silindi')
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    }
  }

  const handleToggleStatus = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, isActive: !isActive }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Güncelleme başarısız')
      }

      toast.success(`API key ${!isActive ? 'aktif' : 'pasif'} yapıldı`)
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">API Key Yönetimi</h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Key Ekle
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>API Key</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Kullanım</TableHead>
            <TableHead>Eklenme</TableHead>
            <TableHead>Son Kullanım</TableHead>
            <TableHead>Aksiyonlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                Henüz API key eklenmemiş
              </TableCell>
            </TableRow>
          ) : (
            keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-mono text-sm">
                  {key.id.substring(0, 8)}...
                </TableCell>
                <TableCell className="font-mono text-sm">{key.key}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggleStatus(key.id, key.isActive)}
                    className="flex items-center gap-1"
                  >
                    {key.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-sm">Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 text-sm">Pasif</span>
                      </>
                    )}
                  </button>
                </TableCell>
                <TableCell>{key.usageCount}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(key.addedAt)}
                </TableCell>
                <TableCell className="text-sm">
                  {key.lastUsed ? formatDate(key.lastUsed) : '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Key Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni API Key Ekle</DialogTitle>
            <DialogDescription>
              OpenRouter API key'inizi girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-or-v1-..."
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button onClick={handleAddKey} disabled={isLoading}>
              {isLoading ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
