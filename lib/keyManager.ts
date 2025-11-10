import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import lockfile from 'proper-lockfile'

const DATA_DIR = path.join(process.cwd(), 'data')
const KEYS_FILE = path.join(DATA_DIR, 'api-keys.json')
const LOCK_FILE = path.join(DATA_DIR, 'api-keys.lock')

export interface ApiKey {
  id: string
  key: string
  isActive: boolean
  usageCount: number
  addedAt: string
  lastUsed: string | null
}

// Data klasörünü oluştur (yoksa)
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(KEYS_FILE)) {
    fs.writeFileSync(KEYS_FILE, '[]', 'utf-8')
  }
}

// API key'leri oku
function readKeys(): ApiKey[] {
  ensureDataDir()
  try {
    const data = fs.readFileSync(KEYS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('API key okuma hatası:', error)
    return []
  }
}

// API key'leri yaz (file locking ile)
async function writeKeys(keys: ApiKey[]): Promise<void> {
  ensureDataDir()

  try {
    // Basit file lock
    let release: (() => Promise<void>) | null = null
    try {
      release = await lockfile.lock(KEYS_FILE, {
        retries: {
          retries: 5,
          minTimeout: 100,
          maxTimeout: 500
        }
      })
    } catch (err) {
      // Lock alınamazsa devam et (best effort)
      console.warn('Lock alınamadı, devam ediliyor:', err)
    }

    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8')

    if (release) {
      await release()
    }
  } catch (error) {
    console.error('API key yazma hatası:', error)
    throw error
  }
}

// Aktif key al
export function getActiveKey(): ApiKey | null {
  const keys = readKeys()
  const activeKey = keys.find(k => k.isActive)
  return activeKey || null
}

// Key'i başarısız olarak işaretle ve pasif yap
export async function markKeyAsFailed(keyId: string): Promise<void> {
  const keys = readKeys()
  const keyIndex = keys.findIndex(k => k.id === keyId)

  if (keyIndex !== -1) {
    keys[keyIndex].isActive = false
    keys[keyIndex].usageCount += 1
    keys[keyIndex].lastUsed = new Date().toISOString()
    await writeKeys(keys)
  }
}

// Bir sonraki aktif key'e geç
export function rotateToNextKey(): ApiKey | null {
  const keys = readKeys()
  const nextActiveKey = keys.find(k => k.isActive)
  return nextActiveKey || null
}

// Yeni key ekle
export async function addKey(newKey: string): Promise<ApiKey> {
  const keys = readKeys()

  const keyObj: ApiKey = {
    id: uuidv4(),
    key: newKey,
    isActive: true,
    usageCount: 0,
    addedAt: new Date().toISOString(),
    lastUsed: null
  }

  keys.push(keyObj)
  await writeKeys(keys)

  return keyObj
}

// Key sil
export async function deleteKey(keyId: string): Promise<boolean> {
  const keys = readKeys()
  const filteredKeys = keys.filter(k => k.id !== keyId)

  if (filteredKeys.length === keys.length) {
    return false // Key bulunamadı
  }

  await writeKeys(filteredKeys)
  return true
}

// Tüm key'leri al (admin dashboard için)
export function getAllKeys(): ApiKey[] {
  return readKeys()
}

// Key'i aktif/pasif yap
export async function toggleKeyStatus(keyId: string, isActive: boolean): Promise<boolean> {
  const keys = readKeys()
  const keyIndex = keys.findIndex(k => k.id === keyId)

  if (keyIndex === -1) {
    return false
  }

  keys[keyIndex].isActive = isActive
  await writeKeys(keys)
  return true
}

// Key kullanımını güncelle
export async function updateKeyUsage(keyId: string): Promise<void> {
  const keys = readKeys()
  const keyIndex = keys.findIndex(k => k.id === keyId)

  if (keyIndex !== -1) {
    keys[keyIndex].usageCount += 1
    keys[keyIndex].lastUsed = new Date().toISOString()
    await writeKeys(keys)
  }
}
