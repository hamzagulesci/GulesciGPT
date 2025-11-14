// Settings storage using Cloudflare KV
import { getDb, setDb } from './db'
import { AI_MODELS, DEFAULT_MODEL } from './models'

const DEFAULT_MODEL_KEY = 'settings:defaultModelId'

export async function getDefaultModelId(): Promise<string> {
  try {
    const saved = await getDb<string>(DEFAULT_MODEL_KEY)
    if (saved && AI_MODELS.some(m => m.id === saved)) return saved
  } catch (e) {
    // ignore and fallback
  }
  return DEFAULT_MODEL
}

export async function setDefaultModelId(modelId: string): Promise<void> {
  if (!AI_MODELS.some(m => m.id === modelId)) {
    throw new Error('Invalid model id')
  }
  await setDb(DEFAULT_MODEL_KEY, modelId)
}
