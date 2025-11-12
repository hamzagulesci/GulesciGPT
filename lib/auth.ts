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
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Ortam değişkeni yoksa veya boşsa, şifre doğrulama başarısız olur.
  if (!adminPassword) {
    console.error('CRITICAL: ADMIN_PASSWORD environment variable is not set.');
    return false;
  }

  // Timing-safe karşılaştırma ile şifreyi doğrula
  return timingSafeEqual(password, adminPassword);
}
