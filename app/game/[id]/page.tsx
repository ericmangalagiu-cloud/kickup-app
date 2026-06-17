'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Crown, Share2, MapPin, Calendar, Clock, Users, Banknote, Target, Lock, Trash2 } from 'lucide-react'
import { supabase, Game, Player } from '@/lib/supabase'
import { getSession, getInitials, hashColor, isAdmin } from '@/lib/session'
import { formatDate, formatTime, timeAgo } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function GamePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerAvatars, setPlayerAvatars] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [optOutModal, setOptOutModal] = useState(false)
  const [optOutReason, setOptOutReason] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [joining, setJoining] = useState(false)
  const [adminAddName, setAdminAddName] = useState('')
  const [adminAdding, setAdminAdding] = useState(false)

  useEffect(() => {
    const s = getSession()
    setSession(s)
    const key = `kickup_unlocked_${id}`
    setUnlocked(localStorage.getItem(key) === 'true')
    fetchGame()

    function onSessionUpdated() {
      const updated = getSession()
      setSession(updated)
      if (updated) setUnlocked(localStorage.getItem(`kickup_unlocked_${id}`) === 'true')
    }
    window.addEventListener('session-updated', onSessionUpdated)
    return () => window.removeEventListener('session-updated', onSessionUpdated)
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
    const { data, error } = await supabase.from('games').select('*').eq('id', id).single()
    if (!data) {
      if (!error || error.code === 'PGRST116') router.push('/')
      else setTimeout(() => fetchGame(), 2000)
      return
    }
    setGame(data)
    await fetchPlayers()
    setLoading(false)
  }

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*').eq('game_id', id).order('joined_at', { ascending: true })
    const ps = data || []
    setPlayers(ps)
    // Batch fetch avatars
    if (ps.length > 0) {
      const sessionIds = [...new Set(ps.map(p => p.session_id))]
      const { data: users } = await supabase.from('users').select('session_id, avatar').in('session_id', sessionIds)
      if (users) {
        const map: Record<string, string | null> = {}
        users.forEach(u => { map[u.session_id] = u.avatar })
        setPlayerAvatars(map)
      }
    }
  }

  const activePlayers = players.filter(p => p.status === 'active')
  const optedOut = players.filter(p => p.status === 'opted_out')
  const totalSpots = game ? game.num_teams * game.players_per_team : 0
  const spotsLeft = Math.max(0, totalSpots - activePlayers.length)
  const isOrganizer = session && game && session.sessionId === game.organizer_session_id
  const isAdminUser = session && isAdmin(session.name)
  const myPlayer = players.find(p => p.session_id === session?.sessionId)
  const hasJoined = myPlayer?.status === 'active'
  const hasOptedOut = myPlayer?.status === 'opted_out'
  const isFull = spotsLeft === 0 && !hasJoined
  const today = new Date().toISOString().split('T')[0]
  const isPast = game && game.date < today

  async function joinGame() {
    if (!session) return
    setJoining(true)
    // Check ban
    if (game) {
      const { data: ban } = await supabase.from('bans').select('id')
        .eq('organizer_session_id', game.organizer_session_id)
        .eq('banned_session_id', session.sessionId)
        .maybeSingle()
      if (ban) {
        toast({ title: 'Nu te poți înscrie', description: 'Organizatorul te-a blocat din meciurile sale.' })
        setJoining(false)
        return
      }
    }
    const nameTaken = activePlayers.some(
      p => p.name.toLowerCase() === session.name.toLowerCase() && p.session_id !== session.sessionId
    )
    if (nameTaken) {
      toast({ title: 'Ești deja în meci', description: 'Un jucător cu același nume este deja înscris.' })
      setJoining(false)
      return
    }
    await supabase.from('players').insert({ game_id: id, name: session.name, session_id: session.sessionId })
    await fetchPlayers()
    setJoining(false)
    toast({ title: 'Te-ai înscris!', description: 'Ești în meci.' })
  }

  async function deleteGame() {
    if (!confirm('Ești sigur că vrei să ștergi acest meci? Această acțiune nu poate fi anulată.')) return
    await supabase.from('games').delete().eq('id', id)
    router.push('/meciuri')
  }

  async function confirmOptOut() {
    if (!myPlayer) return
    await supabase.from('players').update({ status: 'opted_out', opt_out_reason: optOutReason || null }).eq('id', myPlayer.id)
    setOptOutModal(false); setOptOutReason('')
    await fetchPlayers()
    toast({ title: 'Ai renunțat', description: 'Sperăm să te vedem data viitoare!' })
  }

  function checkPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!game) return
    if (passwordInput === game.password_plain) {
      localStorage.setItem(`kickup_unlocked_${id}`, 'true')
      setUnlocked(true); setPasswordError(false)
    } else { setPasswordError(true) }
  }

  async function shareGame() {
    await navigator.clipboard.writeText(window.location.href)
    toast({ title: 'Copiat', description: 'Trimite prietenilor tăi!' })
  }

  async function adminRemovePlayer(playerId: string, playerName: string) {
    if (!confirm(`Elimini pe ${playerName} din meci?`)) return
    await supabase.from('players').delete().eq('id', playerId)
    await fetchPlayers()
    toast({ title: 'Jucător eliminat', description: `${playerName} a fost scos din meci.` })
  }

  async function adminAddPlayer(e: React.FormEvent) {
    e.preventDefault()
    if (!adminAddName.trim()) return
    setAdminAdding(true)
    await supabase.from('players').insert({ game_id: id, name: adminAddName.trim(), session_id: `admin-added-${Date.now()}` })
    setAdminAddName('')
    await fetchPlayers()
    setAdminAdding(false)
    toast({ title: 'Jucător adăugat', description: `${adminAddName.trim()} a fost adăugat în meci.` })
  }

  if (loading) return <div className="text-center py-40 text-gray-400">Loading game...</div>
  if (!game) return null

  if (game.is_private && !isOrganizer && !isAdminUser && !hasJoined && !unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-black/[0.07]">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Meci privat</h2>
          <p className="text-gray-400 text-sm mb-6">Introduceți parola pentru a vedea detaliile</p>
          <form onSubmit={checkPassword} className="space-y-4">
            <input type="password" value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-xl bg-gray-50 border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${passwordError ? 'border-red-400 animate-shake' : 'border-black/[0.08]'}`}
            />
            {passwordError && <p className="text-red-500 text-sm">Parolă greșită, încearcă din nou</p>}
            <button type="submit" className="btn-gradient w-full py-3 font-semibold">Intră</button>
          </form>
        </div>
      </div>
    )
  }

  const status: 'Full' | 'Past' | null = isPast ? 'Past' : activePlayers.length >= totalSpots ? 'Full' : null
  const statusColors: Record<string, string> = { Full: 'text-red-600 bg-red-50 border-red-200', Past: 'text-gray-500 bg-gray-100 border-gray-200' }
  const statusColor = status ? statusColors[status] : ''
  const progressPct = Math.min(100, (activePlayers.length / totalSpots) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <Link href="/meciuri" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-6">
        <ArrowLeft size={16} /> Toate meciurile
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold gradient-text mb-2">{game.name}</h1>
          {status && <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColor}`}>{status}</span>}
        </div>
        {isOrganizer && (
          <Link href={`/game/${id}/edit`} className="ml-4 flex items-center gap-1.5 text-sm bg-white px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors border border-black/[0.08] shadow-sm">
            <Pencil size={14} /> Edit
          </Link>
        )}
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl p-5 space-y-3 text-sm mb-6 shadow-sm border border-black/[0.07]">
        <p className="flex items-center gap-2 text-gray-700"><MapPin size={14} className="text-green-600 flex-shrink-0" />{game.location}, {game.city}</p>
        <p className="flex items-center gap-2 text-gray-700"><Calendar size={14} className="text-green-600 flex-shrink-0" />{formatDate(game.date)}</p>
        <p className="flex items-center gap-2 text-gray-700"><Clock size={14} className="text-green-600 flex-shrink-0" />{formatTime(game.start_time)} — {formatTime(game.end_time)}</p>
        <p className="flex items-center gap-2 text-gray-700"><Users size={14} className="text-green-600 flex-shrink-0" />{game.num_teams} teams · {game.players_per_team} players each · {totalSpots} total</p>
        <p className="flex items-center gap-2 text-gray-700"><Banknote size={14} className="text-green-600 flex-shrink-0" />{game.price}</p>
        <p className="flex items-center gap-2 text-gray-700"><Target size={14} className="text-green-600 flex-shrink-0" />{game.level ? game.level.charAt(0).toUpperCase() + game.level.slice(1) : 'Open to all'}</p>
        {/* Organizer row with clickable link */}
        <div className="flex items-center gap-2 pt-1 border-t border-black/[0.05]">
          <Crown size={14} className="text-amber-500" />
          <span className="text-gray-600">
            Organizator: <span className="text-gray-900 font-medium">{game.organizer_name}</span>
          </span>
          {game.organizer_session_id && (
            <Link href={`/player/${game.organizer_session_id}`}
              className="ml-1 text-xs text-green-600 hover:underline hover:text-green-700 transition-colors">
              · click pentru mai multe info
            </Link>
          )}
        </div>
      </div>

      {/* Players */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-black/[0.07]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-bold text-lg">Jucători ({activePlayers.length} / {totalSpots})</h2>
        </div>
        <div className="h-2 rounded-full mb-5 overflow-hidden bg-gray-100">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #16a34a, #0d9488)' }} />
        </div>
        <div className="space-y-2">
          {activePlayers.map(p => {
            const isMe = p.session_id === session?.sessionId
            const av = playerAvatars[p.session_id]
            return (
              <Link key={p.id} href={`/player/${p.session_id}`}
                className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-gray-50 group"
                style={isMe ? { background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)' } : {}}>
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: av ? undefined : `linear-gradient(135deg, ${hashColor(p.name)}, #0d9488)` }}>
                  {av ? <img src={av} alt={p.name} className="w-full h-full object-cover" /> : getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-900 text-sm font-medium group-hover:text-green-700 transition-colors">{p.name}</span>
                  {isMe && <span className="ml-2 text-xs text-green-600">tu</span>}
                </div>
                <span className="text-xs text-gray-400">{timeAgo(p.joined_at)}</span>
              </Link>
            )
          })}
          {activePlayers.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Niciun jucător încă — fii primul!</p>
          )}
        </div>
        {optedOut.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Au renunțat ({optedOut.length})</summary>
            <div className="mt-2 space-y-2">
              {optedOut.map(p => {
                const av = playerAvatars[p.session_id]
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 opacity-50">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: av ? undefined : `linear-gradient(135deg, ${hashColor(p.name)}, #0d9488)` }}>
                      {av ? <img src={av} alt={p.name} className="w-full h-full object-cover" /> : getInitials(p.name)}
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm line-through">{p.name}</span>
                      {p.opt_out_reason && <p className="text-xs text-gray-400 mt-0.5">&quot;{p.opt_out_reason}&quot;</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        )}
      </div>

      {/* Action Buttons */}
      {!isPast && (
        <>
          {!hasJoined && !hasOptedOut && (
            <button onClick={joinGame} disabled={isFull || joining || !session}
              className="btn-gradient w-full py-4 font-bold text-base mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {joining ? 'Se înscrie...' : isFull ? 'Meci complet' : 'Înscrie-te'}
            </button>
          )}
          {hasJoined && (
            <button onClick={() => setOptOutModal(true)}
              className="w-full py-4 font-bold text-base mb-4 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-all">
              Nu pot veni
            </button>
          )}
          {hasOptedOut && (
            <div className="flex gap-3 mb-4">
              <button disabled className="flex-1 py-4 font-bold text-base rounded-full border border-gray-200 text-gray-400 cursor-not-allowed">Ai renunțat</button>
              <button onClick={async () => {
                if (!myPlayer) return
                await supabase.from('players').update({ status: 'active', opt_out_reason: null }).eq('id', myPlayer.id)
                await fetchPlayers()
                toast({ title: 'Bine ai revenit!', description: 'Ești din nou în meci.' })
              }} disabled={isFull}
                className="flex-1 py-4 font-bold text-base rounded-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed">
                {isFull ? 'Meci complet' : 'Înscrie-te din nou'}
              </button>
            </div>
          )}
        </>
      )}

      <button onClick={shareGame}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white rounded-full text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium border border-black/[0.08] hover:border-black/[0.15] shadow-sm mb-3">
        <Share2 size={16} /> Distribuie meciul
      </button>

      {(isOrganizer || isAdminUser) && (
        <button onClick={deleteGame}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium">
          <Trash2 size={15} /> Șterge meciul
        </button>
      )}

      {/* Admin player management panel */}
      {isAdminUser && (
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">A</span>
            </div>
            <h3 className="text-sm font-bold text-purple-900">Panou Admin — Editează lista</h3>
          </div>

          {/* Active players editable list */}
          <div className="space-y-2 mb-5">
            {activePlayers.length === 0 && (
              <p className="text-purple-400 text-sm text-center py-2">Niciun jucător activ.</p>
            )}
            {activePlayers.map(p => {
              const av = playerAvatars[p.session_id]
              return (
                <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-purple-100">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: av ? undefined : `linear-gradient(135deg, ${hashColor(p.name)}, #0d9488)` }}>
                    {av ? <img src={av} alt={p.name} className="w-full h-full object-cover" /> : getInitials(p.name)}
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{p.name}</span>
                  <button onClick={() => adminRemovePlayer(p.id, p.name)}
                    className="w-7 h-7 rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center text-lg leading-none font-bold flex-shrink-0">
                    ×
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add player manually */}
          <form onSubmit={adminAddPlayer} className="flex gap-2">
            <input type="text" value={adminAddName} onChange={e => setAdminAddName(e.target.value)}
              placeholder="Adaugă un jucător manual..."
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-purple-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <button type="submit" disabled={!adminAddName.trim() || adminAdding}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50">
              {adminAdding ? '...' : 'Adaugă'}
            </button>
          </form>
        </div>
      )}

      {/* Opt-out Modal */}
      {optOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-xl border border-black/[0.07]">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Ne pare rău să auzim asta!</h3>
            <p className="text-gray-500 text-sm mb-4">Spune-i organizatorului de ce (opțional)</p>
            <textarea value={optOutReason} onChange={e => setOptOutReason(e.target.value)}
              placeholder="ex: Am treabă, sunt accidentat..." rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setOptOutModal(false)} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium">Înapoi</button>
              <button onClick={confirmOptOut} className="flex-1 py-3 rounded-full text-white font-bold transition-all" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
