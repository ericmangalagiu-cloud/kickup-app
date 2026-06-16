import { supabase } from './supabase'

/* ─── Cookie helpers (365-day persistent session) ────────────────────────── */
const COOKIE_KEY  = 'kickup_sid'
const COOKIE_DAYS = 365

function setCookie(sessionId: string) {
  if (typeof document === 'undefined') return
  const exp = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString()
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(sessionId)}; expires=${exp}; path=/; SameSite=Lax`
}

function getCookie(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_KEY + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

function deleteCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

/** Clear localStorage + cookie on logout */
export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('kickup_name')
  localStorage.removeItem('kickup_session_id')
  localStorage.removeItem('kickup_avatar')
  deleteCookie()
}

/**
 * If localStorage has no session but the 365-day cookie still exists,
 * verify the session_id against the DB and silently restore it.
 * Returns true if a session is now available.
 */
export async function tryRestoreSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // Already have a valid local session
  if (localStorage.getItem('kickup_session_id')) return true

  const sid = getCookie()
  if (!sid) return false

  const { data } = await supabase
    .from('users')
    .select('name, avatar')
    .eq('session_id', sid)
    .maybeSingle()

  if (!data) { deleteCookie(); return false }

  localStorage.setItem('kickup_name',       data.name)
  localStorage.setItem('kickup_session_id', sid)
  if (data.avatar) localStorage.setItem('kickup_avatar', data.avatar)

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('session-updated'))
  }
  return true
}

/* ─────────────────────────────────────────────────────────────────────────── */

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
    return { success: false, error: `Eroare DB: ${checkError.message} (${checkError.code})` }
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
    if (error.code === '23505') {
      return { success: false, error: 'Acest nume este deja folosit. Alege altul sau autentifică-te.' }
    }
    return { success: false, error: `Eroare insert: ${error.message} (${error.code})` }
  }

  localStorage.setItem('kickup_name', name.trim())
  localStorage.setItem('kickup_session_id', sessionId)
  setCookie(sessionId)
  // Signal that a brand-new account was just created (shows instructions modal)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('signup-complete'))
  }
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
  setCookie(user.session_id)
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

export async function getProfile(sessionId: string) {
  const { data } = await supabase
    .from('users')
    .select('name, avatar, bio, age, favourite_team, nationality, best_foot, preferred_position')
    .eq('session_id', sessionId)
    .maybeSingle()
  return data
}

export async function updateProfile(sessionId: string, fields: { avatar?: string; bio?: string; age?: number | null; favourite_team?: string; nationality?: string; best_foot?: string; preferred_position?: string }) {
  const { error } = await supabase.from('users').update(fields).eq('session_id', sessionId)
  return !error
}

export async function changePassword(sessionId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, password')
    .eq('session_id', sessionId)
    .maybeSingle()
  if (error) return { success: false, error: 'Eroare de conexiune.' }
  if (!user) return { success: false, error: 'Contul nu a fost găsit.' }
  if (user.password !== oldPassword) return { success: false, error: 'Parola veche este greșită.' }
  const { error: updateError } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', user.id)
  if (updateError) return { success: false, error: 'Eroare la actualizare.' }
  return { success: true }
}

export function isAdmin(name: string): boolean {
  return name.trim().toLowerCase() === 'admin'
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
