import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, verifyAdminPassword } from '@/lib/auth'
import { setStoredPassword } from '@/lib/passwordManager'
import { isStrongPassword } from '@/lib/validation'

// Middleware: Admin auth kontrolü
async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

// POST: Şifre değiştir
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const { currentPassword, newPassword } = await request.json()

    // Input validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut ve yeni şifre gerekli' },
        { status: 400 }
      )
    }

    // Mevcut şifreyi kontrol et
    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json(
        { error: 'Mevcut şifre hatalı' },
        { status: 401 }
      )
    }

    // Yeni şifre gücünü kontrol et
    const passwordStrength = isStrongPassword(newPassword)
    if (!passwordStrength.valid) {
      return NextResponse.json(
        { error: 'Zayıf şifre', details: passwordStrength.errors },
        { status: 400 }
      )
    }

    // Yeni şifreyi kaydet
    await setStoredPassword(newPassword)

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    })
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
