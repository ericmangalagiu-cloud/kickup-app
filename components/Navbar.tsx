'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, MapPin, Shield, Home } from 'lucide-react'
import { getSession, getInitials, isAdmin } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'
import { useCityStore, ROMANIAN_CITIES } from '@/hooks/useCityStore'

export function Navbar() {
  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)
  const { open } = useNameModal()
  const { selectedCity, setCity } = useCityStore()

  useEffect(() => {
    const s = getSession()
    setSession(s)
    const handler = () => setSession(getSession())
    window.addEventListener('session-updated', handler)
    return () => window.removeEventListener('session-updated', handler)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const admin = session && isAdmin(session.name)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-black/[0.06] px-4 h-16 flex items-center justify-between">
      <Link href="/" className="gradient-text text-xl font-bold tracking-tight">
        KickUp
      </Link>

      <div className="flex items-center gap-2">
        {/* Home button */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all"
        >
          <Home size={15} />
          <span className="hidden sm:inline">Acasă</span>
        </Link>

        {/* Create game */}
        {session && (
          <Link
            href="/create"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium btn-gradient"
          >
            Creează un meci
          </Link>
        )}

        {/* City Selector */}
        <div className="relative" ref={cityRef}>
          <button
            onClick={() => setCityOpen(!cityOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass border border-black/[0.08] text-sm font-medium text-gray-700 hover:border-green-400 hover:text-green-700 transition-all"
          >
            <MapPin size={14} className="text-green-600" />
            <span className="hidden sm:inline">{selectedCity || 'Oraș'}</span>
            <ChevronDown size={14} className={`transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
          </button>
          {cityOpen && (
            <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-black/[0.07] w-52 max-h-72 overflow-y-auto animate-fade-in z-50">
              <button
                onClick={() => { setCity(''); setCityOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-green-50 ${!selectedCity ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-600'}`}
              >
                Toate orașele
              </button>
              {ROMANIAN_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => { setCity(city); setCityOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-green-50 ${selectedCity === city ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-700'}`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account */}
        {session && (
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}
            >
              {getInitials(session.name)}
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-11 bg-white rounded-xl p-3 w-52 shadow-xl border border-black/[0.07] animate-fade-in">
                <p className="text-gray-900 font-semibold text-sm mb-0.5">{session.name}</p>
                <p className="text-gray-400 text-xs mb-3">{admin ? 'Administrator' : 'Jucător'}</p>

                <Link
                  href="/create"
                  onClick={() => setAccountOpen(false)}
                  className="block text-sm text-green-600 hover:text-green-700 transition-colors mb-2 font-medium"
                >
                  Creează un meci
                </Link>

                {admin && (
                  <Link
                    href="/admin"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors mb-2 font-medium"
                  >
                    <Shield size={13} /> Panou admin
                  </Link>
                )}

                <Link
                  href="/account"
                  onClick={() => setAccountOpen(false)}
                  className="block text-sm text-gray-500 hover:text-gray-700 transition-colors mb-1"
                >
                  Editează contul
                </Link>

                <button
                  onClick={() => { setAccountOpen(false); open() }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors w-full text-left mb-2"
                >
                  Schimbă contul
                </button>

                <div className="border-t border-black/[0.05] pt-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('kickup_name')
                      localStorage.removeItem('kickup_session_id')
                      window.location.href = '/'
                    }}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors w-full text-left"
                  >
                    Deconectare
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
