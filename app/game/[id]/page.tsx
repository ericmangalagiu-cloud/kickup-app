'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Crown, Share2 } from 'lucide-react'
import { supabase, Game, Player } from '@/lib/supabase'
import { getSession, getInitials, hashColor } from '@/lib/session'
import { formatDate, formatTime, timeAgo } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function GamePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [optOutModal, setOptOutModal] = useState(false)
  const [optOutReason, setOptOutReason] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const s = getSession()
    setSession(s)
    if (s) {
      const key = `kickup_unlocked_${id}`
      setUnlocked(localStorage.getItem(key) === 'true')
    }
    fetchGame()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`game-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${id}` }, () => {
        fetchPlayers()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function fetchGame() {
    const { data } = await supabase.from('games').select('*').eq('id', id).single()
    if (!data) { router.push('/'); return }
    setGame(data)
    await fetchPlayers()
    setLoading(false)
  }

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*').eq('game_id', id).order('joined_at', { ascending: true })
    setPlayers(data || [])
  }

  const activePlayers = players.filter(p => p.status === 'active')
  const optedOut = players.filter(p => p.status === 'opted_out')
  const totalSpots = game ? game.num_teams * game.players_per_team : 0
  const spotsLeft = Math.max(0, totalSpots - activePlayers.length)
  const isOrganizer = session && game && session.sessionId === game.organizer_session_id
  const myPlayer = players.find(p => p.session_id === session?.sessionId)
  const hasJoined = myPlayer?.status === 'active'
  const hasOptedOut = myPlayer?.status === 'opted_out'
  const isFull = spotsLeft === 0 && !hasJoined
  const today = new Date().toISOString().split('T')[0]
  const isPast = game && game.date < today

  async function joinGame() {
    if (!session) return
    setJoining(true)
    await supabase.from('players').insert({
      game_id: id,
      name: session.name,
      session_id: session.sessionId,
    })
    await fetchPlayers()
    setJoining(false)
    toast({ title: 'Joined!', description: "You're in the game 🎉" })
  }

  async function confirmOptOut() {
    if (!myPlayer) return
    await supabase.from('players').update({ status: 'opted_out', opt_out_reason: optOutReason || null }).eq('id', myPlayer.id)
    setOptOutModal(false)
    setOptOutReason('')
    await fetchPlayers()
    toast({ title: 'Opted out', description: 'Sorry to see you go!' })
  }

  function checkPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!game) return
    if (passwordInput === game.password_plain) {
      localStorage.setItem(`kickup_unlocked_${id}`, 'true')
      setUnlocked(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  async function shareGame() {
    await navigator.clipboard.writeText(window.location.href)
    toast({ title: 'Link copied!', description: 'Share it with your friends' })
  }

  if (loading) {
    return <div className="text-center py-40 text-zinc-500" style={{ animation: 'pulse 2s infinite' }}>Loading game...</div>
  }

  if (!game) return null

  // Private gate
  if (game.is_private && !isOrganizer && !hasJoined && !unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">This game is private</h2>
          <p className="text-zinc-400 text-sm mb-6">Enter the password to view this game</p>
          <form onSubmit={checkPassword} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${passwordError ? 'border-red-500 animate-shake' : 'border-white/[0.10]'}`}
            />
            {passwordError && <p className="text-red-400 text-sm">Wrong password, try again</p>}
            <button type="submit" className="btn-gradient w-full py-3 font-semibold">Enter →</button>
          </form>
        </div>
      </div>
    )
  }

  const status = isPast ? 'Past' : activePlayers.length >= totalSpots ? 'Full' : 'Open'
  const statusColor = {
    Open: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    Full: 'text-red-400 bg-red-500/20 border-red-500/30',
    Past: 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30'
  }[status]
  const progressPct = Math.min(100, (activePlayers.length / totalSpots) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} /> All Games
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold gradient-text mb-2">{game.name}</h1>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColor}`}>{status}</span>
        </div>
        {isOrganizer && (
          <Link href={`/game/${id}/edit`} className="ml-4 flex items-center gap-1.5 text-sm glass px-3 py-2 rounded-lg text-zinc-300 hover:text-white transition-colors border border-white/[0.08]">
            <Pencil size={14} /> Edit
          </Link>
        )}
      </div>

      {/* Details Card */}
      <div className="glass rounded-2xl p-5 space-y-2.5 text-sm mb-6">
        <p className="text-zinc-300">📍 {game.location}, {game.city}</p>
        <p className="text-zinc-300">📅 {formatDate(game.date)}</p>
        <p className="text-zinc-300">⏰ {formatTime(game.start_time)} → {formatTime(game.end_time)}</p>
        <p className="text-zinc-300">👥 {game.num_teams} teams · {game.players_per_team} players each · {totalSpots} total</p>
        <p className="text-zinc-300">💰 {game.price}</p>
        <p className="text-zinc-300">🎯 {game.level ? game.level.charAt(0).toUpperCase() + game.level.slice(1) : 'Open to all'}</p>
        <div className="flex items-center gap-2 pt-1">
          <Crown size={14} className="text-amber-400" />
          <span className="text-zinc-300">Organizer: <span className="text-white font-medium">{game.organizer_name}</span></span>
        </div>
      </div>

      {/* Players */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Players ({activePlayers.length} / {totalSpots})</h2>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #7c3aed, #ec4899)'
            }}
          />
        </div>
        {/* Active players */}
        <div className="space-y-2">
          {activePlayers.map(p => {
            const isMe = p.session_id === session?.sessionId
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2 rounded-xl transition-all"
                style={isMe ? { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' } : {}}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: hashColor(p.name) }}
                >
                  {getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium">{p.name}</span>
                  {isMe && <span className="ml-2 text-xs text-violet-400">you</span>}
                </div>
                <span className="text-xs text-zinc-500">{timeAgo(p.joined_at)}</span>
              </div>
            )
          })}
          {activePlayers.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-4">No players yet — be the first!</p>
          )}
        </div>
        {/* Opted out */}
        {optedOut.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors">
              Opted out ({optedOut.length})
            </summary>
            <div className="mt-2 space-y-2">
              {optedOut.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 opacity-50">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: hashColor(p.name) }}>
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <span className="text-zinc-400 text-sm line-through">{p.name}</span>
                    {p.opt_out_reason && <p className="text-xs text-zinc-500 mt-0.5">&quot;{p.opt_out_reason}&quot;</p>}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Action Button */}
      {!isPast && (
        <>
          {!hasJoined && !hasOptedOut && (
            <button
              onClick={joinGame}
              disabled={isFull || joining || !session}
              className="btn-gradient w-full py-4 font-bold text-base mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining...' : isFull ? 'Game Full' : 'Join Game →'}
            </button>
          )}
          {hasJoined && (
            <button
              onClick={() => setOptOutModal(true)}
              className="w-full py-4 font-bold text-base mb-4 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
            >
              Can&apos;t Make It
            </button>
          )}
          {hasOptedOut && (
            <button disabled className="w-full py-4 font-bold text-base mb-4 rounded-full border border-zinc-700 text-zinc-500 cursor-not-allowed">
              You opted out
            </button>
          )}
        </>
      )}

      {/* Share Button */}
      <button
        onClick={shareGame}
        className="w-full flex items-center justify-center gap-2 py-3 glass rounded-full text-zinc-400 hover:text-white transition-colors text-sm font-medium border border-white/[0.08] hover:border-white/[0.15]"
      >
        <Share2 size={16} /> Share Game
      </button>

      {/* Opt-out Modal */}
      {optOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-1">Sorry to hear that!</h3>
            <p className="text-zinc-400 text-sm mb-4">Let the organizer know why (optional)</p>
            <textarea
              value={optOutReason}
              onChange={e => setOptOutReason(e.target.value)}
              placeholder="e.g. Work came up, injured..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setOptOutModal(false)}
                className="flex-1 py-3 rounded-full glass border border-white/[0.08] text-zinc-300 hover:text-white transition-colors font-medium"
              >
                Nevermind
              </button>
              <button
                onClick={confirmOptOut}
                className="flex-1 py-3 rounded-full text-white font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
              >
                Confirm Opt Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
