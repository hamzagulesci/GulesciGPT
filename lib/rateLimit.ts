// Simple in-memory rate limiting (Production'da Redis kullanın)
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit kontrolü
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 dakika
): { allowed: boolean; remaining: number; resetAt: number } {
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: maxAttempts, resetAt: Date.now() + windowMs };
  }

  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Eski kayıt yoksa veya süresi dolmuşsa, yeni oluştur
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs
    }
    rateLimitStore.set(identifier, newEntry)

    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt: newEntry.resetAt
    }
  }

  // Limit aşıldıysa
  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    }
  }

  // Sayacı artır
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt
  }
}

// Rate limit sıfırla (başarılı login sonrası)
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

