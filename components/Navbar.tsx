'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { getSession, updateName, getInitials } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'

export function Navbar() {
  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { open } = useNameModal()

  useEffect(() => {
    const s = getSession()
    setSession(s)
    const handler = () => setSession(getSession())
    window.addEventListener('session-updated', handler)
    return () => window.removeEventListener('session-updated', handler)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06] px-4 h-16 flex items-center justify-between">
      <Link href="/" className="gradient-text text-xl font-bold tracking-tight">
        ⚽ KickUp
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/create"
          className="btn-gradient px-4 py-2 text-sm font-semibold hidden sm:block"
        >
          Create Game
        </Link>
        {session && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {getInitials(session.name)}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-11 glass rounded-xl p-3 w-48 shadow-xl border border-white/[0.08] animate-fade-in">
                <p className="text-white font-semibold text-sm mb-1">{session.name}</p>
                <p className="text-zinc-500 text-xs mb-3">Beta member</p>
                <button
                  onClick={() => { setDropdownOpen(false); open() }}
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors w-full text-left"
                >
                  Change name →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
