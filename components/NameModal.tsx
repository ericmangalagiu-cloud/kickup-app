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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-8 w-full max-w-md mx-0 sm:mx-4 animate-slide-up shadow-xl border border-black/[0.07]">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">What&apos;s your name?</h2>
        <p className="text-gray-400 text-center text-sm mb-6">
          We&apos;ll use this to show you in games
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Marco Rossi"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-gradient w-full py-3 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Let&apos;s Play
          </button>
        </form>
      </div>
    </div>
  )
}
