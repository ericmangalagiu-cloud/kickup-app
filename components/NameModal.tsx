'use client'

import { useState, useEffect } from 'react'
import { getSession, setSession, updateName } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'

export function NameModal() {
  const { isOpen, open, close } = useNameModal()
  const [name, setName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const session = getSession()
    if (!session) {
      open()
    }
  }, [])

  if (!mounted || !isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const session = getSession()
    if (session) {
      updateName(name.trim())
    } else {
      setSession(name.trim())
    }
    window.dispatchEvent(new Event('session-updated'))
    close()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-t-3xl sm:rounded-2xl p-8 w-full max-w-md mx-0 sm:mx-4 animate-slide-up">
        <div className="text-4xl mb-4 text-center">⚽</div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">What&apos;s your name?</h2>
        <p className="text-zinc-400 text-center text-sm mb-6">
          We&apos;ll use this to show you in games
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Marco Rossi"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-gradient w-full py-3 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Let&apos;s Play →
          </button>
        </form>
      </div>
    </div>
  )
}
