'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Lock, ChevronDown, Check } from 'lucide-react'
import { supabase, Game } from '@/lib/supabase'
import { GameCard } from '@/components/GameCard'
import { ROMANIAN_CITIES } from '@/hooks/useCityStore'

const LEVELS = ['Toate', 'Beginner', 'Intermediate', 'Advanced']
const LEVEL_LABELS: Record<string, string> = {
  Toate: 'Toate nivelele',
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
}

function DropdownBtn({
  label, value, options, onChange
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const displayValue = value || label

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
          value && value !== 'Toate' && value !== ''
            ? 'bg-green-50 border-green-400 text-green-700'
            : 'bg-white border-black/[0.10] text-gray-700 hover:border-green-400 hover:text-green-700'
        }`}>
        {displayValue}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 bg-white rounded-2xl shadow-xl border border-black/[0.07] z-50 min-w-[170px] py-1.5 animate-fade-in">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-green-50 transition-colors rounded-xl mx-0">
              <span className={`font-medium ${(value === opt || (!value && opt === 'Toate') || (!value && opt === '')) ? 'text-green-700' : 'text-gray-700'}`}>
                {opt === '' ? 'Toate orașele' : opt}
              </span>
              {(value === opt || (!value && opt === '') || (!value && opt === 'Toate')) && (
                <Check size={14} className="text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MeciuriPage() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('Toate')
  const [city, setCity] = useState('')
  const [showAvailable, setShowAvailable] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchGames() }, [city, showAll])

  async function fetchGames() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    let query = supabase.from('games').select('*').gte('date', today).order('date', { ascending: true })
    if (!showAll) query = query.eq('is_private', false)
    if (city) query = query.eq('city', city)
    const { data: gamesData } = await query
    if (gamesData) {
      setGames(gamesData)
      const ids = gamesData.map(g => g.id)
      if (ids.length > 0) {
        const { data: rows } = await supabase.from('players').select('game_id').in('game_id', ids).eq('status', 'active')
        const counts: Record<string, number> = {}
        ids.forEach(id => { counts[id] = 0 })
        rows?.forEach(r => { counts[r.game_id] = (counts[r.game_id] || 0) + 1 })
        setPlayerCounts(counts)
      }
    }
    setLoading(false)
  }

  const filtered = games.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    if (level !== 'Toate' && g.level?.toLowerCase() !== level.toLowerCase()) return false
    const total = g.num_teams * g.players_per_team
    if (showAvailable && (playerCounts[g.id] || 0) >= total) return false
    return true
  })

  const cityOptions = ['', ...ROMANIAN_CITIES]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.06] px-5 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {city ? `Meciuri în ${city}` : 'Toate meciurile'}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {loading ? 'Se încarcă...' : `${filtered.length} meciuri disponibile`}
            </p>
          </div>
          <Link href="/create" className="btn-gradient px-4 py-2 text-sm font-bold hidden sm:inline-flex items-center">
            Creează meci
          </Link>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="bg-white border-b border-black/[0.06] px-5 py-3 sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          {/* Search */}
          <input type="text" placeholder="Caută după numele meciului..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all" />

          {/* Dropdowns + toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Level dropdown */}
            <DropdownBtn
              label="Nivel"
              value={level}
              options={LEVELS}
              onChange={setLevel}
            />

            {/* City dropdown */}
            <DropdownBtn
              label="Oraș"
              value={city}
              options={cityOptions}
              onChange={v => { setCity(v); }}
            />

            <div className="flex items-center gap-4 ml-1">
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                <div onClick={() => setShowAvailable(!showAvailable)}
                  className="w-9 h-5 rounded-full transition-all cursor-pointer relative flex-shrink-0"
                  style={{ background: showAvailable ? '#16a34a' : '#e5e7eb' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                    style={{ left: showAvailable ? '1.125rem' : '0.125rem' }} />
                </div>
                Locuri disponibile
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                <div onClick={() => setShowAll(!showAll)}
                  className="w-9 h-5 rounded-full transition-all cursor-pointer relative flex-shrink-0"
                  style={{ background: showAll ? '#16a34a' : '#e5e7eb' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                    style={{ left: showAll ? '1.125rem' : '0.125rem' }} />
                </div>
                <Lock size={12} className={showAll ? 'text-green-600' : 'text-gray-400'} />
                Private
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-5 py-8 pb-24 sm:pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-black/[0.06]"
                style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">⚽</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Niciun meci găsit</h3>
            <p className="text-gray-400 mb-6 text-sm">
              {city ? `Nu există meciuri în ${city}.` : 'Nu există meciuri momentan.'}
            </p>
            <Link href="/create" className="btn-gradient inline-block px-6 py-3 font-semibold text-sm">
              Creează primul meci
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((game, index) => {
              const total = game.num_teams * game.players_per_team
              const joined = playerCounts[game.id] || 0
              return (
                <div key={game.id}
                  style={{ animation: `heroSlideUp 0.5s ease-out ${Math.min(index, 8) * 60}ms both` }}>
                  <GameCard game={game} spotsLeft={Math.max(0, total - joined)} totalSpots={total} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
