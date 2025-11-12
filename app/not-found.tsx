'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="text-center max-w-md">
        {/* 404 Animasyonu */}
        <div className="mb-8">
          <h1
            className="text-9xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--color-action) 0%, var(--color-action-hover) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            404
          </h1>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'var(--color-action)' }} />
        </div>

        {/* Mesaj */}
        <div className="mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Sayfa Bulunamadı
          </h2>
          <p
            className="text-base md:text-lg mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            URL'yi kontrol edin veya ana sayfaya dönün.
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button
              className="w-full sm:w-auto"
              style={{
                background: 'var(--color-action)',
                color: 'var(--text-primary)'
              }}
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>

          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full sm:w-auto"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
        </div>

        {/* Yardım Linkleri */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Yardıma mı ihtiyacınız var?
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/"
              className="hover:underline"
              style={{ color: 'var(--color-action)' }}
            >
              Chat Başlat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
