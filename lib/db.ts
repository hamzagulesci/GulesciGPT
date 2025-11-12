// Cloudflare KV for Cloudflare Pages (next-on-pages)
import { getRequestContext } from '@cloudflare/next-on-pages'

interface KVNamespace {
  get<T>(key: string, options?: { type: 'json' | 'text' | 'arrayBuffer' }): Promise<T | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[] }>
}

function getKv(): KVNamespace {
  const env = getRequestContext().env as unknown as { KV?: KVNamespace }
  const kv = env?.KV
  if (!kv) {
    throw new Error('KV binding missing. In Cloudflare Pages, add KV under Settings → Functions → KV namespace bindings with variable name "KV"')
  }
  return kv
}

export async function getDb<T>(key: string): Promise<T | null> {
  const kv = getKv()
  return await kv.get<T>(key, { type: 'json' })
}

export async function setDb<T>(key: string, value: T, expirationTtl?: number): Promise<void> {
  const kv = getKv()
  await kv.put(key, JSON.stringify(value), { expirationTtl })
}

export async function deleteDb(key: string): Promise<void> {
  const kv = getKv()
  await kv.delete(key)
}

export async function listDb(prefix: string): Promise<{ name: string }[]> {
  const kv = getKv()
  const listed = await kv.list({ prefix })
  return listed.keys
}
