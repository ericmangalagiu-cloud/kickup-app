export function getSession(): { name: string; sessionId: string } | null {
  if (typeof window === 'undefined') return null
  const name = localStorage.getItem('kickup_name')
  const sessionId = localStorage.getItem('kickup_session_id')
  if (!name || !sessionId) return null
  return { name, sessionId }
}

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
    '#7c3aed', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
  ]
  return colors[Math.abs(hash) % colors.length]
}
