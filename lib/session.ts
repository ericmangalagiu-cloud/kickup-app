import { supabase } from './supabase'

export async function signUp(name: string, password: string): Promise<{ success: boolean; error?: string }> {
  const nameLower = name.trim().toLowerCase()

  // Check uniqueness in Supabase (cross-device)
  const { data: existing, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('name_lower', nameLower)
    .maybeSingle()

  if (checkError) {
    console.error('signUp check error:', checkError)
    return { success: false, error: 'Eroare de conexiune. Verifică internetul și încearcă din nou.' }
  }

  if (existing) {
    return { success: false, error: 'Acest nume este deja folosit. Alege altul sau autentifică-te.' }
  }

  const sessionId = crypto.randomUUID()

  const { error } = await supabase.from('users').insert({
    name: name.trim(),
    name_lower: nameLower,
    session_id: sessionId,
    password,
  })

  if (error) {
    console.error('signUp insert error:', error)
    // Unique violation — race condition, someone registered same name just now
    if (error.code === '23505') {
      return { success: false, error: 'Acest nume este deja folosit. Alege altul sau autentifică-te.' }
    }
    return { success: false, error: 'Eroare la înregistrare. Încearcă din nou.' }
  }

  localStorage.setItem('kickup_name', name.trim())
  localStorage.setItem('kickup_session_id', sessionId)
  return { success: true }
}

export async function logIn(name: string, password: string): Promise<{ success: boolean; error?: string }> {
  const nameLower = name.trim().toLowerCase()

  const { data: user, error: loginError } = await supabase
    .from('users')
    .select('*')
    .eq('name_lower', nameLower)
    .maybeSingle()

  if (loginError) {
    console.error('logIn query error:', loginError)
    return { success: false, error: 'Eroare de conexiune. Verifică internetul și încearcă din nou.' }
  }

  if (!user) {
    return { success: false, error: 'Numele acesta nu există. Înregistrează-te mai întâi.' }
  }

  if (user.password !== password) {
    return { success: false, error: 'Parolă greșită. Încearcă din nou.' }
  }

  localStorage.setItem('kickup_name', user.name)
  localStorage.setItem('kickup_session_id', user.session_id)
  return { success: true }
}

// Returns true only if Supabase confirms the session_id does NOT exist
// (account was created before the users table existed)
export async function isLegacyAccount(sessionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()
    // If there's any error (network, auth, etc.) do NOT clear the session
    if (error) return false
    return data === null
  } catch {
    return false
  }
}

export function getSession(): { name: string; sessionId: string } | null {
  if (typeof window === 'undefined') return null
  const name = localStorage.getItem('kickup_name')
  const sessionId = localStorage.getItem('kickup_session_id')
  if (!name || !sessionId) return null
  return { name, sessionId }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function hashColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#16a34a', '#0d9488', '#0891b2', '#7c3aed', '#ea580c', '#d97706', '#dc2626'
  ]
  return colors[Math.abs(hash) % colors.length]
}
