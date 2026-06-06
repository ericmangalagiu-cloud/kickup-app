'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, Game } from '@/lib/supabase'
import { GameCard } from '@/components/GameCard'

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function HomePage() {
  const [city, setCity] = useState('')
  const [level, setLevel] = useState('All')
  const [showAvailable, setShowAvailable] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGames()
  }, [])

  async function fetchGames() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const { data: gamesData } = await supabase
      .from('games')
      .select('*')
      .gte('date', today)
      .eq('is_private', false)
      .order('date', { ascending: true })

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
    if (city && !g.city.toLowerCase().includes(city.toLowerCase())) return false
    if (level !== 'All' && g.level?.toLowerCase() !== level.toLowerCase()) return false
    const total = g.num_teams * g.players_per_team
    if (showAvailable && (playerCounts[g.id] || 0) >= total) return false
    return true
  })

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.12), transparent)' }} />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
            <span className="gradient-text">Find Your</span>
            <br />Next Game
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Join pickup football games near you
          </p>
          <Link
            href="/create"
            className="btn-gradient inline-block px-8 py-4 text-base font-bold"
          >
            Create a Game ⚽
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="🔍 Search by city..."
            value={city}
            onChange={e => setCity(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 w-full sm:w-auto"
          />
          <div className="flex gap-2 flex-wrap justify-center">
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  level === l
                    ? 'btn-gradient'
                    : 'glass text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer whitespace-nowrap">
            <div
              onClick={() => setShowAvailable(!showAvailable)}
              className="w-10 h-5 rounded-full transition-all cursor-pointer relative"
              style={{ background: showAvailable ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: showAvailable ? '1.25rem' : '0.125rem' }}
              />
            </div>
            Available only
          </label>
        </div>
      </section>

      {/* Games Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading games...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">⚽</div>
            <h3 className="text-xl font-bold text-white mb-2">No games near you</h3>
            <p className="text-zinc-500 mb-6">Be the first to create one!</p>
            <Link href="/create" className="btn-gradient inline-block px-6 py-3 font-semibold">
              Create a Game →
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
