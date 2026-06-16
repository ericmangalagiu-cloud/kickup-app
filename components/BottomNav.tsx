'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Search, PlusCircle, User, BookMarked } from 'lucide-react'
import { getSession } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { href: '/',           label: 'Acasă',    Icon: Home },
  { href: '/meciuri',    label: 'Meciuri',  Icon: Search },
  { href: '/create',     label: 'Creează',  Icon: PlusCircle },
  { href: '/my-matches', label: 'Ale mele', Icon: BookMarked },
  { href: '/account',    label: 'Profil',   Icon: User },
]

const PROTECTED = ['/account', '/my-matches', '/create']

/* Active icon bounces up; inactive sits at 0 */
const iconVariants = {
  inactive: { y: 0, scale: 1 },
  active: {
    y: -4,
    scale: 1.1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
}

/* Label fades in bolder on active */
const labelVariants = {
  inactive: { opacity: 0.55, fontWeight: 600 },
  active: {
    opacity: 1,
    fontWeight: 700,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

/* Ripple circle — scale 0 → 3, opacity 0.25 → 0 */
const rippleVariants = {
  initial: { scale: 0, opacity: 0.25 },
  animate: {
    scale: 3,
    opacity: 0,
    transition: { duration: 0.65, ease: 'easeOut' as const },
  },
}

type Ripple = { id: number; x: number; y: number }

function NavTab({
  tab,
  active,
  onClick,
  children,
}: {
  tab: typeof TABS[0]
  active: boolean
  onClick?: (e: React.MouseEvent) => void
  children: React.ReactNode
}) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700)
    onClick?.(e)
  }

  const state = active ? 'active' : 'inactive'

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-1 relative z-10 overflow-hidden cursor-pointer"
      style={{ color: active ? '#16a34a' : '#9ca3af', height: 60 }}
      onClick={handleClick}
    >
      {/* Ripple circles */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            variants={rippleVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
            className="absolute rounded-full bg-green-400 pointer-events-none"
            style={{
              width: 36,
              height: 36,
              left: r.x - 18,
              top: r.y - 18,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Icon */}
      <motion.div variants={iconVariants} animate={state}>
        <tab.Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
      </motion.div>

      {/* Label */}
      <motion.span
        variants={labelVariants}
        animate={state}
        className="text-[10px] leading-none"
      >
        {tab.label}
      </motion.span>

      {children}
    </div>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const [session, setSession] = useState<{ name: string } | null>(null)
  const { open } = useNameModal()

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

  const activeIdx = TABS.findIndex(t =>
    t.href === '/' ? pathname === '/' : pathname.startsWith(t.href)
  )
  const pillWidth = 100 / TABS.length

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="relative flex items-stretch" style={{ height: 60 }}>
        {/* Sliding green pill behind active tab */}
        <AnimatePresence>
          {activeIdx >= 0 && (
            <motion.div
              key={activeIdx}
              layoutId="bottom-nav-pill"
              className="absolute top-1.5 bottom-1.5 rounded-xl"
              style={{
                width: `calc(${pillWidth}% - 8px)`,
                left: `calc(${activeIdx * pillWidth}% + 4px)`,
                background: 'rgba(22,163,74,0.10)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </AnimatePresence>

        {TABS.map((tab, i) => {
          const active    = i === activeIdx
          const needsAuth = PROTECTED.includes(tab.href) && !session

          if (needsAuth) {
            return (
              <NavTab
                key={tab.href}
                tab={tab}
                active={active}
                onClick={() => open(tab.href)}
              >
                {null}
              </NavTab>
            )
          }

          return (
            <Link key={tab.href} href={tab.href} className="flex-1 block">
              <NavTab tab={tab} active={active}>
                {null}
              </NavTab>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
