'use server'

type Role = 'scout' | 'media' | 'verifier'

export async function loginAdmin(email: string, password: string): Promise<{ role: Role } | { error: string }> {
  const ADMIN_SCOUT_EMAIL = process.env.ADMIN_SCOUT_EMAIL
  const ADMIN_SCOUT_PASSWORD = process.env.ADMIN_SCOUT_PASSWORD
  const ADMIN_MEDIA_EMAIL = process.env.ADMIN_MEDIA_EMAIL
  const ADMIN_MEDIA_PASSWORD = process.env.ADMIN_MEDIA_PASSWORD
  const ADMIN_VERIFIER_EMAIL = process.env.ADMIN_VERIFIER_EMAIL
  const ADMIN_VERIFIER_PASSWORD = process.env.ADMIN_VERIFIER_PASSWORD

  if (email === ADMIN_SCOUT_EMAIL && password === ADMIN_SCOUT_PASSWORD) {
    return { role: 'scout' }
  }
  if (email === ADMIN_MEDIA_EMAIL && password === ADMIN_MEDIA_PASSWORD) {
    return { role: 'media' }
  }
  if (email === ADMIN_VERIFIER_EMAIL && password === ADMIN_VERIFIER_PASSWORD) {
    return { role: 'verifier' }
  }

  return { error: 'Invalid email or password.' }
}
