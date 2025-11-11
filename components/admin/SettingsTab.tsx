'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChanging, setIsChanging] = useState(false)

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
    </div>
  )
}
