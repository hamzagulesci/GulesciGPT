import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Şifre gerekli' },
        { status: 400 }
      )
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Hatalı şifre' },
        { status: 401 }
      )
    }

    // JWT token oluştur
    const token = await createToken('admin')

    // Cookie'ye kaydet
    const response = NextResponse.json({ success: true, token })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
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
