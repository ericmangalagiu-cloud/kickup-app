'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getInitials, hashColor } from '@/lib/session'

type Profile = {
  name: string
  avatar: string | null
  bio: string | null
  age: number | null
  favourite_team: string | null
  created_at: string
}

export default function PlayerPage() {
  const { sessionId } = useParams() as { sessionId: string }
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('name, avatar, bio, age, favourite_team, created_at')
        .eq('session_id', sessionId)
        .maybeSingle()
      if (!data) { router.push('/'); return }
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) return <div className="text-center py-40 text-gray-400">Se încarcă...</div>
  if (!profile) return null

  const joined = new Date(profile.created_at).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-md mx-auto px-4 py-10 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Înapoi
      </Link>

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

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-black/[0.07]">
        {profile.bio && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Despre</p>
            <p className="text-gray-700 text-sm">{profile.bio}</p>
          </div>
        )}
        {profile.age && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Vârstă</p>
            <p className="text-gray-700 text-sm">{profile.age} ani</p>
          </div>
        )}
        {profile.favourite_team && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Echipa favorită</p>
            <p className="text-gray-700 text-sm font-medium">{profile.favourite_team}</p>
          </div>
        )}
        {!profile.bio && !profile.age && !profile.favourite_team && (
          <p className="text-gray-400 text-sm text-center py-2">Acest jucător nu a completat profilul încă.</p>
        )}
      </div>
    </div>
  )
}
