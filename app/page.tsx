'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Zap, Trophy, MapPin, Users, Calendar, Shield } from 'lucide-react'

/* ─── CSS Football Ball ─── */
function FootballBall({ size = 220 }: { size?: number }) {
  return (
    <div className="relative select-none flex-shrink-0" style={{ width: size, height: size + 36 }}>
      <div className="kickup-ball" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="kickup-ball-patches">
          {/* Centre pentagon */}
          <polygon points="50,20 63,29 58,44 42,44 37,29" fill="#111" />
          {/* Bottom */}
          <polygon points="50,80 63,71 58,56 42,56 37,71" fill="#111" />
          {/* Left */}
          <polygon points="20,50 29,37 44,42 44,58 29,63" fill="#111" />
          {/* Right */}
          <polygon points="80,50 71,37 56,42 56,58 71,63" fill="#111" />
          {/* Edges (partially visible) */}
          <polygon points="22,27 10,40 22,50 37,44 35,28" fill="#111" opacity="0.72" />
          <polygon points="78,27 90,40 78,50 63,44 65,28" fill="#111" opacity="0.72" />
          <polygon points="22,73 10,60 22,50 37,56 35,72" fill="#111" opacity="0.72" />
          <polygon points="78,73 90,60 78,50 63,56 65,72" fill="#111" opacity="0.72" />
        </svg>
        <div className="kickup-ball-shine" />
      </div>
      <div className="kickup-ball-shadow" style={{ transform: 'translateX(-50%)', left: '50%' }} />
    </div>
  )
}

/* ─── Animated Counter ─── */
function Counter({ target, suffix = '+' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
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

/* ─── Scroll-reveal wrapper ─── */
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
      style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)' }}>
      {children}
    </div>
  )
}

