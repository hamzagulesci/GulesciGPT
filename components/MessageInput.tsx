'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TurnstileWidget } from './TurnstileWidget'

interface MessageInputProps {
  onSend: (message: string, captchaToken: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // CAPTCHA yoksa (development için) otomatik bypass
  const hasCaptcha = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const handleSend = () => {
    // CAPTCHA yoksa veya token varsa gönder
    const captchaValid = !hasCaptcha || captchaToken
    if (!message.trim() || !captchaValid || disabled) return

    onSend(message.trim(), captchaToken || 'dev-bypass')
    setMessage('')
    setCaptchaToken(null) // CAPTCHA'yı sıfırla, kullanıcı yeni CAPTCHA çözmeli

    // Textarea'yı sıfırla
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Otomatik yükseklik artışı
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const canSend = message.trim() && (!hasCaptcha || captchaToken) && !disabled

  return (
    <div
      className="p-4 space-y-3"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)'
      }}
    >
      {/* CAPTCHA Widget - sadece production'da göster */}
      {hasCaptcha ? (
        <div className="flex justify-center">
          <TurnstileWidget
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken(null)}
          />
        </div>
      ) : (
        <div className="flex justify-center">
          <p
            className="text-xs px-3 py-2 rounded"
            style={{
              background: 'rgba(255, 193, 7, 0.1)',
              color: '#FFC107',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}
          >
            ⚠️ CAPTCHA devre dışı (Development modu)
          </p>
        </div>
      )}

      {/* Mesaj Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            handleInput()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          disabled={disabled}
          className="min-h-[60px] max-h-[120px] resize-none"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '12px'
          }}
          rows={2}
          aria-label="Mesaj yazma alanı"
        />
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-[60px] w-[60px] flex-shrink-0"
          style={{
            background: canSend ? 'var(--color-action)' : 'var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '6px'
          }}
          aria-label="Mesaj gönder"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Enter: Gönder | Shift+Enter: Yeni satır
      </p>
    </div>
  )
}
