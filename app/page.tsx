'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Zap, Trophy, ChevronLeft } from 'lucide-react'

/* ─── Better Football Ball ─── */
function FootballBall({ size = 240 }: { size?: number }) {
  return (
    <div className="relative select-none flex-shrink-0" style={{ width: size, height: size + 40 }}>
      <div className="kickup-ball" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="kickup-ball-patches">
          {/*
            Classic football pattern — 5 black pentagons arranged around
            a white hexagonal center, exactly like the ⚽ emoji / Adidas Telstar.
            Ball is WHITE so the black patches read immediately as football.
          */}

          {/* ── TOP pentagon (fully visible, pointing down into ball) ── */}
          <polygon points="50,11 65,19 62,36 38,36 35,19" fill="#111"/>

          {/* ── TOP-RIGHT pentagon (partially cut by sphere edge) ── */}
          <polygon points="66,37 80,35 89,47 85,62 70,60" fill="#1a1a1a" opacity="0.92"/>

          {/* ── BOTTOM-RIGHT pentagon (curving away, slightly faded) ── */}
          <polygon points="58,62 73,62 80,75 69,86 54,82" fill="#1a1a1a" opacity="0.78"/>

          {/* ── BOTTOM-LEFT pentagon (curving away, slightly faded) ── */}
          <polygon points="42,62 27,62 20,75 31,86 46,82" fill="#1a1a1a" opacity="0.78"/>

          {/* ── TOP-LEFT pentagon (partially cut by sphere edge) ── */}
          <polygon points="34,37 20,35 11,47 15,62 30,60" fill="#1a1a1a" opacity="0.92"/>

          {/* ── Seam lines between patches (thin lines = stitching) ── */}
          <line x1="62" y1="36" x2="66" y2="37" stroke="#333" strokeWidth="1" opacity="0.55"/>
          <line x1="38" y1="36" x2="34" y2="37" stroke="#333" strokeWidth="1" opacity="0.55"/>
          <line x1="70" y1="60" x2="73" y2="62" stroke="#333" strokeWidth="1" opacity="0.50"/>
          <line x1="58" y1="62" x2="54" y2="62" stroke="#333" strokeWidth="1" opacity="0.45"/>
          <line x1="42" y1="62" x2="46" y2="62" stroke="#333" strokeWidth="1" opacity="0.45"/>
          <line x1="27" y1="62" x2="30" y2="60" stroke="#333" strokeWidth="1" opacity="0.50"/>
        </svg>
        <div className="kickup-ball-shine" />
      </div>
      <div className="kickup-ball-shadow" style={{ left: '50%' }} />
    </div>
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

/* ─── Scroll reveal ─── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className}
      style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(28px)' }}>
      {children}
    </div>
  )
}

/* ─── Ghost Card (floating in hero) ─── */
function GhostCard({ name, city, spots }: { name: string; city: string; spots: number }) {
  return (
    <div className="rounded-2xl p-4 w-48 pointer-events-none"
      style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="text-white text-sm font-bold mb-1.5">{name}</div>
      <div className="text-gray-400 text-xs mb-2">{city}</div>
      <span className="text-[11px] font-semibold text-orange-400">🔥 {spots} locuri</span>
    </div>
  )
}

/* ─── Venue Carousel Data ─── */
const CARDS = [
  {
    emoji: '⚽', title: '5v5 de Seară', tag: 'Cel mai popular',
    desc: 'Meciuri rapide pe teren sintetic, după program. Înscrie-te cu un tap.',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)',
    detail: 'Teren sintetic · Iluminat · 18:00–22:00',
  },
  {
    emoji: '🏟️', title: '7v7 Weekend', tag: 'Top ales',
    desc: 'Sâmbătă dimineața, teren mare, jucători de toate nivelele. Family friendly.',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
    detail: 'Teren natural · Vestiare · 09:00–13:00',
  },
  {
    emoji: '🔒', title: 'Meci Privat', tag: 'Cu prietenii',
    desc: 'Setează o parolă, invită-ți cercul. Nimeni altcineva nu intră.',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    detail: 'Access cod · Orice teren · Orice oră',
  },
  {
    emoji: '🌙', title: 'Pickup Nocturn', tag: 'Adrenalina',
    desc: 'Terenuri iluminate, 20:00–23:00. Cei mai buni jucători ies noaptea.',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0e7490 100%)',
    detail: 'Terenuri full iluminate · Nivel mixt',
  },
  {
    emoji: '🏆', title: 'Nivel Advanced', tag: 'Pro',
    desc: 'Preselectie de jucători, formatie tactica, meci serios. Vino pregatit.',
    gradient: 'linear-gradient(135deg, #b45309 0%, #dc2626 100%)',
    detail: 'Jucat competitiv · Max 14 jucatori',
  },
  {
    emoji: '🥅', title: 'Turneu 1 Seară', tag: 'Nou',
    desc: '4 echipe, faze eliminatorii, câștigătoarea ia tot. 1 seară, amintiri pe viață.',
    gradient: 'linear-gradient(135deg, #065f46 0%, #16a34a 100%)',
    detail: '4 echipe · Sistem turneu · Trofeu',
  },
]