/* ─── Floating ghost game card ─── */
function GhostCard({ name, city, spots, delay }: { name: string; city: string; spots: number; delay: string }) {
  return (
    <div className="rounded-2xl p-4 w-52 pointer-events-none"
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.10)', animation: `floatCard1 7s ease-in-out ${delay} infinite` }}>
      <div className="text-white text-sm font-bold mb-2">{name}</div>
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2.5">
        <MapPin size={10} /> {city}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-orange-400 font-semibold">🔥 {spots} locuri</span>
        <span className="text-xs bg-green-900/60 text-green-400 px-2 py-0.5 rounded-full">Open</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center"
        style={{ background: 'linear-gradient(150deg, #040f06 0%, #071a0b 45%, #020a04 100%)' }}>

        {/* Ambient blobs */}
        <div className="absolute top-24 right-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-8 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-8 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-5 pt-24 pb-28 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0">

            {/* ── Left: Text ── */}
            <div className="flex-1 max-w-xl text-center lg:text-left">
              {/* Badge */}
              <div className="hero-anim-1 inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-sm font-medium text-green-400"
                style={{ background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.25)' }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                Fotbal pickup în toată România
              </div>

              {/* Headline */}
              <div className="hero-anim-2">
                <h1 className="font-black leading-none mb-6"
                  style={{ fontSize: 'clamp(58px, 9vw, 100px)' }}>
                  <span className="block text-white">Găsește</span>
                  <span className="block"
                    style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 40%, #16a34a 65%, #0d9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    meciuri
                  </span>
                  <span className="block text-white">lângă tine</span>
                </h1>
              </div>

              <p className="hero-anim-3 text-gray-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
                Organizează sau înscrie-te într-un meci de fotbal pickup în câteva secunde. Fără complicații.
              </p>

              {/* CTAs */}
              <div className="hero-anim-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/meciuri"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)', boxShadow: '0 0 40px rgba(22,163,74,0.4)' }}>
                  Explorează meciuri <ChevronRight size={20} />
                </Link>
                <Link href="/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-200 hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  Creează un meci
                </Link>
              </div>
            </div>

            {/* ── Right: Ball + floating cards ── */}
            <div className="relative flex-shrink-0 mt-8 lg:mt-0">
              {/* Floating ghost cards */}
              <div className="absolute -left-48 top-4 hidden lg:block" style={{ animation: 'floatCard1 7s ease-in-out infinite' }}>
                <GhostCard name="5vs5 Floreasca" city="București" spots={3} delay="0s" />
              </div>
              <div className="absolute -right-44 bottom-12 hidden lg:block" style={{ animation: 'floatCard2 8s ease-in-out 1.2s infinite' }}>
                <GhostCard name="Seara de Fotbal" city="Cluj-Napoca" spots={1} delay="0s" />
              </div>

              {/* The ball */}
              <FootballBall size={220} />
            </div>
          </div>

          {/* Stats row */}
          <div className="hero-anim-5 grid grid-cols-3 gap-2 sm:gap-6 mt-16 max-w-sm sm:max-w-md mx-auto lg:mx-0 border-t pt-8"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { target: 340, suffix: '+', label: 'Jucători' },
              { target: 28, suffix: '+', label: 'Meciuri active' },
              { target: 20, suffix: '', label: 'Orașe' },
            ].map((s, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: 'block' }}>
            <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,10 1440,36 L1440,72 L0,72 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="bg-white py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">De ce KickUp?</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Fotbal, simplu.</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: <Search size={26} />,
                bg: 'bg-green-50', fg: 'text-green-600',
                title: 'Găsește instant',
                desc: 'Filtrează după oraș, nivel și dată. Meciuri noi în fiecare zi în cel mai popular app pentru fotbal pickup din România.',
                delay: 0,
              },
              {
                icon: <Zap size={26} />,
                bg: 'bg-amber-50', fg: 'text-amber-500',
                title: 'Înscrie-te rapid',
                desc: 'Un singur tap. Confirmat instant. Fără telefoane, fără grupe de WhatsApp, fără bătăi de cap.',
                delay: 100,
              },
              {
                icon: <Trophy size={26} />,
                bg: 'bg-blue-50', fg: 'text-blue-600',
                title: 'Fii cunoscut',
                desc: 'Profil de jucător, istoricul meciurilor, echipa favorită, poziție și picior dominant.',
                delay: 200,
              },
            ].map((f, i) => (
              <Reveal key={i} delay={f.delay}>
                <div className="rounded-3xl p-8 h-full border border-black/[0.06] hover:border-green-300 hover:shadow-xl transition-all duration-300 group cursor-default"
                  style={{ background: '#fafafa' }}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${f.bg} ${f.fg} group-hover:scale-110 transition-transform duration-300`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-24 px-5" style={{ background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-3">Simplu ca 1-2-3</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Cum funcționează?</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden sm:block absolute top-7 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-0.5 bg-gradient-to-r from-green-200 via-green-300 to-green-200" />

            {[
              {
                n: '01',
                title: 'Creează-ți contul',
                desc: '30 de secunde. Nume și parolă. Fără mail, fără verificare, instant pe orice dispozitiv.',
                from: '#4ade80', to: '#16a34a',
                delay: 0,
              },
              {
                n: '02',
                title: 'Găsește un meci',
                desc: 'Alege orașul, filtrează după nivel. Sute de meciuri publice sau private te așteaptă.',
                from: '#22c55e', to: '#0d9488',
                delay: 130,
              },
              {
                n: '03',
                title: 'Joacă fotbal!',
                desc: 'Înscrie-te cu un tap. Organizatorul te vede pe listă. Du-te și joacă fotbal.',
                from: '#16a34a', to: '#0f766e',
                delay: 260,
              },
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

      {/* ══════════════════════════════════════════
          SOCIAL PROOF / CITIES
      ══════════════════════════════════════════ */}
      <section className="bg-white py-16 px-5 border-y border-black/[0.05]">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Meciuri active în</p>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-3">
            {['București','Cluj-Napoca','Timișoara','Iași','Constanța','Brașov','Craiova','Galați','Ploiești','Oradea','Sibiu','Arad','Bacău','Pitești','Baia Mare'].map(city => (
              <Reveal key={city}>
                <Link href={`/meciuri?city=${city}`}
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 border border-black/[0.07] hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all">
                  {city}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 px-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #040f06 0%, #071a0b 50%, #020a04 100%)' }}>
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.14) 0%, transparent 70%)' }} />
        </div>
        <Reveal className="relative max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 block">⚽</div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Gata să joci?</h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Zeci de meciuri te așteaptă în orașul tău. Alătură-te comunității KickUp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/meciuri"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-white font-bold text-xl transition-all duration-200 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)', boxShadow: '0 0 50px rgba(22,163,74,0.5)' }}>
              Explorează meciuri <ChevronRight size={22} />
            </Link>
            <Link href="/create"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-white font-semibold text-xl transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
              Creează un meci
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-8 px-5 text-center">
        <p className="text-gray-600 text-sm">© 2025 KickUp · Fotbal pickup în România</p>
      </footer>
    </div>
  )
}
