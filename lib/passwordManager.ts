

interface PasswordData {
  password: string
  changedAt: string
}


// Admin şifresini oku
export function getStoredPassword(): string | null {
  // File-based password storage is not supported in Edge environments.
  // The password should be managed via the ADMIN_PASSWORD environment variable.
  return null
}

// Admin şifresini kaydet
export async function setStoredPassword(newPassword: string): Promise<void> {
  // This is a stub function. In an Edge environment, password cannot be changed at runtime.
  console.warn('setStoredPassword is not supported in this environment.')
  return Promise.resolve()
}

// Şifreyi sıfırla (env'e geri dön)
export async function resetPasswordToEnv(): Promise<void> {
  // This is a stub function.
  console.warn('resetPasswordToEnv is not supported in this environment.')
  return Promise.resolve()
}
