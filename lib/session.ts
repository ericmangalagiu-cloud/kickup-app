const ACCOUNTS_KEY = 'kickup_accounts'

interface Account {
  sessionId: string
  password: string
}

export function getRegistry(): Record<string, Account> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveRegistry(registry: Record<string, Account>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(registry))
}

export function nameExists(name: string): boolean {
  const registry = getRegistry()
  return !!registry[name.trim().toLowerCase()]
}

export function signUp(name: string, password: string): { success: boolean; error?: string } {
  const key = name.trim().toLowerCase()
  const registry = getRegistry()
  if (registry[key]) {
    return { success: false, error: 'Acest nume este deja folosit. Alege altul sau autentifică-te.' }
  }
  const sessionId = crypto.randomUUID()
  registry[key] = { sessionId, password }
  saveRegistry(registry)
  localStorage.setItem('kickup_name', name.trim())
  localStorage.setItem('kickup_session_id', sessionId)
  return { success: true }
}

export function logIn(name: string, password: string): { success: boolean; error?: string } {
  const key = name.trim().toLowerCase()
  const registry = getRegistry()
  const account = registry[key]
  if (!account) {
    return { success: false, error: 'Numele acesta nu există. Înregistrează-te mai întâi.' }
  }
  if (account.password !== password) {
    return { success: false, error: 'Parolă greșită. Încearcă din nou.' }
  }
  localStorage.setItem('kickup_name', name.trim())
  localStorage.setItem('kickup_session_id', account.sessionId)
  return { success: true }
}

export function getSession(): { name: string; sessionId: string } | null {
  if (typeof window === 'undefined') return null
  const name = localStorage.getItem('kickup_name')
  const sessionId = localStorage.getItem('kickup_session_id')
  if (!name || !sessionId) return null
  return { name, sessionId }
}

// Legacy – kept for compatibility but no longer used by modal
export function setSession(name: string): string {
  const sessionId = crypto.randomUUID()
  localStorage.setItem('kickup_name', name)
  localStorage.setItem('kickup_session_id', sessionId)
  return sessionId
}

export function updateName(name: string): void {
  localStorage.setItem('kickup_name', name)
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
