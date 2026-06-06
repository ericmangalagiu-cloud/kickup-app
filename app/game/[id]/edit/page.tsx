'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase, Game } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export default function EditGamePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', location: '', city: '', date: '', start_time: '', end_time: '',
    level: '', num_teams: '2', players_per_team: '7', price: '',
    is_private: false, password: '',
  })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      const session = getSession()
      const { data } = await supabase.from('games').select('*').eq('id', id).single()
      if (!data) { router.push('/'); return }
      if (!session || session.sessionId !== data.organizer_session_id) {
        router.push(`/game/${id}`)
        return
      }
      setForm({
        name: data.name,
        location: data.location,
        city: data.city,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        level: data.level || '',
        num_teams: String(data.num_teams),
        players_per_team: String(data.players_per_team),
        price: data.price,
        is_private: data.is_private,
        password: data.password_plain || '',
      })
      setLoading(false)
    }
    load()
  }, [id])

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('games').update({
      name: form.name,
      location: form.location,
      city: form.city,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      level: form.level || null,
      num_teams: parseInt(form.num_teams),
      players_per_team: parseInt(form.players_per_team),
      price: form.price,
      is_private: form.is_private,
      password_plain: form.is_private ? form.password : null,
    }).eq('id', id)
    router.push(`/game/${id}`)
  }

  async function cancelGame() {
    if (!confirm('Are you sure you want to cancel this game? This cannot be undone.')) return
    await supabase.from('games').delete().eq('id', id)
    router.push('/')
  }

  if (loading) return <div className="text-center py-40 text-zinc-500">Loading...</div>

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
  const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5"

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      <Link href={`/game/${id}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Game
      </Link>
      <h1 className="text-3xl font-extrabold text-white mb-8">Edit Game</h1>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelClass}>Game Name *</label>
          <input required className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Location *</label>
          <input required className={inputClass} value={form.location} onChange={e => set('location', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input required className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date *</label>
            <input required type="date" min={today} className={inputClass} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Level</label>
            <select
              className={inputClass + ' cursor-pointer'}
              style={{ colorScheme: 'dark' }}
              value={form.level}
              onChange={e => set('level', e.target.value)}
            >
              <option value="">Not specified</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Time *</label>
            <input required type="time" className={inputClass} value={form.start_time} onChange={e => set('start_time', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>End Time *</label>
            <input required type="time" className={inputClass} value={form.end_time} onChange={e => set('end_time', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Number of Teams *</label>
            <input required type="number" min="2" max="6" className={inputClass} value={form.num_teams} onChange={e => set('num_teams', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Players per Team *</label>
            <input required type="number" min="3" max="15" className={inputClass} value={form.players_per_team} onChange={e => set('players_per_team', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Price *</label>
          <input required className={inputClass} value={form.price} onChange={e => set('price', e.target.value)} />
        </div>
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('is_private', !form.is_private)}
              className="w-12 h-6 rounded-full transition-all relative"
              style={{ background: form.is_private ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.is_private ? '1.75rem' : '0.25rem' }}
              />
            </div>
            <span className="text-sm text-zinc-300">Private game</span>
          </label>
        </div>
        {form.is_private && (
          <div>
            <label className={labelClass}>Password</label>
            <input type="password" className={inputClass} value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-gradient w-full py-4 font-bold text-base disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes →'}
        </button>
        <button
          type="button"
          onClick={cancelGame}
          className="w-full py-4 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all font-bold"
        >
          Cancel Game
        </button>
      </form>
    </div>
  )
}
