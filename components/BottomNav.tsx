'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Search, PlusCircle, User } from 'lucide-react'
import { getSession } from '@/lib/session'

const TABS = [
  { href: '/',        label: 'Acasă',   Icon: Home },
  { href: '/meciuri', label: 'Meciuri', Icon: Search },
  { href: '/create',  label: 'Creează', Icon: PlusCircle },
  { href: '/account', label: 'Profil',  Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const [session, setSession] = useState<{ name: string } | null>(null)

  useEffect(() => {
    setSession(getSession())
    const refresh = () => setSession(getSession())
    window.addEventListener('session-updated', refresh)
    window.addEventListener('signup-complete', refresh)
    return () => {
      window.removeEventListener('session-updated', refresh)
      window.removeEventListener('signup-complete', refresh)
    }
  }, [])

  // Active tab index — match by exact path or prefix
  const activeIdx = TABS.findIndex(t =>
    t.href === '/' ? pathname === '/' : pathname.startsWith(t.href)
  )
  const pillWidth = 100 / TABS.length

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
      <div className="relative flex items-stretch" style={{ height: 60 }}>
        {/* Sliding pill */}
        {activeIdx >= 0 && (
          <div
            className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300 ease-out"
            style={{
              width: `calc(${pillWidth}% - 8px)`,
              left: `calc(${activeIdx * pillWidth}% + 4px)`,
              background: 'rgba(22,163,74,0.10)',
            }}
          />
        )}

        {TABS.map((tab, i) => {
          const active = i === activeIdx
          // If user is not logged in, profile tab shows login prompt
          const href = (tab.href === '/account' && !session) ? '/?login=1' : tab.href
          return (
            <Link key={tab.href} href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative z-10 transition-all duration-200"
              style={{ color: active ? '#16a34a' : '#9ca3af' }}>
              <tab.Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
