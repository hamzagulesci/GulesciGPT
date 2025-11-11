// Input validation ve sanitization utilities

// XSS koruması: HTML karakterlerini escape et
export function sanitizeHtml(input: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

// String validation: Sadece güvenli karakterler
export function isValidString(input: string, maxLength: number = 1000): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  if (input.length > maxLength) {
    return false
  }

  // Null bytes ve control characters kontrolü
  if (/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/.test(input)) {
    return false
  }

  return true
}

// API Key validation (OpenRouter format)
export function isValidApiKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false
  }

  // OpenRouter key format: sk-or-v1-[64 hex characters]
  const openRouterPattern = /^sk-or-v1-[a-f0-9]{64}$/i

  return openRouterPattern.test(key.trim())
}

// Password strength validation
export function isStrongPassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Şifre en az 12 karakter olmalı')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermeli')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermeli')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermeli')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermeli')
  }

  // Yaygın zayıf şifreler
  const weakPasswords = [
    'admin123', 'password', 'password123', '12345678',
    'qwerty', 'abc123', 'admin', 'letmein'
  ]

  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push('Şifre çok yaygın, daha karmaşık bir şifre seçin')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// UUID validation
export function isValidUUID(uuid: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidPattern.test(uuid)
}

// File path traversal koruması
export function isSafePath(path: string): boolean {
  // Path traversal karakterlerini kontrol et
  if (path.includes('..') || path.includes('~')) {
    return false
  }

  // Absolute path kontrolü
  if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) {
    return false
  }

  return true
}

// SQL Injection koruması (paranoid mod)
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b).*?=/i,
    /(\bUNION\b.*?\bSELECT\b)/i
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

// Command injection koruması
export function containsCommandInjection(input: string): boolean {
  const commandPatterns = [
    /[;&|`$()]/,
    /\b(eval|exec|system|shell_exec|passthru)\b/i,
    /\.\.\//,
    /~\//
  ]

  return commandPatterns.some(pattern => pattern.test(input))
}
