'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronRight, Search, Zap, Trophy, ChevronLeft, Clock, MapPin, Users, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { motion, useInView } from 'framer-motion'
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero'

/* ─── Real FBX football (client-only, no SSR) ─── */
const Football3D = dynamic(() => import('@/components/Football3D'), {
  ssr: false,
  loading: () => (
    <div className="flex-shrink-0" style={{ width: 280, height: 316 }}>
      <div style={{ width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
    </div>
  ),
})

/* ─── Carousel game type ─── */
type CarouselGame = {
  id: string
  name: string
  location: string
  city: string
  date: string
  start_time: string
  end_time: string
  level: string | null
  maxPlayers: number
  currentPlayers: number
  price: string
}

/* ══════════════ VARIANTS ══════════════ */

// Hero left-column container — just provides animate/initial context
const heroContainerVars = {
  initial: {},
  animate: {},
}

// Hero badge
const heroBadgeVars = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, stiffness: 120, damping: 15, delay: 0 },
  },
}

// h1 container — staggers the three word-spans
const heroHeadingVars = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
}

// Each word in the heading
const heroWordVars = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
  },
}

// Tagline paragraph
const heroTaglineVars = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 20, delay: 0.42 },
  },
}

// CTA container — staggers the two buttons
const heroCTAContainerVars = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.15, delayChildren: 0.58 },
  },
}

// Each CTA button
const heroCTABtnVars = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1, scale: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
}

// Stats container — stagger each stat card
const statsContainerVars = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.2, delayChildren: 0.75 },
  },
}

const statItemVars = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 18 },
  },
}

// Ghost card hover
const ghostCardVars = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -8, scale: 1.02,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

