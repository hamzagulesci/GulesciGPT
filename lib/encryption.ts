// Client-side encryption for localStorage data using Web Crypto API

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM

// Generate a cryptographic key from a password/seed
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: Buffer.from(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

// Get or create encryption key
async function getEncryptionKey(): Promise<CryptoKey> {
  // Use a device-specific salt stored in localStorage
  let saltHex = localStorage.getItem('_enc_salt')

  if (!saltHex) {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    saltHex = Array.from(salt, b => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem('_enc_salt', saltHex)
  }

  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  )

  // Use a combination of device info as password
  const deviceId = getDeviceId()
  return deriveKey(deviceId, salt)
}

// Get or create a unique device identifier
function getDeviceId(): string {
  let deviceId = localStorage.getItem('_device_id')

  if (!deviceId) {
    // Generate a random device ID
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    deviceId = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem('_device_id', deviceId)
  }

  return deviceId
}

// Encrypt data
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(data)

    const encryptedData = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encodedData
    )

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encryptedData), iv.length)

    // Convert to base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    // Return original data if encryption fails
    return data
  }
}

// Decrypt data
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    // Try to decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))

    const iv = combined.slice(0, IV_LENGTH)
    const data = combined.slice(IV_LENGTH)

    const key = await getEncryptionKey()

    const decryptedData = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    // If decryption fails, assume it's unencrypted data
    // This provides backward compatibility with existing data
    return encryptedData
  }
}

// Check if data is encrypted
export function isEncrypted(data: string): boolean {
  // Very simple check: encrypted data will be base64
  // and won't start with { or [ (JSON objects/arrays)
  if (!data) return false

  // Check if it looks like base64
  const base64Regex = /^[A-Za-z0-9+/]+=*$/
  if (!base64Regex.test(data)) return false

  // Check if it's not valid JSON
  try {
    JSON.parse(data)
    return false // If it parses as JSON, it's not encrypted
  } catch {
    return true // If it doesn't parse, it might be encrypted
  }
}

// Migrate existing unencrypted data to encrypted format
export async function migrateToEncrypted(key: string): Promise<void> {
  const data = localStorage.getItem(key)

  if (!data) return

  // Check if already encrypted
  if (isEncrypted(data)) return

  // Encrypt and save
  const encrypted = await encryptData(data)
  localStorage.setItem(key, encrypted)
}

// Helper to get and decrypt localStorage item
export async function getEncryptedItem(key: string): Promise<string | null> {
  const data = localStorage.getItem(key)

  if (!data) return null

  // If encrypted, decrypt it
  if (isEncrypted(data)) {
    return decryptData(data)
  }

  // If not encrypted, return as is (backward compatibility)
  return data
}

// Helper to encrypt and set localStorage item
export async function setEncryptedItem(key: string, value: string): Promise<void> {
  const encrypted = await encryptData(value)
  localStorage.setItem(key, encrypted)
}