export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollCarousel(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center"
        style={{ background: 'linear-gradient(150deg, #0a2010 0%, #0e3018 40%, #071608 100%)' }}>

        {/* Ambient glows — bigger, more vibrant */}
        <div className="absolute top-16 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-10 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-5 pt-24 pb-32 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

            {/* Left */}
            <div className="flex-1 max-w-xl text-center lg:text-left">
              <div className="hero-anim-1 inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-sm font-medium text-green-300"
                style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.30)' }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                Fotbal pickup în toată România
              </div>

              <div className="hero-anim-2">
                <h1 className="font-black leading-none mb-6" style={{ fontSize: 'clamp(54px, 8.5vw, 96px)' }}>
                  <span className="block text-white">Găsește</span>
                  <span className="block"
                    style={{ background: 'linear-gradient(135deg, #86efac 0%, #4ade80 35%, #22c55e 65%, #0d9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    meciuri
                  </span>
                  <span className="block text-white/90">lângă tine</span>
                </h1>
              </div>

              <p className="hero-anim-3 text-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
                Organizează sau înscrie-te într-un meci de fotbal pickup. Fără complicații, în câteva secunde.
              </p>

              <div className="hero-anim-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/meciuri"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 hover:scale-[1.03] hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)', boxShadow: '0 0 40px rgba(22,163,74,0.45)' }}>
                  Explorează meciuri <ChevronRight size={20} />
                </Link>
                <Link href="/create"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-200 hover:bg-white/8"
                  style={{ border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                  Creează un meci
                </Link>
              </div>
            </div>

            {/* Right: Ball + floating cards */}
            <div className="relative flex-shrink-0 mt-6 lg:mt-0">
              <div className="absolute -left-52 top-4 opacity-70 pointer-events-none hidden lg:block"
                style={{ animation: 'floatCard1 7s ease-in-out infinite' }}>
                <GhostCard name="5vs5 Floreasca" city="București" spots={3} />
              </div>
              <div className="absolute -right-48 bottom-10 opacity-60 pointer-events-none hidden lg:block"
                style={{ animation: 'floatCard2 8s ease-in-out 1.5s infinite' }}>
                <GhostCard name="Seara de Fotbal" city="Cluj-Napoca" spots={1} />
              </div>
              <FootballBall size={240} />
            </div>
          </div>

          {/* Stats */}
          <div className="hero-anim-5 grid grid-cols-3 gap-4 mt-16 max-w-sm sm:max-w-md mx-auto lg:mx-0 border-t pt-8"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {[
              { target: 340, suffix: '+', label: 'Jucători' },
              { target: 28, suffix: '+', label: 'Meciuri active' },
              { target: 20, suffix: '', label: 'Orașe' },
            ].map((s, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div className="text-gray-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ width: '100%', height: 72, display: 'block' }}>
            <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,10 1440,36 L1440,72 L0,72 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="bg-white py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">De ce KickUp?</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Fotbal, simplu.</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: <Search size={26} />, bg: 'bg-green-50', fg: 'text-green-600', title: 'Găsește instant', desc: 'Filtrează după oraș, nivel și dată. Meciuri noi în fiecare zi în cel mai popular app pentru fotbal pickup din România.', delay: 0 },
              { icon: <Zap size={26} />, bg: 'bg-amber-50', fg: 'text-amber-500', title: 'Înscrie-te rapid', desc: 'Un singur tap. Confirmat instant. Fără telefoane, fără grupe de WhatsApp, fără bătăi de cap.', delay: 100 },
              { icon: <Trophy size={26} />, bg: 'bg-blue-50', fg: 'text-blue-600', title: 'Fii cunoscut', desc: 'Profil de jucător, istoricul meciurilor, echipa favorită, poziție preferată și picior dominant.', delay: 200 },
            ].map((f, i) => (
              <Reveal key={i} delay={f.delay}>
                <div className="rounded-3xl p-8 h-full border border-black/[0.06] hover:border-green-300 hover:shadow-xl transition-all duration-300 group cursor-default" style={{ background: '#fafafa' }}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${f.bg} ${f.fg} group-hover:scale-110 transition-transform duration-300`}>{f.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ VENUE CAROUSEL ══════════════ */}
      <section className="py-24 px-0 overflow-hidden" style={{ background: '#f8fafb' }}>
        <div className="max-w-5xl mx-auto px-5 mb-10">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Tipuri de meciuri</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Ce poți organiza</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => scrollCarousel('left')}
                className="w-10 h-10 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-gray-500 hover:text-green-700 hover:border-green-400 transition-all shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollCarousel('right')}
                className="w-10 h-10 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-gray-500 hover:text-green-700 hover:border-green-400 transition-all shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </Reveal>
        </div>

        {/* Scrollable carousel */}
        <div ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', paddingLeft: 'calc((100vw - 960px)/2)', paddingRight: 'calc((100vw - 960px)/2)', scrollPaddingLeft: 'calc((100vw - 960px)/2)' }}>
          {CARDS.map((card, i) => (
            <div key={i}
              className="snap-start flex-shrink-0 rounded-3xl p-7 flex flex-col justify-between overflow-hidden relative"
              style={{ width: 300, minHeight: 200, background: card.gradient }}>
              {/* Background decoration */}
              <div className="absolute -right-8 -bottom-8 text-[120px] opacity-15 leading-none select-none pointer-events-none">
                {card.emoji}
              </div>
              {/* Tag */}
              <div className="inline-flex self-start">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white/90 border border-white/20">
                  {card.tag}
                </span>
              </div>
              {/* Content */}
              <div>
                <div className="text-3xl mb-2">{card.emoji}</div>
                <h3 className="text-white text-xl font-black mb-2">{card.title}</h3>
                <p className="text-white/75 text-sm leading-relaxed mb-3">{card.desc}</p>
                <p className="text-white/50 text-xs font-medium">{card.detail}</p>
              </div>
            </div>
          ))}
          {/* Trailing spacer */}
          <div className="flex-shrink-0 w-4" />
        </div>

        {/* Scroll hint */}
        <p className="text-center text-gray-400 text-xs mt-4 sm:hidden">← trage pentru mai multe →</p>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Joacă fotbal, de plăcere</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Cum funcționează?</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            <div className="hidden sm:block absolute top-7 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-0.5 bg-gradient-to-r from-green-200 via-green-300 to-green-200" />
            {[
              { n: '01', title: 'Creează-ți contul', desc: '30 de secunde. Nume și parolă. Fără mail, fără verificare, instant pe orice dispozitiv.', from: '#4ade80', to: '#16a34a', delay: 0 },
              { n: '02', title: 'Găsește un meci', desc: 'Alege orașul, filtrează după nivel. Sute de meciuri publice sau private te așteaptă.', from: '#22c55e', to: '#0d9488', delay: 130 },
              { n: '03', title: 'Joacă fotbal!', desc: 'Înscrie-te cu un tap. Organizatorul te vede pe listă. Du-te și joacă fotbal.', from: '#16a34a', to: '#0f766e', delay: 260 },
            ].map((s, i) => (
              <Reveal key={i} delay={s.delay}>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg z-10 relative"
                    style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
                    {s.n}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-28 px-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0a2010 0%, #0e3018 50%, #071608 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.16) 0%, transparent 70%)' }} />
        </div>
        <Reveal className="relative max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">⚽</div>
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

      <footer className="bg-gray-950 py-8 px-5 text-center">
        <p className="text-gray-600 text-sm">© 2025 KickUp · Fotbal pickup în România</p>
      </footer>
    </div>
  )
}
