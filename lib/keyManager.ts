import { v4 as uuidv4 } from 'uuid'

// In-memory store for API keys in an Edge environment
let keys: ApiKey[] = []

export interface ApiKey {
  id: string
  key: string
  isActive: boolean
  usageCount: number
  addedAt: string
  lastUsed: string | null
}

// Data klasörünü oluştur (yoksa)
// In-memory functions for an Edge environment
function readKeys(): ApiKey[] {
  return keys
}

async function writeKeys(newKeys: ApiKey[]): Promise<void> {
  keys = newKeys
  return Promise.resolve()
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
