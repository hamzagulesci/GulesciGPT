// Cloudflare KV için arayüz
// Bu arayüz, process.binding.KV gibi dinamik olarak bağlanan
// bir nesnenin tip güvenliğini sağlar.
interface KVNamespace {
  get(key: string): Promise<string | null>;
  get<T>(key: string, type: 'json'): Promise<T | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string, metadata?: unknown }[]; list_complete: boolean; cursor: string }>;
  delete(key: string): Promise<void>;
}

// KV Namespace'i güvenli bir şekilde almak için yardımcı fonksiyon
function getKvNamespace(): KVNamespace | null {
  try {
    // Cloudflare Pages Edge runtime'da KV binding farklı yollarla erişilebilir
    // Next.js Edge runtime'da genellikle process.env.KV çalışır
    // @ts-ignore: Cloudflare environment-specific binding
    const kv = process.env.KV || (globalThis as any).env?.KV || (globalThis as any).KV;
    
    if (kv && typeof kv.get === 'function' && typeof kv.put === 'function') {
      // @ts-ignore
      return kv as KVNamespace;
    }
    
    console.error('KV Namespace binding not found or invalid. Available keys:', Object.keys(process.env).filter(k => k.includes('KV')));
    console.error('Make sure KV is bound in Cloudflare Pages: Settings → Functions → KV namespace bindings');
  } catch (e) {
    console.error('Failed to access KV Namespace:', e);
  }
  return null;
}

// Değerleri JSON olarak alır
export async function getDb<T>(key: string): Promise<T | null> {
  const kv = getKvNamespace();
  if (!kv) return null;

  try {
    const value = await kv.get<T>(key, 'json');
    return value;
  } catch (e) {
    console.error(`Failed to get key "${key}" from KV`, e);
    return null;
  }
}

// Değerleri JSON olarak yazar
export async function setDb<T>(key: string, value: T, expirationTtl?: number): Promise<void> {
  const kv = getKvNamespace();
  if (!kv) {
    throw new Error('KV namespace not available. Check Cloudflare Pages KV binding configuration.');
  }

  try {
    await kv.put(key, JSON.stringify(value), { expirationTtl });
  } catch (e) {
    console.error(`Failed to set key "${key}" in KV`, e);
    throw new Error(`KV yazma hatası: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`);
  }
}

// Anahtarı siler
export async function deleteDb(key: string): Promise<void> {
  const kv = getKvNamespace();
  if (!kv) return;

  try {
    await kv.delete(key);
  } catch (e) {
    console.error(`Failed to delete key "${key}" from KV`, e);
  }
}

// Belirli bir önekle başlayan tüm anahtarları listeler
export async function listDb(prefix: string): Promise<{ name: string }[]> {
  const kv = getKvNamespace();
  if (!kv) return [];

  try {
    const listed = await kv.list({ prefix });
    return listed.keys;
  } catch (e) {
    console.error(`Failed to list keys with prefix "${prefix}" from KV`, e);
    return [];
  }
}
