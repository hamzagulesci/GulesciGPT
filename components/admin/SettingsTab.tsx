'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { enableEncryption, disableEncryption, getEncryptionStatus } from '@/lib/encryptionWrapper'

export function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChanging, setIsChanging] = useState(false)
  const [encryptionStatus, setEncryptionStatus] = useState({ enabled: false, dataEncrypted: false })
  const [isTogglingEncryption, setIsTogglingEncryption] = useState(false)

  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Tüm alanları doldurun')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }

    if (newPassword.length < 12) {
      toast.error('Yeni şifre en az 12 karakter olmalı')
      return
    }

    setIsChanging(true)

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Şifre gücü hatası
          toast.error(
            <div>
              <div className="font-semibold mb-1">Zayıf şifre:</div>
              <ul className="text-sm">
                {data.details.map((err: string, i: number) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>,
            { duration: 5000 }
          )
        } else {
          toast.error(data.error || 'Şifre değiştirilemedi')
        }
        return
      }

      toast.success('Şifre başarıyla değiştirildi!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error('Sunucu hatası')
      console.error('Şifre değiştirme hatası:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const handleToggleEncryption = async () => {
    const confirmed = confirm(
      encryptionStatus.enabled
        ? 'Şifrelemeyi kapatmak istediğinizden emin misiniz? Verileriniz şifresiz saklanacak.'
        : 'Şifreleme etkinleştirilecek. Mevcut sohbet verileriniz güvenli bir şekilde şifrelenecek. Onaylıyor musunuz?'
    )

    if (!confirmed) return

    setIsTogglingEncryption(true)

    try {
      if (encryptionStatus.enabled) {
        await disableEncryption()
        toast.success('Şifreleme kapatıldı')
      } else {
        await enableEncryption()
        toast.success('Şifreleme etkinleştirildi! Verileriniz artık güvende.')
      }

      // Update status
      setEncryptionStatus(getEncryptionStatus())
    } catch (error: any) {
      toast.error('İşlem başarısız: ' + error.message)
      console.error('Encryption toggle error:', error)
    } finally {
      setIsTogglingEncryption(false)
    }
  }

  useEffect(() => {
    // Load encryption status on mount
    setEncryptionStatus(getEncryptionStatus())
  }, [])

  return (
    <div className="space-y-6">
      <Card style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Admin Şifresi Değiştir</CardTitle>
          <CardDescription style={{ color: 'var(--text-tertiary)' }}>
            Admin paneline giriş şifrenizi değiştirin. Güçlü bir şifre seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" style={{ color: 'var(--text-secondary)' }}>
              Mevcut Şifre
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mevcut şifreniz"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" style={{ color: 'var(--text-secondary)' }}>
              Yeni Şifre
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni şifreniz (min. 12 karakter)"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" style={{ color: 'var(--text-secondary)' }}>
              Yeni Şifre (Tekrar)
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni şifrenizi tekrar girin"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>

          <div
            className="p-3 rounded text-sm"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#60A5FA',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <strong>Güçlü şifre gereksinimleri:</strong>
            <ul className="mt-1 space-y-0.5 text-xs">
              <li>• En az 12 karakter</li>
              <li>• En az 1 büyük harf</li>
              <li>• En az 1 küçük harf</li>
              <li>• En az 1 rakam</li>
              <li>• En az 1 özel karakter (!@#$%^&*...)</li>
            </ul>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={isChanging}
            className="w-full"
            style={{
              background: 'var(--color-action)',
              color: 'var(--text-primary)'
            }}
          >
            {isChanging ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </Button>
        </CardContent>
      </Card>

      {/* Data Encryption Card */}
      <Card style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Veri Şifreleme</CardTitle>
          <CardDescription style={{ color: 'var(--text-tertiary)' }}>
            Kullanıcı sohbet verilerini tarayıcıda şifreleyerek koruyun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="p-4 rounded-lg border"
            style={{
              background: encryptionStatus.enabled
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(107, 114, 128, 0.1)',
              borderColor: encryptionStatus.enabled
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(107, 114, 128, 0.3)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4
                  className="font-semibold text-sm"
                  style={{
                    color: encryptionStatus.enabled ? '#10b981' : 'var(--text-secondary)'
                  }}
                >
                  {encryptionStatus.enabled ? '🔒 Şifreleme Aktif' : '🔓 Şifreleme Kapalı'}
                </h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Durum: {encryptionStatus.dataEncrypted ? 'Veriler şifreli' : 'Veriler açık'}
                </p>
              </div>
              <Button
                onClick={handleToggleEncryption}
                disabled={isTogglingEncryption}
                variant={encryptionStatus.enabled ? 'destructive' : 'default'}
                size="sm"
              >
                {isTogglingEncryption
                  ? 'İşleniyor...'
                  : encryptionStatus.enabled
                  ? 'Kapat'
                  : 'Etkinleştir'}
              </Button>
            </div>

            <div className="text-xs space-y-1" style={{ color: 'var(--text-tertiary)' }}>
              <p>
                <strong>Nasıl çalışır:</strong> Sohbet verileri tarayıcınızda AES-GCM algoritması
                ile şifrelenir. Şifreleme anahtarı cihazınıza özgüdür ve sunucuya gönderilmez.
              </p>
              {encryptionStatus.enabled && (
                <p className="text-xs mt-2" style={{ color: '#10b981' }}>
                  ✓ Verileriniz güvenli bir şekilde korunuyor
                </p>
              )}
            </div>
          </div>

          <div
            className="p-3 rounded text-xs"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#60A5FA',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <strong>Not:</strong> Şifreleme tarayıcı tabanlıdır. Tarayıcı verilerini temizlerseniz
            şifreleme anahtarı kaybolur ve şifreli verilere erişemezsiniz. Önemli sohbetlerinizi
            yedeklemeyi unutmayın.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
