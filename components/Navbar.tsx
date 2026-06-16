'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Shield } from 'lucide-react'
import { getSession, getInitials, isAdmin, hashColor, clearSession } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'
import { motion } from 'framer-motion'

const NAV_LINKS = [
  { href: '/',        label: 'Acasă' },
  { href: '/meciuri', label: 'Meciuri' },
]

export function Navbar() {
  const pathname = usePathname()
  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [avatar, setAvatar] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const { open } = useNameModal()

  const isHome = pathname === '/'

  useEffect(() => {
    const s = getSession()
    setSession(s)
    setAvatar(localStorage.getItem('kickup_avatar') || '')
    const handler = () => { setSession(getSession()); setAvatar(localStorage.getItem('kickup_avatar') || '') }
    const avatarHandler = () => setAvatar(localStorage.getItem('kickup_avatar') || '')
    window.addEventListener('session-updated', handler)
    window.addEventListener('avatar-updated', avatarHandler)
    return () => {
      window.removeEventListener('session-updated', handler)
      window.removeEventListener('avatar-updated', avatarHandler)
    }
  }, [])

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const admin = session && isAdmin(session.name)

  // At the top of the home page: dark green frosted navbar
  // Once scrolled (or on any other page): glass/white navbar
  const transparent = isHome && !scrolled
  const textColor = transparent ? 'text-white/90' : 'text-gray-600'
  const logoColor = transparent ? 'text-white' : 'gradient-text'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b px-4 h-16 flex items-center justify-between transition-all duration-300 ${transparent ? '' : 'glass border-black/[0.06]'}`}
      style={transparent ? {
        background: 'rgba(8, 24, 12, 0.72)',
        borderColor: 'rgba(22, 163, 74, 0.18)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      } : {}}
    >
      <Link href="/" className={`text-xl font-black tracking-tight ${logoColor}`}>
        KickUp
      </Link>

      <div className="flex items-center gap-1">
        {/* Nav links (desktop only) */}
        <div className="hidden md:flex items-center gap-1 mr-2">
          {NAV_LINKS.map(link => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? transparent ? 'text-white' : 'text-green-700 bg-green-50'
                    : transparent ? 'text-white/70 hover:text-white hover:bg-white/10' : `${textColor} hover:text-gray-900 hover:bg-gray-100`
                }`}>
                {link.label}
                {active && !transparent && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Create game (desktop) */}
        {session && (
          <Link href="/create"
            className={`hidden md:flex items-center px-4 py-2 rounded-full text-sm font-bold mr-2 transition-all ${
              transparent
                ? 'border border-white/25 text-white hover:bg-white/10'
                : 'btn-gradient'
            }`}>
            Creează meci
          </Link>
        )}

        {/* Account */}
        {session ? (
          <div className="relative ml-1" ref={accountRef}>
            <button onClick={() => setAccountOpen(!accountOpen)}
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0 ring-2 ring-white/20"
              style={{ background: avatar ? undefined : `linear-gradient(135deg, ${hashColor(session.name)}, #0d9488)` }}>
              {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : getInitials(session.name)}
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-11 bg-white rounded-xl p-3 w-52 shadow-xl border border-black/[0.07] animate-fade-in">
                <p className="text-gray-900 font-semibold text-sm mb-0.5">{session.name}</p>
                <p className="text-gray-400 text-xs mb-3">{admin ? 'Administrator' : 'Jucător'}</p>

                <Link href="/create" onClick={() => setAccountOpen(false)}
                  className="block text-sm text-green-600 hover:text-green-700 transition-colors mb-2 font-medium">
                  Creează un meci
                </Link>
                <Link href="/my-matches" onClick={() => setAccountOpen(false)}
                  className="block text-sm text-gray-500 hover:text-gray-700 transition-colors mb-1">
                  Meciurile mele
                </Link>
                {admin && (
                  <Link href="/admin" onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors mb-2 font-medium">
                    <Shield size={13} /> Panou admin
                  </Link>
                )}
                <Link href="/account" onClick={() => setAccountOpen(false)}
                  className="block text-sm text-gray-500 hover:text-gray-700 transition-colors mb-1">
                  Editează contul
                </Link>
                <div className="border-t border-black/[0.05] pt-2">
                  <button onClick={() => {
                    clearSession()
                    window.location.href = '/'
                  }} className="text-sm text-red-400 hover:text-red-600 transition-colors w-full text-left">
                    Deconectare
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => open()}
            className={`ml-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              transparent
                ? 'border border-white/25 text-white hover:bg-white/10'
                : 'btn-gradient'
            }`}>
            Intră
          </button>
        )}
      </div>
    </nav>
  )
}
