'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { TimePicker } from '@/components/TimePicker'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { useNameModal } from '@/hooks/useNameModal'
import { ROMANIAN_CITIES } from '@/hooks/useCityStore'

export default function CreatePage() {
  const router = useRouter()
  const { open } = useNameModal()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '', location: '', city: '', date: '', start_time: '', end_time: '',
    level: '', num_teams: '2', players_per_team: '7', price: '',
    is_private: false, password: '',
  })

  const today = new Date().toISOString().split('T')[0]

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const session = getSession()
    if (!session) { open(); return }
    if (!form.city) return alert('Please select a city')
    if (form.is_private && !form.password) return alert('Please set a password for private games')
    setLoading(true)

    const { data, error } = await supabase.from('games').insert({
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
      organizer_name: session.name,
      organizer_session_id: session.sessionId,
    }).select().single()

    if (error) {
      const msg = error.message?.includes('Load failed') || error.message?.includes('fetch')
        ? 'Cannot connect to database. Please check that Supabase environment variables are configured.'
        : 'Error creating game: ' + error.message
      alert(msg)
      setLoading(false)
      return
    }
    router.push(`/game/${data.id}`)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Înapoi
      </Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Creează un meci</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-black/[0.07]">
        <div>
          <label className={labelClass}>Numele meciului *</label>
          <input required className={inputClass} placeholder="5 vs 5 duminică" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Locație (teren) *</label>
          <input required className={inputClass} placeholder="Terenul Sintetic Floreasca" value={form.location} onChange={e => set('location', e.target.value)} />
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
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>Data *</label>
            <input required type="date" min={today} className={inputClass} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Nivel</label>
            <select
              className={inputClass + ' cursor-pointer'}
              value={form.level}
              onChange={e => set('level', e.target.value)}
            >
              <option value="">Nespecificat</option>
              <option value="beginner">Începători</option>
              <option value="intermediate">Intermediar</option>
              <option value="advanced">Avansat</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>Ora de start *</label>
            <TimePicker value={form.start_time} onChange={v => set('start_time', v)} required />
          </div>
          <div>
            <label className={labelClass}>Ora de final *</label>
            <TimePicker value={form.end_time} onChange={v => set('end_time', v)} required />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
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
          <input required className={inputClass} placeholder="ex: 20 RON sau Gratuit" value={form.price} onChange={e => set('price', e.target.value)} />
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
          <div className="animate-fade-in">
            <label className={labelClass}>Parolă *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className={inputClass + ' pr-12'} placeholder="Setează o parolă pentru meci" value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient w-full py-4 font-bold text-base disabled:opacity-50"
        >
          {loading ? 'Se creează...' : 'Creează meciul'}
        </button>
      </form>
    </div>
  )
}
