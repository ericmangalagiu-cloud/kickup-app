'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { ROMANIAN_CITIES } from '@/hooks/useCityStore'

export default function EditGamePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    if (!confirm('Ești sigur că vrei să anulezi meciul? Această acțiune nu poate fi anulată.')) return
    await supabase.from('games').delete().eq('id', id)
    router.push('/')
  }

  if (loading) return <div className="text-center py-40 text-gray-400">Se încarcă...</div>

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      <Link href={`/game/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Înapoi la meci
      </Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Editează meciul</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-black/[0.07]">
        <div>
          <label className={labelClass}>Numele meciului *</label>
          <input required className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Locație *</label>
          <input required className={inputClass} value={form.location} onChange={e => set('location', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Oraș *</label>
          <select
            required
            className={inputClass + ' cursor-pointer'}
            value={form.city}
            onChange={e => set('city', e.target.value)}
          >
            <option value="">Alege un oraș...</option>
            {ROMANIAN_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Data *</label>
            <input required type="date" min={today} className={inputClass} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Nivel</label>
            <select className={inputClass + ' cursor-pointer'} value={form.level} onChange={e => set('level', e.target.value)}>
              <option value="">Nespecificat</option>
              <option value="beginner">Începători</option>
              <option value="intermediate">Intermediar</option>
              <option value="advanced">Avansat</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ora de start *</label>
            <input required type="time" className={inputClass} value={form.start_time} onChange={e => set('start_time', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Ora de final *</label>
            <input required type="time" className={inputClass} value={form.end_time} onChange={e => set('end_time', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Număr de echipe *</label>
            <input required type="number" min="2" max="6" className={inputClass} value={form.num_teams} onChange={e => set('num_teams', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Jucători per echipă *</label>
            <input required type="number" min="3" max="15" className={inputClass} value={form.players_per_team} onChange={e => set('players_per_team', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Contribuție *</label>
          <input required className={inputClass} value={form.price} onChange={e => set('price', e.target.value)} />
        </div>
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('is_private', !form.is_private)}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: form.is_private ? '#16a34a' : '#e5e7eb' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                style={{ left: form.is_private ? '1.75rem' : '0.25rem' }}
              />
            </div>
            <span className="text-sm text-gray-700">Meci privat</span>
          </label>
        </div>
        {form.is_private && (
          <div>
            <label className={labelClass}>Parolă</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className={inputClass + ' pr-12'} value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-gradient w-full py-4 font-bold text-base disabled:opacity-50">
          {saving ? 'Se salvează...' : 'Salvează modificările'}
        </button>
        <button
          type="button"
          onClick={cancelGame}
          className="w-full py-4 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-all font-bold"
        >
          Anulează meciul
        </button>
      </form>
    </div>
  )
}
