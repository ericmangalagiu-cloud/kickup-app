const ACCOUNTS_KEY = 'kickup_accounts'

function getRegistry(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveToRegistry(name: string, sessionId: string) {
  const registry = getRegistry()
  registry[name.trim().toLowerCase()] = sessionId
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(registry))
}

function lookupByName(name: string): string | null {
  const registry = getRegistry()
  return registry[name.trim().toLowerCase()] || null
}

export function getSession(): { name: string; sessionId: string } | null {
  if (typeof window === 'undefined') return null
  const name = localStorage.getItem('kickup_name')
  let sessionId = localStorage.getItem('kickup_session_id')
  if (!name) return null
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('kickup_session_id', sessionId)
    saveToRegistry(name, sessionId)
  }
  return { name, sessionId }
}

export function setSession(name: string): string {
  // If this name was used before, restore that session
  const existing = lookupByName(name)
  const sessionId = existing || crypto.randomUUID()
  localStorage.setItem('kickup_name', name)
  localStorage.setItem('kickup_session_id', sessionId)
  saveToRegistry(name, sessionId)
  return sessionId
}

export function updateName(name: string): void {
  // Check if this name maps to a previous account
  const existing = lookupByName(name)
  if (existing) {
    // Restore previous session
    localStorage.setItem('kickup_name', name)
    localStorage.setItem('kickup_session_id', existing)
  } else {
    // New name — keep current sessionId, register this name too
    const currentSessionId = localStorage.getItem('kickup_session_id') || crypto.randomUUID()
    localStorage.setItem('kickup_name', name)
    localStorage.setItem('kickup_session_id', currentSessionId)
    saveToRegistry(name, currentSessionId)
  }
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
