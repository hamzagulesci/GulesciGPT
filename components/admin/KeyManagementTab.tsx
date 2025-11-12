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
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = localStorage.getItem('jwt');
      const response = await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: keyId, isActive: !isActive }),
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
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          API Key Yönetimi
        </h3>
        <Button
          onClick={() => setShowAddDialog(true)}
          style={{
            background: 'var(--color-action)',
            color: 'var(--text-primary)'
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Key Ekle
        </Button>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)'
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: '1px solid var(--border-color)' }}>
              <TableHead style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>ID</TableHead>
              <TableHead style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>API Key</TableHead>
              <TableHead style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>Durum</TableHead>
              <TableHead style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>Kullanım</TableHead>
              <TableHead style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>Eklenme</TableHead>
              <TableHead style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>Son Kullanım</TableHead>
              <TableHead style={{ color: 'var(--text-primary)', background: 'var(--bg-tertiary)' }}>Aksiyonlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center" style={{ color: 'var(--text-muted)' }}>
                  Henüz API key eklenmemiş
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => (
                <TableRow key={key.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <TableCell className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {key.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{key.key}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggleStatus(key.id, key.isActive)}
                    className="flex items-center gap-1"
                    aria-label={key.isActive ? "Pasife çevir" : "Aktife çevir"}
                  >
                    {key.isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4" style={{ color: '#4CAF50' }} />
                        <span className="text-sm" style={{ color: '#4CAF50' }}>Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" style={{ color: 'var(--color-alert)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-alert)' }}>Pasif</span>
                      </>
                    )}
                  </button>
                </TableCell>
                <TableCell style={{ color: 'var(--text-secondary)' }}>{key.usageCount}</TableCell>
                <TableCell className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDate(key.addedAt)}
                </TableCell>
                <TableCell className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {key.lastUsed ? formatDate(key.lastUsed) : '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    style={{
                      background: 'var(--color-alert)',
                      color: 'var(--text-primary)'
                    }}
                    aria-label="API key'i sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </div>

      {/* Add Key Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)'
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>
              Yeni API Key Ekle
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--text-tertiary)' }}>
              OpenRouter API key'inizi girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="apiKey" style={{ color: 'var(--text-secondary)' }}>
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-or-v1-..."
                disabled={isLoading}
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px'
                }}
                aria-label="OpenRouter API key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isLoading}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleAddKey}
              disabled={isLoading}
              style={{
                background: isLoading ? 'var(--border-color)' : 'var(--color-action)',
                color: 'var(--text-primary)'
              }}
            >
              {isLoading ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
