// Cloudflare KV için// lib/db.ts
interface KVNamespace {
  get<T>(key: string, type: 'json'): Promise<T | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[] }>;
}

function getKv(): KVNamespace {
  // @ts-ignore
  const kv = process.env.KV as KVNamespace;
  if (!kv) {
    throw new Error('KV storage is not available. Check your Cloudflare Pages KV namespace bindings.');
  }
  return kv;
}

export async function getDb<T>(key: string): Promise<T | null> {
  const kv = getKv();
  return await kv.get<T>(key, 'json');
}

export async function setDb<T>(key: string, value: T, expirationTtl?: number): Promise<void> {
  const kv = getKv();
  await kv.put(key, JSON.stringify(value), { expirationTtl });
}

export async function deleteDb(key: string): Promise<void> {
  const kv = getKv();
  await kv.delete(key);
}

export async function listDb(prefix: string): Promise<{ name: string }[]> {
  const kv = getKv();
  const listed = await kv.list({ prefix });
  return listed.keys;
}