// Feature cards
const featureCardVars = {
  rest: { y: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' },
  hover: {
    y: -6,
    boxShadow: '0 0 0 2px rgba(22,163,74,0.28), 0 20px 40px rgba(22,163,74,0.12)',
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

const featureIconVars = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4, scale: 1.12,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

const discoverVars = {
  rest: { opacity: 0, x: -6 },
  hover: {
    opacity: 1, x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

const underlineVars = {
  rest: { scaleX: 0 },
  hover: {
    scaleX: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30, delay: 0.04 },
  },
}

// Footer ⚽ bounce
const soccerBounceVars = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

/* ─── Scroll-reveal helper ─── */
function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.08 })

  const vars = {
    initial: { opacity: 0, y: 28 },
    animate: {
      opacity: 1, y: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 20, delay: delay / 1000 },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={vars}
      initial="initial"
      animate={inView ? 'animate' : 'initial'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Directional step reveal ─── */
function StepReveal({ children, fromX, delay = 0 }: {
  children: React.ReactNode; fromX: number; delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  const vars = {
    initial: { opacity: 0, x: fromX },
    animate: {
      opacity: 1, x: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 20, delay: delay / 1000 },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={vars}
      initial="initial"
      animate={inView ? 'animate' : 'initial'}
    >
      {children}
    </motion.div>
  )
}

/* ─── Animated Counter ─── */
function Counter({ target, suffix = '+' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const dur = 1800, t0 = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1)
          setCount(Math.round((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

/* ─── Ghost Card (floating in hero) ─── */
function GhostCard({ name, city, spots, time, joined, max }: {
  name: string; city: string; spots: number; time: string; joined: number; max: number
}) {
  const pct = Math.round((joined / max) * 100)

  const barFillVars = {
    initial: { width: '0%' },
    animate: {
      width: `${pct}%`,
      transition: { type: 'spring' as const, stiffness: 60, damping: 20, delay: 0.6 },
    },
  }

  return (
    <div className="rounded-3xl"
      style={{
        width: 230,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        padding: '18px 20px',
      }}>
      {/* Live badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          LIVE
        </span>
        <span className="text-[11px] text-white/50 font-medium">{time}</span>
      </div>
      {/* Name */}
      <div className="text-white text-base font-black leading-tight mb-1">{name}</div>
      <div className="text-white/50 text-xs mb-3 font-medium">{city}</div>
      {/* Fill bar */}
      <div className="h-1 rounded-full bg-white/10 mb-2 overflow-hidden">
        <motion.div
          variants={barFillVars}
          initial="initial"
          animate="animate"
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#4ade80,#0d9488)' }}
        />
      </div>
      {/* Spots row */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-white/60">{joined}/{max} jucători</span>
        <span className="text-[11px] font-bold text-orange-400">
          <span className="fire-wiggle">🔥</span> {spots} locuri
        </span>
      </div>
    </div>
  )
}

/* ─── City gradient palette ─── */
const CITY_GRADIENT: Record<string, string> = {
  'Iași':        'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
  'București':   'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
  'Cluj-Napoca': 'linear-gradient(135deg, #1e40af 0%, #0891b2 100%)',
  'Timișoara':   'linear-gradient(135deg, #065f46 0%, #0d9488 100%)',
  'Constanța':   'linear-gradient(135deg, #0f172a 0%, #0e7490 100%)',
  'Brașov':      'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
  'default':     'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
}

function cityGradient(city: string) {
  return CITY_GRADIENT[city] ?? CITY_GRADIENT['default']
}

function spotsLabel(free: number): string {
  if (free <= 0) return '🔴 Complet'
  if (free <= 2) return `🔥 ${free} loc${free === 1 ? '' : 'uri'}`
  if (free <= 5) return `⚡ ${free} locuri`
  return `✅ ${free} locuri libere`
}


export default function LandingPage() {
  const [carouselGames, setCarouselGames] = useState<CarouselGame[]>([])
  const [activeIndex, setActiveIndex]     = useState(2)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  function onCarouselTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function onCarouselTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) scrollCarousel('right')
      else scrollCarousel('left')
    }
  }

  /* Fetch real upcoming games with available spots */
  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const { data: games } = await supabase
        .from('games')
        .select('id, name, location, city, date, start_time, end_time, level, num_teams, players_per_team, price')
        .gte('date', today)
        .eq('is_private', false)
        .order('date', { ascending: true })
        .limit(24)

      if (!games || games.length === 0) return

      const ids = games.map((g: any) => g.id)
      const { data: pRows } = await supabase
        .from('players')
        .select('game_id')
        .in('game_id', ids)
        .eq('status', 'active')

      const countMap: Record<string, number> = {}
      for (const r of (pRows || [])) countMap[r.game_id] = (countMap[r.game_id] || 0) + 1

      const available: CarouselGame[] = games
        .map((g: any) => ({
          ...g,
          maxPlayers:     g.num_teams * g.players_per_team,
          currentPlayers: countMap[g.id] || 0,
        }))
        .filter((g: CarouselGame) => g.currentPlayers < g.maxPlayers)
        .slice(0, 8)

      setCarouselGames(available)
    }
    load()
  }, [])

  const canScrollLeft  = activeIndex > 0
  const canScrollRight = activeIndex < carouselGames.length - 1

  function scrollCarousel(dir: 'left' | 'right') {
    setActiveIndex(i =>
      dir === 'right'
        ? Math.min(i + 1, carouselGames.length - 1)
        : Math.max(i - 1, 0)
    )
  }

  /* Card positional style based on offset from activeIndex */
  function cardStyle(offset: number): React.CSSProperties {
    const STEP = 310
    const ease = 'all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    if (offset === 0)
      return { position:'absolute', left:'50%', top:'50%',
        transform:'translateX(-50%) translateY(-50%) scale(1.04)',
        opacity:1, zIndex:10, transition:ease, width:280 }
    if (Math.abs(offset) === 1)
      return { position:'absolute', left:'50%', top:'50%',
        transform:`translateX(calc(-50% + ${offset*STEP}px)) translateY(-50%) scale(0.88)`,
        opacity:0.5, zIndex:5, transition:ease, width:280, pointerEvents:'none' }
    if (Math.abs(offset) === 2)
      return { position:'absolute', left:'50%', top:'50%',
        transform:`translateX(calc(-50% + ${offset*STEP}px)) translateY(-50%) scale(0.74)`,
        opacity:0.18, zIndex:1, transition:ease, width:280, pointerEvents:'none' }
    return { position:'absolute', left:'50%', top:'50%',
      transform:`translateX(calc(-50% + ${(offset>0?1600:-1600)}px)) translateY(-50%) scale(0.6)`,
      opacity:0, zIndex:0, transition:ease, width:280, pointerEvents:'none' }
  }

  return (
    <div className="-mt-16">
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/hero-video.mp4"
        bgImageSrc="/hero-bg.png"
        title="Fotbal pickup"
        scrollToExpand="Scroll pentru a descoperi ↓"
      >
        <div className="overflow-x-hidden">
      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="py-16 sm:py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10 sm:mb-16">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Simplu de tot</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Cum funcționează?</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 relative">

            {[
              {
                n: '01',
                title: 'Creează-ți contul',
                desc: '30 de secunde. Nume și parolă. Complet gratuit, instant pe orice dispozitiv.',
                from: '#4ade80', to: '#16a34a', delay: 0, dir: -60,
              },
              {
                n: '02',
                title: 'Găsește un meci',
                desc: 'Alege orașul, filtrează după nivel. Sute de meciuri publice sau private te așteaptă.',
                from: '#22c55e', to: '#0d9488', delay: 100, dir: 60,
              },
              {
                n: '03',
                title: 'Joacă fotbal!',
                desc: 'Înscrie-te cu un tap. Organizatorul te vede pe listă. Du-te și joacă fotbal.',
                from: '#16a34a', to: '#0f766e', delay: 200, dir: -60,
              },
            ].map((s, i) => (
              <StepReveal key={i} fromX={s.dir} delay={s.delay}>
                {/* Hover glow wrapper */}
                <motion.div
                  whileHover={{
                    boxShadow: '0 0 0 2px rgba(22,163,74,0.25), 0 8px 24px rgba(22,163,74,0.1)',
                    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
                  }}
                  className="flex sm:block items-start gap-5 p-4 rounded-2xl -m-4"
                >
                  <div className="flex-shrink-0 sm:mb-6 z-10 relative">
                    {/* Number badge — bounces in 0.1s after card */}
                    <motion.div
                      variants={{
                        initial: { scale: 0 },
                        animate: {
                          scale: 1,
                          transition: { type: 'spring' as const, stiffness: 200, damping: 10, delay: (s.delay / 1000) + 0.1 },
                        },
                      }}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                    >
                      {s.n}
                    </motion.div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-[15px]">{s.desc}</p>
                  </div>
                </motion.div>
              </StepReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ GAME CAROUSEL ══════════════ */}
      <section className="py-16 sm:py-24 px-0 overflow-hidden" style={{ background: '#f8fafb' }}>
        <div className="max-w-5xl mx-auto px-5 mb-10">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Meciuri în timp real</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Cauți meciuri de fotbal?</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full bg-white border flex items-center justify-center transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: canScrollLeft ? '#4ade80' : 'rgba(0,0,0,0.08)', color: canScrollLeft ? '#16a34a' : '#9ca3af' }}>
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full bg-white border flex items-center justify-center transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: canScrollRight ? '#4ade80' : 'rgba(0,0,0,0.08)', color: canScrollRight ? '#16a34a' : '#9ca3af' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          </Reveal>
        </div>

        {/* Transform carousel */}
        <div className="relative mx-auto" style={{ height: 280, overflow: 'hidden', maxWidth: '100vw' }}
          onTouchStart={onCarouselTouchStart}
          onTouchEnd={onCarouselTouchEnd}>
          {carouselGames.length === 0 ? (
            [-1, 0, 1].map(offset => (
              <div key={offset} className="rounded-3xl animate-pulse"
                style={{ ...cardStyle(offset), background: 'rgba(0,0,0,0.08)' }} />
            ))
          ) : (
            carouselGames.map((game, idx) => {
              const offset = idx - activeIndex
              if (Math.abs(offset) > 2) return null
              const freeSpots = game.maxPlayers - game.currentPlayers
              return (
                <Link
                  key={game.id}
                  href={offset === 0 ? `/game/${game.id}` : '#'}
                  onClick={e => { if (offset !== 0) { e.preventDefault(); setActiveIndex(idx) } }}
                  className="rounded-3xl overflow-hidden relative group"
                  style={{
                    ...cardStyle(offset),
                    background: cityGradient(game.city),
                    textDecoration: 'none',
                    cursor: offset !== 0 ? 'pointer' : undefined,
                    display: 'block',
                  }}>

                  {offset === 0 && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none rounded-3xl" />
                  )}

                  <div className="relative z-10 p-6 flex flex-col" style={{ height: 240 }}>
                    <span className="self-start text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white/95 border border-white/25">
                      {spotsLabel(freeSpots)}
                    </span>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={12} className="text-white/60" />
                      <span className="text-white/75 text-xs font-bold uppercase tracking-widest">{game.city}</span>
                    </div>

                    <h3 className="text-white text-xl font-black leading-tight mb-1">{game.name}</h3>
                    <p className="text-white/55 text-xs mb-4 leading-snug">{game.location}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
                        <Clock size={11} className="text-white/80" />
                        <span className="text-white/90 text-xs font-semibold">
                          {game.start_time.slice(0,5)} – {game.end_time.slice(0,5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                        <Users size={11} className="text-white/70" />
                        <span className="text-white/80 text-xs font-semibold">
                          {game.currentPlayers}/{game.maxPlayers}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Dot indicators */}
        {carouselGames.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {carouselGames.map((_, i) => (
              <button key={i} onClick={() => setActiveIndex(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === activeIndex ? 20 : 6,
                  height: 6,
                  background: i === activeIndex ? '#16a34a' : 'rgba(0,0,0,0.15)',
                }} />
            ))}
          </div>
        )}

        <Reveal className="text-center mt-8">
          <Link href="/meciuri"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-green-700 border border-green-200 hover:bg-green-50 transition-all"
            style={{ background: 'white' }}>
            Vezi toate meciurile <ChevronRight size={15} />
          </Link>
        </Reveal>

        <p className="text-center text-gray-400 text-xs mt-4 sm:hidden">← trage pentru mai multe →</p>
      </section>

      {/* ══════════════ FEATURES / DE CE KICKUP ══════════════ */}
      <section className="bg-white py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10 sm:mb-16">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">De ce KickUp?</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Fotbal, simplu.</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: <Search size={26} />, bg: 'bg-green-50', fg: 'text-green-600', title: 'Găsește instant', desc: 'Filtrează după oraș, nivel și dată. Meciuri noi în fiecare zi în cel mai popular app pentru fotbal pickup din România.', delay: 0, href: '/meciuri' },
              { icon: <Zap size={26} />, bg: 'bg-amber-50', fg: 'text-amber-500', title: 'Înscrie-te rapid', desc: 'Un singur tap. Confirmat instant. Fără telefoane, fără grupe de WhatsApp, fără bătăi de cap.', delay: 100, href: '/meciuri' },
              { icon: <Trophy size={26} />, bg: 'bg-blue-50', fg: 'text-blue-600', title: 'Fii cunoscut', desc: 'Profil de jucător, istoricul meciurilor, echipa favorită, poziție preferată și picior dominant.', delay: 200, href: '/account' },
            ].map((f, i) => (
              <Reveal key={i} delay={f.delay}>
                <motion.div
                  variants={featureCardVars}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  className="rounded-3xl h-full overflow-hidden"
                  style={{ background: '#fafafa', cursor: 'pointer' }}
                >
                  <Link href={f.href} className="block h-full p-6 sm:p-8 flex flex-col" style={{ textDecoration: 'none' }}>
                    {/* Icon */}
                    <motion.div
                      variants={featureIconVars}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${f.bg} ${f.fg} flex-shrink-0`}
                    >
                      {f.icon}
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-[15px] flex-1">{f.desc}</p>

                    {/* Discover link with draw-in underline */}
                    <motion.div
                      variants={discoverVars}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-green-600 relative self-start"
                    >
                      Descoperă <ChevronRight size={15} />
                      <motion.div
                        variants={underlineVars}
                        className="absolute bottom-0 left-0 h-0.5 bg-green-600 w-full"
                        style={{ originX: 0 }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-20 sm:py-28 px-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0a2010 0%, #0e3018 50%, #071608 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full hero-bg-pulse"
            style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.16) 0%, transparent 70%)' }} />
        </div>
        <Reveal className="relative max-w-2xl mx-auto text-center">
          <motion.div
            variants={soccerBounceVars}
            animate="animate"
            className="text-6xl mb-6 inline-block"
          >
            ⚽
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Gata să joci?</h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">Zeci de meciuri te așteaptă în orașul tău.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/meciuri"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-white font-bold text-xl transition-all duration-200 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)', boxShadow: '0 0 50px rgba(22,163,74,0.5)' }}>
              Explorează meciuri <ChevronRight size={22} />
            </Link>
            <Link href="/create"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl text-white font-semibold text-xl transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
              Creează un meci
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: '#080d0b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-5 pt-14 pb-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10 sm:gap-10">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}>
                <span className="text-white font-black text-base">K</span>
              </div>
              <span className="text-white font-black text-xl tracking-tight">KickUp</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-5">
              Platforma pentru fotbal pickup în România. Găsești meci, te înscrii în secunde, joci.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-green-500 text-xs font-medium">Disponibil în 6 orașe</span>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-5">Meciuri</p>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Toate meciurile', href: '/meciuri' },
                { label: 'Creează meci', href: '/create' },
                { label: 'Meciurile mele', href: '/my-matches' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-500 hover:text-white text-sm transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-5">Cont</p>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Profilul meu', href: '/account' },
                { label: 'Înscrie-te', href: '/meciuri' },
                { label: 'Organizează', href: '/create' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-500 hover:text-white text-sm transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-5xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} KickUp · Fotbal pickup în România
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Confidențialitate</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Termeni de utilizare</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Contact</Link>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-400 transition-colors text-xs font-medium">
                IG
              </a>
              <a href="mailto:contact@kickup.ro"
                className="text-gray-600 hover:text-green-400 transition-colors">
                <Mail size={15} />
              </a>
            </div>
          </div>
        </div>
      </footer>
        </div>
      </ScrollExpandMedia>
    </div>
  )
}
