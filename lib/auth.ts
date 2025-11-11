import { SignJWT, jwtVerify } from 'jose'
import crypto from 'crypto'
import { getStoredPassword } from './passwordManager'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

// JWT token oluştur (admin login için)
export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 gün geçerli
    .sign(JWT_SECRET)

  return token
}

// JWT token doğrula
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as string }
  } catch (error) {
    console.error('Token doğrulama hatası:', error)
    return null
  }
}

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
