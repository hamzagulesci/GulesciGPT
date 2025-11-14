'use client'

import { useState, useRef, KeyboardEvent, memo } from 'react'
import { Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MessageInputProps {
  onSend: (message: string, captchaToken: string) => void
  disabled?: boolean
  onStop?: () => void
}

export const MessageInput = memo(function MessageInput({ onSend, disabled, onStop }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!message.trim() || disabled) return

    onSend(message.trim(), 'no-captcha')
    setMessage('')

    // Textarea'yı sıfırla
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFocus = () => {
    // Klavye açıldığında input görünür kalsın
    requestAnimationFrame(() => {
      textareaRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
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

  const canSend = message.trim() && !disabled

  return (
    <div
      className="p-3 md:p-4 space-y-2 md:space-y-3"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)'
      }}
    >
      {/* Mesaj Input */}
      <div className="flex gap-2 items-stretch">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            handleInput()
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Mesajınızı yazın..."
          disabled={disabled}
          className="w-full min-h-[50px] md:min-h-[60px] max-h-[120px] resize-none text-base rounded-lg px-3 md:px-4 py-2 md:py-3"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '16px'
          }}
          rows={2}
          aria-label="Mesaj yazma alanı"
        />
        {disabled && onStop ? (
          <Button
            onClick={onStop}
            className="flex-shrink-0 h-full px-3 md:px-4 rounded-lg"
            style={{
              background: '#ef4444',
              color: 'white',
              borderRadius: '8px'
            }}
            aria-label="Durdur"
          >
            <Square className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-shrink-0 h-full px-3 md:px-4 rounded-lg"
            style={{
              background: canSend ? 'var(--color-action)' : 'var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '8px'
            }}
            aria-label="Mesaj gönder"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
      </div>

      <p className="text-xs text-center hidden md:block" style={{ color: 'var(--text-muted)' }}>
        Enter: Gönder | Shift+Enter: Yeni satır
      </p>
    </div>
  )
})
