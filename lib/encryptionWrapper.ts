// Simplified encryption wrapper for localStorage
// Uses a synchronous approach with Web Crypto API in a worker-like pattern

import { encryptData, decryptData, isEncrypted, setEncryptedItem, getEncryptedItem } from './encryption'

const ENCRYPTION_ENABLED_KEY = '_encryption_enabled'
const CHATS_KEY = 'gulescigpt_chats'

// Check if encryption is enabled
export function isEncryptionEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ENCRYPTION_ENABLED_KEY) === 'true'
}

// Enable encryption
export async function enableEncryption(): Promise<void> {
  if (typeof window === 'undefined') return

  localStorage.setItem(ENCRYPTION_ENABLED_KEY, 'true')

  // Migrate existing chat data
  await migrateChatsToEncrypted()
}

// Disable encryption (decrypt existing data)
export async function disableEncryption(): Promise<void> {
  if (typeof window === 'undefined') return

  // Decrypt existing chat data
  await migrateChatsToDecrypted()

  localStorage.setItem(ENCRYPTION_ENABLED_KEY, 'false')
}

// Migrate chats to encrypted format
async function migrateChatsToEncrypted(): Promise<void> {
  try {
    const chatsData = localStorage.getItem(CHATS_KEY)
    if (!chatsData) return

    // Check if already encrypted
    if (isEncrypted(chatsData)) {
      console.log('Chats already encrypted')
      return
    }

    // Encrypt the data
    console.log('Encrypting chats...')
    await setEncryptedItem(CHATS_KEY, chatsData)
    console.log('Chats encrypted successfully')
  } catch (error) {
    console.error('Error migrating chats to encrypted:', error)
  }
}

// Migrate chats back to decrypted format
async function migrateChatsToDecrypted(): Promise<void> {
  try {
    const chatsData = localStorage.getItem(CHATS_KEY)
    if (!chatsData) return

    // If encrypted, decrypt it
    if (isEncrypted(chatsData)) {
      console.log('Decrypting chats...')
      const decrypted = await getEncryptedItem(CHATS_KEY)
      if (decrypted) {
        localStorage.setItem(CHATS_KEY, decrypted)
        console.log('Chats decrypted successfully')
      }
    }
  } catch (error) {
    console.error('Error migrating chats to decrypted:', error)
  }
}

// Helper to save chats with optional encryption
export async function saveChatsWithEncryption(chatsJson: string): Promise<void> {
  if (typeof window === 'undefined') return

  if (isEncryptionEnabled()) {
    await setEncryptedItem(CHATS_KEY, chatsJson)
  } else {
    localStorage.setItem(CHATS_KEY, chatsJson)
  }
}

// Helper to load chats with optional decryption
export async function loadChatsWithDecryption(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const data = localStorage.getItem(CHATS_KEY)
  if (!data) return null

  // If encryption is enabled or data is encrypted, try to decrypt
  if (isEncryptionEnabled() || isEncrypted(data)) {
    return await getEncryptedItem(CHATS_KEY)
  }

  return data
}

// Background encryption process (call this on app load)
export async function initEncryption(): Promise<void> {
  if (typeof window === 'undefined') return

  // If encryption is enabled, ensure data is encrypted
  if (isEncryptionEnabled()) {
    await migrateChatsToEncrypted()
  }
}

// Get encryption status
export function getEncryptionStatus(): {
  enabled: boolean
  dataEncrypted: boolean
} {
  if (typeof window === 'undefined') {
    return { enabled: false, dataEncrypted: false }
  }

  const enabled = isEncryptionEnabled()
  const chatsData = localStorage.getItem(CHATS_KEY)
  const dataEncrypted = chatsData ? isEncrypted(chatsData) : false

  return { enabled, dataEncrypted }
}
