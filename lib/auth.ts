import { getStoredPassword } from './passwordManager'

// Re-export JWT functions from jwt.ts (for backward compatibility)
export { createToken, verifyToken } from './jwt'

// Timing-safe string comparison (timing attack koruması)
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
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
