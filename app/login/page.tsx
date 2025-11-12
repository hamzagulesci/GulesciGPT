'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      toast.error('Şifre gerekli')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!data.success) {
        toast.error(data.error || 'Hatalı şifre')
        return
      }

      toast.success('Giriş başarılı!')
      router.push('/admin')
    } catch (error) {
      console.error('Login hatası:', error)
      toast.error('Bağlantı hatası')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <Card
        className="w-full max-w-md"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0px 2px 6px var(--shadow)'
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>
            Admin Girişi
          </CardTitle>
          <CardDescription style={{ color: 'var(--text-tertiary)' }}>
            GüleşciGPT admin paneline giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password" style={{ color: 'var(--text-secondary)' }}>
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin şifrenizi girin"
                disabled={isLoading}
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px'
                }}
                aria-label="Admin şifresi"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{
                background: isLoading ? 'var(--border-color)' : 'var(--color-action)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                padding: '12px 24px'
              }}
              aria-label="Giriş yap"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
