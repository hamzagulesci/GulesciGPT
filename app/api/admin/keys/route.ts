import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getAllKeys, addKey, deleteKey, toggleKeyStatus } from '@/lib/keyManager'
import { maskApiKey } from '@/lib/utils'

// Middleware: Admin auth kontrolü
async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

// GET: Tüm key'leri getir
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const keys = getAllKeys()

    // Key'leri maskele
    const maskedKeys = keys.map(key => ({
      ...key,
      key: maskApiKey(key.key)
    }))

    return NextResponse.json({ keys: maskedKeys })
  } catch (error) {
    console.error('Key listeleme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// POST: Yeni key ekle
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const { key } = await request.json()

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir API key gerekli' },
        { status: 400 }
      )
    }

    // API key formatını kontrol et
    const trimmedKey = key.trim()
    if (!trimmedKey.startsWith('sk-or-') || trimmedKey.length < 20) {
      return NextResponse.json(
        { error: 'Geçersiz OpenRouter API key formatı. Key "sk-or-" ile başlamalı.' },
        { status: 400 }
      )
    }

    // Maksimum key uzunluğu kontrolü
    if (trimmedKey.length > 200) {
      return NextResponse.json(
        { error: 'API key çok uzun' },
        { status: 400 }
      )
    }

    const newKey = await addKey(trimmedKey)

    return NextResponse.json({
      success: true,
      key: {
        ...newKey,
        key: maskApiKey(newKey.key)
      }
    })
  } catch (error) {
    console.error('Key ekleme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// DELETE: Key sil
export async function DELETE(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const { keyId } = await request.json()

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID gerekli' },
        { status: 400 }
      )
    }

    const success = await deleteKey(keyId)

    if (!success) {
      return NextResponse.json(
        { error: 'Key bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Key silme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// PATCH: Key durumunu değiştir (aktif/pasif)
export async function PATCH(request: NextRequest) {
  const auth = await checkAuth(request)

  if (!auth) {
    return NextResponse.json(
      { error: 'Yetkisiz erişim' },
      { status: 401 }
    )
  }

  try {
    const { keyId, isActive } = await request.json()

    if (!keyId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Geçersiz parametreler' },
        { status: 400 }
      )
    }

    const success = await toggleKeyStatus(keyId, isActive)

    if (!success) {
      return NextResponse.json(
        { error: 'Key bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Key güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
