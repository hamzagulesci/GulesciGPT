import { encrypt, decrypt } from './server-encryption';
import { getDb, setDb, listDb, deleteDb } from './db';

// KV'de anahtarları saklamak için kullanılacak önek.
const API_KEY_PREFIX = 'apiKey:';

// Sisteme yeni bir API anahtarı ekler.
export async function addApiKey(key: string): Promise<ApiKey> {
  if (!key.trim()) throw new Error('API key cannot be empty');

  const id = crypto.randomUUID();
  const newKey: ApiKey = {
    id,
    key: await encrypt(key), // Anahtarı şifreleyerek sakla
    isActive: true,
    usageCount: 0,
    addedAt: new Date().toISOString(),
    lastUsed: null,
  };

  try {
    await setDb(`${API_KEY_PREFIX}${id}`, newKey);
    return newKey;
  } catch (e) {
    console.error('KV yazma hatası:', e);
    throw new Error('API key eklenemedi. KV storage erişilemiyor.');
  }
}

// Aktif API anahtarlarını kullanım sayısına göre sırala ve şifresini çöz
export async function getActiveApiKeysInOrder(): Promise<{ id: string; key: string }[]> {
  // Dahili tüm anahtarları al
  const keyFiles = await listDb(API_KEY_PREFIX)
  const keys: ApiKey[] = []
  for (const keyFile of keyFiles) {
    const keyData = await getDb<ApiKey>(keyFile.name)
    if (keyData) {
      keys.push(keyData)
    }
  }

  const active = keys.filter(k => k.isActive)
  active.sort((a, b) => {
    if (a.usageCount !== b.usageCount) return a.usageCount - b.usageCount
    const aLast = a.lastUsed ? Date.parse(a.lastUsed) : 0
    const bLast = b.lastUsed ? Date.parse(b.lastUsed) : 0
    if (aLast !== bLast) return aLast - bLast
    const aAdded = Date.parse(a.addedAt)
    const bAdded = Date.parse(b.addedAt)
    return aAdded - bAdded
  })

  const result: { id: string; key: string }[] = []
  for (const k of active) {
    const plain = await decrypt(k.key)
    result.push({ id: k.id, key: plain })
  }
  return result
}

// Kullanım için aktif bir API anahtarı alır.
// En az kullanılmış olanı seçer ve kullanım sayacını artırır.
export async function getActiveApiKey(): Promise<{ id: string; key: string } | null> {
  const allKeys = await getAllApiKeys(true); // Get raw keys
  const activeKeys = allKeys.filter(k => k.isActive);

  if (activeKeys.length === 0) return null;

  const keyToUse = activeKeys.reduce((prev, curr) =>
    prev.usageCount < curr.usageCount ? prev : curr
  );

  // Do not increment usage here, the caller will do it after a successful request
  const decryptedKey = await decrypt(keyToUse.key);

  return { id: keyToUse.id, key: decryptedKey };
}

// Görüntüleme için tüm API anahtarlarını listeler (anahtar kısaltılmış).
export async function listApiKeys(): Promise<ApiKey[]> {
    const allKeys = await getAllApiKeys();
    // Güvenlik için, listelerken anahtarın sadece bir kısmını göster
    return Promise.all(allKeys.map(async (k) => ({
      ...k,
      key: `${(await decrypt(k.key)).substring(0, 4)}...`
    })));
}

// Dahili kullanım için tüm API anahtarlarını tam olarak alır.
// Dahili kullanım için tüm API anahtarlarını tam olarak alır.
async function getAllApiKeys(raw: boolean = false): Promise<ApiKey[]> {
    const keyFiles = await listDb(API_KEY_PREFIX);
    const keys: ApiKey[] = [];
    for (const keyFile of keyFiles) {
      const keyData = await getDb<ApiKey>(keyFile.name);
      if (keyData) {
        keys.push(keyData);
      }
    }
    return keys;
}

// Bir API anahtarının kullanımını günceller (başarılı istek sonrası).
export async function updateKeyUsage(id: string): Promise<void> {
  const keyId = `${API_KEY_PREFIX}${id}`;
  const key = await getDb<ApiKey>(keyId);

  if (key) {
    key.usageCount++;
    key.lastUsed = new Date().toISOString();
    await setDb(keyId, key);
  }
}

// Bir API anahtarını ID'sine göre siler.
export async function deleteApiKey(id: string): Promise<void> {
  await deleteDb(`${API_KEY_PREFIX}${id}`);
}

// Bir API anahtarının aktif/pasif durumunu değiştirir.
// Bir API anahtarını geçersiz olarak işaretler (örn. 401 hatası alındığında).
export async function markKeyAsFailed(id: string): Promise<void> {
  const keyId = `${API_KEY_PREFIX}${id}`;
  const key = await getDb<ApiKey>(keyId);

  if (key) {
    key.isActive = false;
    await setDb(keyId, key);
    console.log(`API key ${id} marked as failed and deactivated.`);
  }
}

export async function toggleApiKeyStatus(id: string): Promise<ApiKey | null> {
  const keyId = `${API_KEY_PREFIX}${id}`;
  const key = await getDb<ApiKey>(keyId);

  if (key) {
    key.isActive = !key.isActive;
    await setDb(keyId, key);
    // Güncellenmiş anahtarı, kısaltılmış anahtar bilgisiyle döndür
    return { ...key, key: `${(await decrypt(key.key)).substring(0, 4)}...` };
  }

  return null;
}

// API Anahtarı arayüzü
export interface ApiKey {
    id: string;
    key: string; // Şifrelenmiş anahtar
    isActive: boolean;
    usageCount: number;
    addedAt: string;
    lastUsed: string | null;
}
