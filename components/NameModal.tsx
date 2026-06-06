'use client'

import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { getSession, signUp, logIn, isLegacyAccount } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'

type Mode = 'signup' | 'login'

export function NameModal() {
  const { isOpen, open, close } = useNameModal()
  const [mode, setMode] = useState<Mode>('signup')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  // Used to suppress the mode-change clear when we programmatically switch mode
  const skipClear = useRef(false)

  useEffect(() => {
    setMounted(true)
    const session = getSession()
    if (!session) {
      open()
    } else {
      isLegacyAccount(session.sessionId).then(legacy => {
        if (legacy) {
          localStorage.removeItem('kickup_name')
          localStorage.removeItem('kickup_session_id')
          open()
        }
      })
    }
  }, [])

  function switchMode(next: Mode) {
    // Manual tab switch → clear everything
    setMode(next)
    setError('')
    setPassword('')
    setName('')
    setShowPassword(false)
  }

  function switchModeKeepName(next: Mode, newError: string) {
    // Programmatic switch (e.g. auto-flip to login) → keep name, set error
    skipClear.current = true
    setMode(next)
    setPassword('')
    setShowPassword(false)
    setError(newError)
  }

  if (!mounted || !isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !password.trim()) return

    setLoading(true)
    try {
      const result = mode === 'signup'
        ? await signUp(name.trim(), password)
        : await logIn(name.trim(), password)

      if (!result.success) {
        if (mode === 'signup' && result.error?.includes('deja folosit')) {
          // Name exists → auto-switch to login and keep the name
          switchModeKeepName('login', 'Nume deja înregistrat. Introdu parola ta.')
        } else {
          setError(result.error || 'Eroare.')
        }
        setLoading(false)
        return
      }

      window.dispatchEvent(new Event('session-updated'))
      close()
      window.location.href = '/'
    } catch (err) {
      console.error('Auth error:', err)
      setError('Eroare de conexiune. Încearcă din nou.')
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-7 w-full max-w-md mx-0 sm:mx-4 animate-slide-up shadow-xl border border-black/[0.07]">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Înregistrare
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Autentificare
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {mode === 'signup' ? 'Alege un nume de utilizator' : 'Numele tău de utilizator'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="ex: Andrei Popescu"
              autoFocus
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {mode === 'signup' ? 'Creează o parolă' : 'Parola ta'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Introdu parola"
                disabled={loading}
                className={inputClass + ' pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || !password.trim() || loading}
            className="btn-gradient w-full py-3 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading
              ? (mode === 'signup' ? 'Se creează contul...' : 'Se verifică...')
              : (mode === 'signup' ? 'Creează cont' : 'Intră în cont')}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          {mode === 'signup' ? 'Ai deja un cont? ' : 'Nu ai cont? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
            className="text-green-600 font-medium hover:underline"
          >
            {mode === 'signup' ? 'Autentifică-te' : 'Înregistrează-te'}
          </button>
        </p>
      </div>
    </div>
  )
}
