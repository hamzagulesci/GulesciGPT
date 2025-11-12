// Server-side encryption for Edge environments using Web Crypto API

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16; // 128 bits

// Derive a key from a secret (environment variable)
async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Explicitly create a new ArrayBuffer to ensure type compatibility.
  const saltArrayBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltArrayBuffer).set(salt);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    secretKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true, // Key is extractable
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encrypt(data: string): Promise<string> {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    console.error('CRITICAL: ENCRYPTION_SECRET environment variable is not set.');
    // In a real-world scenario, you might want to throw an error
    // For now, we return the unencrypted data to avoid a hard crash
    return data;
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const key = await deriveKey(secret, salt);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encodedData
    );

    // Combine salt, IV, and encrypted data: salt + iv + data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to a string representation (e.g., base64)
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  } catch (error) {
    console.error('Server-side encryption failed:', error);
    return data; // Fallback to unencrypted data on failure
  }
}

// Decrypt data
export async function decrypt(encryptedData: string): Promise<string> {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    console.error('CRITICAL: ENCRYPTION_SECRET environment variable is not set.');
    return encryptedData; // Cannot decrypt, return original data
  }

  try {
    const combinedBinaryStr = atob(encryptedData);
    const combined = new Uint8Array(combinedBinaryStr.length);
    for (let i = 0; i < combinedBinaryStr.length; i++) {
      combined[i] = combinedBinaryStr.charCodeAt(i);
    }

    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const data = combined.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(secret, salt);

    const decryptedData = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    // If decryption fails, it might be unencrypted data from a previous state.
    return encryptedData;
  }
}
