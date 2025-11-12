import fs from 'fs'
import path from 'path'
import lockfile from 'proper-lockfile'

const DATA_DIR = path.join(process.cwd(), 'data')
const PASSWORD_FILE = path.join(DATA_DIR, 'admin-password.json')

interface PasswordData {
  password: string
  changedAt: string
}

// Data klasörünü oluştur (yoksa)
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Admin şifresini oku
export function getStoredPassword(): string | null {
  ensureDataDir()

  try {
    if (!fs.existsSync(PASSWORD_FILE)) {
      return null
    }

    const data = fs.readFileSync(PASSWORD_FILE, 'utf-8')
    const parsed: PasswordData = JSON.parse(data)
    return parsed.password
  } catch (error) {
    console.error('Şifre okuma hatası:', error)
    return null
  }
}

// Admin şifresini kaydet
export async function setStoredPassword(newPassword: string): Promise<void> {
  ensureDataDir()

  try {
    // File lock
    let release: (() => Promise<void>) | null = null
    try {
      release = await lockfile.lock(PASSWORD_FILE, {
        retries: {
          retries: 5,
          minTimeout: 100,
          maxTimeout: 500
        }
      })
    } catch (err) {
      console.warn('Lock alınamadı, devam ediliyor:', err)
    }

    const data: PasswordData = {
      password: newPassword,
      changedAt: new Date().toISOString()
    }

    fs.writeFileSync(PASSWORD_FILE, JSON.stringify(data, null, 2), 'utf-8')

    if (release) {
      await release()
    }
  } catch (error) {
    console.error('Şifre yazma hatası:', error)
    throw error
  }
}

// Şifreyi sıfırla (env'e geri dön)
export async function resetPasswordToEnv(): Promise<void> {
  ensureDataDir()

  try {
    if (fs.existsSync(PASSWORD_FILE)) {
      fs.unlinkSync(PASSWORD_FILE)
    }
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error)
    throw error
  }
}
