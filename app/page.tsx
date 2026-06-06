'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, Game } from '@/lib/supabase'
import { GameCard } from '@/components/GameCard'
import { useCityStore } from '@/hooks/useCityStore'

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('All')
  const [showAvailable, setShowAvailable] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const { selectedCity } = useCityStore()

  useEffect(() => {
    fetchGames()
  }, [selectedCity])

  async function fetchGames() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    let query = supabase
      .from('games')
      .select('*')
      .gte('date', today)
      .eq('is_private', false)
      .order('date', { ascending: true })

    if (selectedCity) {
      query = query.eq('city', selectedCity)
    }

    const { data: gamesData } = await query

    if (gamesData) {
      setGames(gamesData)
      const counts: Record<string, number> = {}
      for (const game of gamesData) {
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('game_id', game.id)
          .eq('status', 'active')
        counts[game.id] = count || 0
      }
      setPlayerCounts(counts)
    }
    setLoading(false)
  }

  const filtered = games.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    if (level !== 'All' && g.level?.toLowerCase() !== level.toLowerCase()) return false
    const total = g.num_teams * g.players_per_team
    if (showAvailable && (playerCounts[g.id] || 0) >= total) return false
    return true
  })

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(22,163,74,0.06), transparent)' }} />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight text-gray-900">
            <span className="gradient-text">Find Your</span>
            <br />Next Game
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Join pickup football games near you
          </p>
          <Link
            href="/create"
            className="btn-gradient inline-block px-8 py-4 text-base font-bold"
          >
            Create a Game
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-sm border border-black/[0.06]">
          <input
            type="text"
            placeholder="Search by game name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-auto transition-all"
          />
          <div className="flex gap-2 flex-wrap justify-center">
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  level === l
                    ? 'btn-gradient'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-black/[0.06]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer whitespace-nowrap">
            <div
              onClick={() => setShowAvailable(!showAvailable)}
              className="w-10 h-5 rounded-full transition-all cursor-pointer relative"
              style={{ background: showAvailable ? '#16a34a' : '#e5e7eb' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                style={{ left: showAvailable ? '1.25rem' : '0.125rem' }}
              />
            </div>
            Available only
          </label>
        </div>
      </section>

      {/* City indicator */}
      {selectedCity && (
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <p className="text-sm text-gray-500">
            Showing games in <span className="font-semibold text-green-700">{selectedCity}</span>
            {' '}— use the city selector in the top right to change
          </p>
        </div>
      )}

      {/* Games Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading games...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No games found</h3>
            <p className="text-gray-400 mb-6">
              {selectedCity ? `No upcoming games in ${selectedCity} — be the first!` : 'No upcoming games — be the first to create one!'}
            </p>
            <Link href="/create" className="btn-gradient inline-block px-6 py-3 font-semibold">
              Create a Game
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(game => {
              const total = game.num_teams * game.players_per_team
              const joined = playerCounts[game.id] || 0
              return (
                <GameCard
                  key={game.id}
                  game={game}
                  spotsLeft={Math.max(0, total - joined)}
                  totalSpots={total}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
