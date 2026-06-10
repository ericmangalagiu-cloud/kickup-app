'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, SlidersHorizontal } from 'lucide-react'
import { supabase, Game } from '@/lib/supabase'
import { GameCard } from '@/components/GameCard'
import { useCityStore } from '@/hooks/useCityStore'

const levels = ['Toate', 'Beginner', 'Intermediate', 'Advanced']

export default function MeciuriPage() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('Toate')
  const [showAvailable, setShowAvailable] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const { selectedCity } = useCityStore()

  useEffect(() => {
    fetchGames()
  }, [selectedCity, showAll])

  async function fetchGames() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    let query = supabase.from('games').select('*').gte('date', today).order('date', { ascending: true })
    if (!showAll) query = query.eq('is_private', false)
    if (selectedCity) query = query.eq('city', selectedCity)
    const { data: gamesData } = await query
    if (gamesData) {
      setGames(gamesData)
      const ids = gamesData.map(g => g.id)
      if (ids.length > 0) {
        const { data: rows } = await supabase
          .from('players').select('game_id').in('game_id', ids).eq('status', 'active')
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.06] px-5 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {selectedCity ? `Meciuri în ${selectedCity}` : 'Toate meciurile'}
            </h1>
            <Link href="/create" className="btn-gradient px-4 py-2 text-sm font-bold hidden sm:inline-flex items-center gap-1.5">
              + Creează meci
            </Link>
          </div>
          <p className="text-gray-400 text-sm">
            {loading ? 'Se încarcă...' : `${filtered.length} meciuri disponibile`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-black/[0.06] px-5 py-4 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="text"
              placeholder="Caută după numele meciului..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
            />
            <div className="flex gap-1.5 flex-wrap">
              {levels.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${level === l ? 'btn-gradient' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-black/[0.06]'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-5 items-center">
            {[
              { label: 'Locuri disponibile', val: showAvailable, set: setShowAvailable },
              { label: 'Inclusiv private', val: showAll, set: setShowAll, icon: <Lock size={12} className={showAll ? 'text-green-600' : 'text-gray-400'} /> },
            ].map(({ label, val, set, icon }) => (
              <label key={label} className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                <div onClick={() => set(!val)} className="w-9 h-5 rounded-full transition-all cursor-pointer relative flex-shrink-0"
                  style={{ background: val ? '#16a34a' : '#e5e7eb' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                    style={{ left: val ? '1.125rem' : '0.125rem' }} />
                </div>
                {icon}{label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Games grid */}
      <div className="max-w-6xl mx-auto px-5 py-8 pb-24 sm:pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-black/[0.06]" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">⚽</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Niciun meci găsit</h3>
            <p className="text-gray-400 mb-6 text-sm">
              {selectedCity ? `Nu există meciuri în ${selectedCity}.` : 'Nu există meciuri momentan.'}
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
