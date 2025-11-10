import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind CSS sınıflarını birleştirmek için utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tarih formatlamak için helper
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Az önce"
  if (minutes < 60) return `${minutes} dakika önce`
  if (hours < 24) return `${hours} saat önce`
  if (days < 7) return `${days} gün önce`

  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// API key'i maskele (güvenlik için)
export function maskApiKey(key: string): string {
  if (key.length < 10) return "***"
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
}

// Mesaj içeriğini sanitize et (XSS önleme)
export function sanitizeMessage(message: string): string {
  // DOMPurify browser'da kullanılacak, server-side için basit escape
  return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Model adından display name oluştur
export function getModelDisplayName(modelId: string, contextLength: number): string {
  const modelName = modelId.split('/').pop()?.split(':')[0] || modelId
  const formatted = modelName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const contextK = Math.floor(contextLength / 1000)
  return `${formatted} (${contextK}K)`
}

// Chat title oluştur (ilk mesajdan)
export function generateChatTitle(firstMessage: string): string {
  if (!firstMessage) return "Yeni Sohbet"
  return firstMessage.length > 30
    ? firstMessage.substring(0, 30) + "..."
    : firstMessage
}

// UUID oluştur (basit implementation)
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
