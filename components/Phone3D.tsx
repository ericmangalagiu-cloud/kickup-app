'use client'

import { useEffect, useRef, useState } from 'react'

/* ─── Mini game data for the screen ─── */
const GAMES = [
  { name: 'Derby-ul Copou',       city: 'Iași',       time: '19:00', spots: 3,  joined: 7,  max: 10, pct: 70,  grad: 'linear-gradient(90deg,#16a34a,#0d9488)', full: false },
  { name: 'Leii din Floreasca',   city: 'București',  time: '20:00', spots: 0,  joined: 12, max: 12, pct: 100, grad: 'linear-gradient(90deg,#dc2626,#ef4444)',  full: true  },
  { name: 'Titan All Stars',      city: 'București',  time: '18:00', spots: 5,  joined: 9,  max: 14, pct: 64,  grad: 'linear-gradient(90deg,#16a34a,#0d9488)', full: false },
  { name: 'Fabricanții de Goluri',city: 'Timișoara',  time: '19:30', spots: 2,  joined: 10, max: 12, pct: 83,  grad: 'linear-gradient(90deg,#f59e0b,#ef4444)',  full: false },
  { name: 'Noua Generație',       city: 'Brașov',     time: '17:00', spots: 6,  joined: 6,  max: 12, pct: 50,  grad: 'linear-gradient(90deg,#16a34a,#0d9488)', full: false },
  { name: 'Faleza All Stars',     city: 'Constanța',  time: '18:30', spots: 1,  joined: 11, max: 12, pct: 92,  grad: 'linear-gradient(90deg,#f59e0b,#ef4444)',  full: false },
]

/* ─── Phase durations (ms) ─── */
const DURATIONS = [4200, 3800, 3800]

