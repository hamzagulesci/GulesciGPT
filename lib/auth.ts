import crypto from 'crypto'
import { getStoredPassword } from './passwordManager'

// Re-export JWT functions from jwt.ts (for backward compatibility)
export { createToken, verifyToken } from './jwt'

// Timing-safe string comparison (timing attack koruması)
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Farklı uzunluklarda bile sabit süre bekle
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a))
    return false
  }

  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)

  return crypto.timingSafeEqual(bufA, bufB)
}

// Admin şifresini kontrol et (timing attack korumalı)
export function verifyAdminPassword(password: string): boolean {
  // Önce değiştirilmiş şifreyi kontrol et
  const storedPassword = getStoredPassword()
  if (storedPassword) {
    return timingSafeEqual(password, storedPassword)
  }

  // Değiştirilmemişse env'den oku
  const adminPassword = process.env.ADMIN_PASSWORD

  // Production'da şifre zorunlu
  if (!adminPassword || adminPassword === 'admin123') {
    console.error('⚠️ GÜVENLİK UYARISI: ADMIN_PASSWORD çevresel değişkeni ayarlanmamış veya varsayılan değerde!')
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production ortamında ADMIN_PASSWORD ayarlanmalıdır')
    }
  }

  // Timing-safe karşılaştırma
  return timingSafeEqual(password, adminPassword || 'admin123')
}
