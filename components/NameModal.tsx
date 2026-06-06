'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { getSession, signUp, logIn } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'

type Mode = 'signup' | 'login'

export function NameModal() {
  const { isOpen, open, close } = useNameModal()
  const [mode, setMode] = useState<Mode>('signup')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const session = getSession()
    if (!session) open()
  }, [])

  // Reset fields when mode changes
  useEffect(() => {
    setError('')
    setPassword('')
    setName('')
  }, [mode])

  if (!mounted || !isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !password.trim()) return

    const isChangingAccount = !!getSession()

    let result
    if (mode === 'signup') {
      result = signUp(name.trim(), password)
    } else {
      result = logIn(name.trim(), password)
    }

    if (!result.success) {
      setError(result.error || 'Eroare.')
      return
    }

    window.dispatchEvent(new Event('session-updated'))
    close()

    // Always go to homepage after any auth action so state is clean
    window.location.href = '/'
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
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Înregistrare
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Autentificare
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {mode === 'signup' ? 'Creează o parolă' : 'Parola ta'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder={mode === 'signup' ? 'Minim 4 caractere' : 'Introdu parola'}
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

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || !password.trim()}
            className="btn-gradient w-full py-3 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'signup' ? 'Creează cont' : 'Intră în cont'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          {mode === 'signup'
            ? 'Ai deja un cont? '
            : 'Nu ai cont? '}
          <button
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="text-green-600 font-medium hover:underline"
          >
            {mode === 'signup' ? 'Autentifică-te' : 'Înregistrează-te'}
          </button>
        </p>
      </div>
    </div>
  )
}
