import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, createToken } from '@/lib/auth'
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit'
import { isValidString } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // IP adresini al (rate limiting için)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Rate limiting kontrolü (5 deneme / 15 dakika)
    const rateLimitKey = `login:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)

    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000)
      return NextResponse.json(
        {
          success: false,
          error: `Çok fazla başarısız deneme. Lütfen ${waitMinutes} dakika sonra tekrar deneyin.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt)
          }
        }
      )
    }

    const { password } = await request.json()

    // Input validation
    if (!password || !isValidString(password, 100)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz şifre formatı' },
        { status: 400 }
      )
    }

    // Şifre kontrolü
    if (!verifyAdminPassword(password)) {
      // Rate limit headers ekle
      return NextResponse.json(
        { success: false, error: 'Hatalı şifre' },
        {
          status: 401,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
            'X-RateLimit-Reset': String(rateLimit.resetAt)
          }
        }
      )
    }

    // Başarılı login - rate limit sıfırla
    resetRateLimit(rateLimitKey)

    // JWT token oluştur
    const token = await createToken('admin')

    // Cookie'ye kaydet
    const response = NextResponse.json({ success: true, token })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
