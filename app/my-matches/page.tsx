'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Users, Crown, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { formatDate, formatTime } from '@/lib/utils'

type GameItem = {
  id: string
  name: string
  city: string
  date: string
  start_time: string
  end_time: string
  num_teams: number
  players_per_team: number
  organizer_name: string
  organizer_session_id: string
  role: 'organizer' | 'player'
  activeCount?: number
}

export default function MyMatchesPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [games, setGames] = useState<GameItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    const s = getSession()
    if (!s) { router.push('/'); return }
    setSession(s)
    loadGames(s.sessionId)
  }, [])

  async function loadGames(sessionId: string) {
    const today = new Date().toISOString().split('T')[0]

    // Games where user is organizer
    const { data: organized } = await supabase
      .from('games')
      .select('id, name, city, date, start_time, end_time, num_teams, players_per_team, organizer_name, organizer_session_id')
      .eq('organizer_session_id', sessionId)

    // Games where user is an active player
    const { data: playerRows } = await supabase
      .from('players')
      .select('game_id')
      .eq('session_id', sessionId)
      .eq('status', 'active')

    const playerGameIds = (playerRows || []).map(r => r.game_id)
    let playerGames: any[] = []
    if (playerGameIds.length > 0) {
      const { data } = await supabase
        .from('games')
        .select('id, name, city, date, start_time, end_time, num_teams, players_per_team, organizer_name, organizer_session_id')
        .in('id', playerGameIds)
      playerGames = data || []
    }

    // Merge, deduplicate (organizer takes precedence)
    const organizedIds = new Set((organized || []).map(g => g.id))
    const merged: GameItem[] = [
      ...(organized || []).map(g => ({ ...g, role: 'organizer' as const })),
      ...playerGames.filter(g => !organizedIds.has(g.id)).map(g => ({ ...g, role: 'player' as const })),
    ]

    // Fetch active player counts
    const allIds = merged.map(g => g.id)
    if (allIds.length > 0) {
      const { data: playerCounts } = await supabase
        .from('players')
        .select('game_id')
        .in('game_id', allIds)
        .eq('status', 'active')
      const countMap: Record<string, number> = {}
      ;(playerCounts || []).forEach(r => { countMap[r.game_id] = (countMap[r.game_id] || 0) + 1 })
      merged.forEach(g => { g.activeCount = countMap[g.id] || 0 })
    }

    // Sort by date desc
    merged.sort((a, b) => a.date < b.date ? 1 : -1)
    setGames(merged)
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = games.filter(g => g.date >= today)
  const past = games.filter(g => g.date < today)
  const displayed = tab === 'upcoming' ? upcoming : past

  if (loading) return <div className="text-center py-40 text-gray-400">Se încarcă...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Înapoi
      </Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Meciurile mele</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        <button onClick={() => setTab('upcoming')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Viitoare {upcoming.length > 0 && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{upcoming.length}</span>}
        </button>
        <button onClick={() => setTab('past')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Trecute {past.length > 0 && <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{past.length}</span>}
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">
            {tab === 'upcoming' ? 'Nu ai meciuri viitoare.' : 'Nu ai meciuri trecute.'}
          </p>
          {tab === 'upcoming' && (
            <Link href="/" className="mt-3 inline-block text-green-600 font-semibold hover:underline">Caută un meci →</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(g => {
            const total = g.num_teams * g.players_per_team
            return (
              <Link key={g.id} href={`/game/${g.id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm border border-black/[0.07] hover:border-green-300 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">{g.name}</h3>
                  {g.role === 'organizer' ? (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Crown size={10} /> Organizator
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Jucător</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={11} />{g.city}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(g.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{formatTime(g.start_time)}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{g.activeCount ?? 0}/{total}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