export default function Phone3D() {
  const [phase, setPhase]         = useState(0)   // 0=scroll 1=create 2=join
  const [scrollY, setScrollY]     = useState(0)
  const [tapped, setTapped]       = useState(false)
  const [formReady, setFormReady] = useState(false)
  const phaseRef = useRef(0)

  /* ── Phase cycling ── */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const advance = () => {
      phaseRef.current = (phaseRef.current + 1) % 3
      setPhase(phaseRef.current)
      setTapped(false)
      setFormReady(false)
      timer = setTimeout(advance, DURATIONS[phaseRef.current])
    }
    timer = setTimeout(advance, DURATIONS[0])
    return () => clearTimeout(timer)
  }, [])

  /* ── Scroll animation (phase 0) ── */
  useEffect(() => {
    if (phase !== 0) { setScrollY(0); return }
    let y = 0, dir = -1, id: number
    const tick = () => {
      y += dir * 1.4
      if (y < -148) dir = 1
      if (y > 0)  { y = 0; dir = -1 }
      setScrollY(y)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [phase])

  /* ── Form fill (phase 1) ── */
  useEffect(() => {
    if (phase !== 1) return
    const t = setTimeout(() => setFormReady(true), 1300)
    return () => clearTimeout(t)
  }, [phase])

  /* ── Tap (phase 2) ── */
  useEffect(() => {
    if (phase !== 2) return
    const t1 = setTimeout(() => setTapped(true), 1900)
    const t2 = setTimeout(() => setTapped(false), 2350)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  /* ── Dimensions ── */
  const PW = 158   // phone width
  const PH = 322   // phone height
  const SW = 144   // screen width  (leaves ~7px bezel each side)
  const SH = 280   // screen height

  return (
    <div style={{
      width: PW + 60, height: PH + 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'floatCard1 7s ease-in-out infinite',
      flexShrink: 0,
    }}>

      {/* ── Phone shell ── */}
      <div style={{
        width: PW, height: PH,
        position: 'relative',
        borderRadius: 38,
        background: 'linear-gradient(160deg, #3a3a3c 0%, #1c1c1e 40%, #0d0d0f 100%)',
        border: '1px solid rgba(255,255,255,0.13)',
        boxShadow: [
          '0 45px 90px rgba(0,0,0,0.65)',
          '0 0 0 1px rgba(0,0,0,0.4)',
          'inset 0 1px 0 rgba(255,255,255,0.12)',
          '-10px 6px 28px rgba(0,0,0,0.35)',
          '3px -3px 16px rgba(255,255,255,0.03)',
        ].join(','),
        transform: 'rotateY(-20deg) rotateX(4deg)',
        transformStyle: 'preserve-3d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Dynamic Island */}
        <div style={{
          position: 'absolute', top: 16, zIndex: 20,
          width: 58, height: 15,
          background: '#000',
          borderRadius: 8,
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
        }} />

        {/* Screen */}
        <div style={{
          width: SW, height: SH,
          background: '#fff',
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}>
          {phase === 0 && <ScrollScreen scrollY={scrollY} />}
          {phase === 1 && <CreateScreen ready={formReady} />}
          {phase === 2 && <JoinScreen tapped={tapped} />}
        </div>

        {/* Home bar */}
        <div style={{
          position: 'absolute', bottom: 11,
          width: 58, height: 4,
          background: 'rgba(255,255,255,0.32)',
          borderRadius: 2,
        }} />

        {/* Power button (right) */}
        <div style={{
          position: 'absolute', right: -3.5, top: '28%',
          width: 3.5, height: 44,
          background: '#2a2a2e',
          borderRadius: '0 2px 2px 0',
        }} />

        {/* Silent switch (left top) */}
        <div style={{
          position: 'absolute', left: -3.5, top: '13%',
          width: 3.5, height: 20,
          background: '#2a2a2e',
          borderRadius: '2px 0 0 2px',
        }} />

        {/* Volume up / down (left) */}
        <div style={{
          position: 'absolute', left: -3.5, top: '22%',
          width: 3.5, height: 30,
          background: '#2a2a2e',
          borderRadius: '2px 0 0 2px',
        }} />
        <div style={{
          position: 'absolute', left: -3.5, top: '34%',
          width: 3.5, height: 30,
          background: '#2a2a2e',
          borderRadius: '2px 0 0 2px',
        }} />

        {/* Subtle left edge shine */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 3,
          borderRadius: '38px 0 0 38px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SCREEN PHASES
═══════════════════════════════════════════════════ */

function ScrollScreen({ scrollY }: { scrollY: number }) {
  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg,#f2f8f4 0%,#f5f9f6 100%)', fontFamily: 'system-ui,-apple-system,sans-serif', overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '28px 12px 0', fontSize: 7.5, color: '#333', fontWeight: 600 }}>
        <span>9:41</span>
        <span style={{ letterSpacing: 1 }}>●●● ▲ 🔋</span>
      </div>
      {/* Header */}
      <div style={{ background: '#fff', margin: '4px 0', padding: '8px 12px 6px', borderBottom: '1px solid #e8f0ec' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>Toate meciurile</div>
        <div style={{ fontSize: 7.5, color: '#16a34a', marginTop: 1, fontWeight: 600 }}>6 meciuri disponibile</div>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {['Nivel ▾', 'Oraș ▾', 'Locuri'].map(f => (
            <div key={f} style={{
              fontSize: 6.5, fontWeight: 600, color: '#374151',
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              padding: '2px 5px', borderRadius: 5,
            }}>{f}</div>
          ))}
        </div>
      </div>
      {/* Scrolling cards */}
      <div style={{ transform: `translateY(${scrollY}px)`, padding: '5px 7px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[...GAMES, ...GAMES.slice(0, 3)].map((g, i) => (
          <MiniCard key={i} g={g} />
        ))}
      </div>
    </div>
  )
}

function MiniCard({ g }: { g: typeof GAMES[0] }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Progress strip */}
      <div style={{ height: 2.5, background: '#f3f4f6' }}>
        <div style={{ height: '100%', width: `${g.pct}%`, background: g.grad, borderRadius: 2 }} />
      </div>
      <div style={{ padding: '6px 7px 5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#111', lineHeight: 1.2, maxWidth: '72%' }}>{g.name}</div>
          <span style={{
            fontSize: 6, fontWeight: 700,
            background: g.full ? '#fee2e2' : g.spots <= 2 ? '#fff7ed' : '#f0fdf4',
            color:      g.full ? '#dc2626' : g.spots <= 2 ? '#ea580c' : '#16a34a',
            padding: '1.5px 4px', borderRadius: 4, whiteSpace: 'nowrap',
          }}>{g.full ? 'Full 🔴' : g.spots <= 2 ? `🔥 ${g.spots}` : `✅ ${g.spots}`}</span>
        </div>
        <div style={{ fontSize: 6.5, color: '#6b7280' }}>📍 {g.city} &nbsp;·&nbsp; 🕐 {g.time}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div style={{ display: 'flex', gap: -3 }}>
            {Array.from({ length: Math.min(g.joined, 5) }).map((_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: 6,
                background: `hsl(${140 + i * 22},60%,45%)`,
                border: '1px solid #fff',
                marginLeft: i > 0 ? -3 : 0,
                fontSize: 5, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} />
            ))}
            {g.joined > 5 && <div style={{ fontSize: 6, color: '#6b7280', marginLeft: 2, alignSelf: 'center' }}>+{g.joined - 5}</div>}
          </div>
          <span style={{ fontSize: 6.5, color: '#16a34a', fontWeight: 700 }}>Vezi →</span>
        </div>
      </div>
    </div>
  )
}

function CreateScreen({ ready }: { ready: boolean }) {
  const fields = [
    { label: 'Numele meciului', val: 'Derby-ul Copou II' },
    { label: 'Locație', val: 'Teren Sintetic Copou' },
    { label: 'Oraș', val: 'Iași' },
    { label: 'Dată', val: '15 Iulie 2026' },
    { label: 'Ora de start', val: '19:00' },
  ]
  return (
    <div style={{ height: '100%', background: '#f9fafb', fontFamily: 'system-ui,-apple-system,sans-serif', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '28px 12px 0', fontSize: 7.5, color: '#333', fontWeight: 600 }}>
        <span>9:41</span><span>●●● 🔋</span>
      </div>
      <div style={{ background: '#fff', padding: '8px 12px 6px', margin: '4px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 7.5, color: '#16a34a', fontWeight: 600 }}>← Înapoi</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#111', marginTop: 2 }}>Creează un meci</div>
      </div>
      <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {fields.map((f, i) => (
          <div key={i}>
            <div style={{ fontSize: 6.5, fontWeight: 600, color: '#374151', marginBottom: 2 }}>{f.label}</div>
            <div style={{
              height: 19, borderRadius: 6,
              background: ready ? '#f0fdf4' : '#f3f4f6',
              border: `1px solid ${ready ? '#86efac' : '#e5e7eb'}`,
              display: 'flex', alignItems: 'center', padding: '0 6px',
              fontSize: 7, color: ready ? '#166534' : '#9ca3af',
              transition: 'all 0.5s ease',
              transitionDelay: `${i * 80}ms`,
            }}>
              {ready ? f.val : <span style={{ opacity: 0.4 }}>{f.label.toLowerCase()}...</span>}
            </div>
          </div>
        ))}
        <button style={{
          marginTop: 4, height: 24, borderRadius: 8, border: 'none',
          background: ready ? 'linear-gradient(135deg,#16a34a,#0d9488)' : '#e5e7eb',
          color: ready ? '#fff' : '#9ca3af',
          fontSize: 8, fontWeight: 800, cursor: 'pointer',
          transition: 'all 0.6s ease',
          boxShadow: ready ? '0 3px 10px rgba(22,163,74,0.35)' : 'none',
        }}>
          {ready ? '✓ Creează meciul' : 'Completează formularul...'}
        </button>
      </div>
    </div>
  )
}

function JoinScreen({ tapped }: { tapped: boolean }) {
  const avatarColors = ['#16a34a', '#7c3aed', '#dc2626', '#0891b2', '#d97706', '#0d9488', '#ea580c']
  const initials     = ['AP', 'MI', 'EC', 'VP', 'RS', 'BM', 'FD']
  return (
    <div style={{ height: '100%', background: '#fff', fontFamily: 'system-ui,-apple-system,sans-serif', overflow: 'hidden' }}>
      {/* Game header */}
      <div style={{
        background: 'linear-gradient(135deg,#5b21b6,#7c3aed)',
        padding: '30px 12px 12px',
      }}>
        <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>IAȘI · 14 IULIE</div>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#fff', marginTop: 3, lineHeight: 1.2 }}>Derby-ul Copou</div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Teren Sintetic Copou · 19:00 – 21:00</div>
        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[['👥', '7/10'], ['⚡', 'Intermediar'], ['💸', '20 lei']].map(([ic, lbl]) => (
            <div key={lbl} style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 5, padding: '2px 5px',
              fontSize: 6.5, color: '#fff', fontWeight: 600,
            }}>{ic} {lbl}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 10px' }}>
        {/* Players section */}
        <div style={{ fontSize: 8, fontWeight: 700, color: '#111', marginBottom: 6 }}>
          Jucători înscriși <span style={{ color: '#16a34a' }}>7</span>/10
        </div>
        {/* Avatar row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {initials.map((ini, i) => (
            <div key={ini} style={{
              width: 22, height: 22, borderRadius: 11,
              background: avatarColors[i],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 6.5, fontWeight: 800, color: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}>{ini}</div>
          ))}
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 22, height: 22, borderRadius: 11,
              background: '#f3f4f6',
              border: '1.5px dashed #d1fae5',
            }} />
          ))}
        </div>

        {/* Join button */}
        <div style={{
          height: 28, borderRadius: 9,
          background: tapped ? '#15803d' : 'linear-gradient(135deg,#16a34a,#0d9488)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, color: '#fff',
          transform: tapped ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: tapped ? 'none' : '0 4px 14px rgba(22,163,74,0.45)',
          cursor: 'pointer',
        }}>
          {tapped ? '✓ Înscris cu succes!' : 'Înscrie-te →'}
        </div>

        {/* Touch indicator dot when tapped */}
        {tapped && (
          <div style={{
            position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
            width: 22, height: 22, borderRadius: 11,
            background: 'rgba(22,163,74,0.25)',
            border: '1.5px solid rgba(22,163,74,0.5)',
            animation: 'none',
          }} />
        )}
      </div>
    </div>
  )
}
