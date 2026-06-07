'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Shield, MapPin, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSession, getInitials, hashColor, isAdmin } from '@/lib/session'

type Profile = {
  name: string
  avatar: string | null
  bio: string | null
  age: number | null
  favourite_team: string | null
  nationality: string | null
  best_foot: string | null
  preferred_position: string | null
  created_at: string
}

type Game = {
  id: string
  title: string
  city: string
  date: string
  time: string
}

export default function PlayerPage() {
  const { sessionId } = useParams() as { sessionId: string }
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [isMyProfile, setIsMyProfile] = useState(false)
  const [organizedGames, setOrganizedGames] = useState<Game[]>([])
  const [isBanned, setIsBanned] = useState(false)
  const [banLoading, setBanLoading] = useState(false)
  const [showBanConfirm, setShowBanConfirm] = useState(false)

  useEffect(() => {
    const s = getSession()
    setSession(s)

    async function load() {
      const { data } = await supabase
        .from('users')
        .select('name, avatar, bio, age, favourite_team, nationality, best_foot, preferred_position, created_at')
        .eq('session_id', sessionId)
        .maybeSingle()
      if (!data) { router.push('/'); return }
      setProfile(data)

      if (s) {
        setIsMyProfile(s.sessionId === sessionId)
        // check if this player is already banned by current user
        const { data: banData } = await supabase
          .from('bans')
          .select('id')
          .eq('organizer_session_id', s.sessionId)
          .eq('banned_session_id', sessionId)
          .maybeSingle()
        setIsBanned(!!banData)
      }

      // load organized games
      const { data: games } = await supabase
        .from('games')
        .select('id, title, city, date, time')
        .eq('organizer_session_id', sessionId)
        .order('date', { ascending: false })
        .limit(10)
      setOrganizedGames(games || [])
      setLoading(false)
    }
    load()
  }, [sessionId])

  async function handleBan() {
    if (!session) return
    setBanLoading(true)
    if (isBanned) {
      await supabase.from('bans').delete()
        .eq('organizer_session_id', session.sessionId)
        .eq('banned_session_id', sessionId)
      setIsBanned(false)
    } else {
      await supabase.from('bans').insert({
        organizer_session_id: session.sessionId,
        banned_session_id: sessionId,
      })
      setIsBanned(true)
    }
    setBanLoading(false)
    setShowBanConfirm(false)
  }

  if (loading) return <div className="text-center py-40 text-gray-400">Se încarcă...</div>
  if (!profile) return null

  const joined = new Date(profile.created_at).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
  const hasInfo = profile.bio || profile.age || profile.favourite_team || profile.nationality || profile.best_foot || profile.preferred_position
  const canBan = session && !isMyProfile && !isAdmin(session.name) && session.sessionId !== sessionId

  return (
    <div className="max-w-md mx-auto px-4 py-10 animate-fade-in">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Înapoi
      </button>

      {/* Avatar + name */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold mb-3"
          style={{ background: profile.avatar ? undefined : `linear-gradient(135deg, ${hashColor(profile.name)}, #0d9488)` }}
        >
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            : getInitials(profile.name)
          }
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">{profile.name}</h1>
        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
          <Calendar size={13} /> Membru din {joined}
        </p>
      </div>

      {/* Profile info card */}
      <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-black/[0.07] mb-4">
        {!hasInfo && (
          <p className="text-gray-400 text-sm text-center py-2">Acest jucător nu a completat profilul încă.</p>
        )}
        {profile.bio && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Despre</p>
            <p className="text-gray-700 text-sm">{profile.bio}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {profile.age && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Vârstă</p>
              <p className="text-gray-700 text-sm">{profile.age} ani</p>
            </div>
          )}
          {profile.nationality && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Naționalitate</p>
              <p className="text-gray-700 text-sm">{profile.nationality}</p>
            </div>
          )}
          {profile.best_foot && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Picior dominant</p>
              <p className="text-gray-700 text-sm">{profile.best_foot}</p>
            </div>
          )}
          {profile.preferred_position && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Poziție</p>
              <p className="text-gray-700 text-sm">{profile.preferred_position}</p>
            </div>
          )}
        </div>
        {profile.favourite_team && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Echipa favorită</p>
            <p className="text-gray-700 text-sm font-medium">{profile.favourite_team}</p>
          </div>
        )}
      </div>

      {/* Organized games */}
      {organizedGames.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.07] mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-4">Meciuri organizate</h2>
          <div className="space-y-2">
            {organizedGames.map(g => (
              <Link key={g.id} href={`/game/${g.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors group">
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700">{g.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {g.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={10} /> {g.date} {g.time}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ban button */}
      {canBan && (
        <div className="mt-6">
          {!showBanConfirm ? (
            <button onClick={() => setShowBanConfirm(true)}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${isBanned
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}>
              {isBanned ? '✓ Jucătorul este blocat din meciurile tale — Anulează blocarea' : '🚫 Blochează din meciurile mele'}
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-red-700 mb-1">
                {isBanned ? `Anulezi blocarea lui ${profile.name}?` : `Blochezi pe ${profile.name} din meciurile tale?`}
              </p>
              <p className="text-xs text-red-500 mb-4">
                {isBanned
                  ? 'Jucătorul va putea din nou să se înscrie în meciurile tale.'
                  : 'Jucătorul nu va putea să se înscrie în niciun meci creat de tine.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowBanConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                  Anulează
                </button>
                <button onClick={handleBan} disabled={banLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {banLoading ? 'Se procesează...' : isBanned ? 'Deblochează' : 'Blochează'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
