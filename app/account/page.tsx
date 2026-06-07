'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { getSession, getInitials, hashColor, getProfile, updateProfile, changePassword } from '@/lib/session'

const FOOTBALL_TEAMS = [
  'Real Madrid','Barcelona','Manchester City','Liverpool','Bayern Munich','Paris Saint-Germain',
  'Manchester United','Chelsea','Arsenal','Tottenham Hotspur','Juventus','Inter Milan',
  'AC Milan','Atletico Madrid','Borussia Dortmund','Ajax','Benfica','Porto','Sporting CP',
  'AS Roma','Napoli','Lazio','Atalanta','Fiorentina','RB Leipzig','Bayer Leverkusen',
  'Eintracht Frankfurt','Sevilla','Valencia','Real Betis','Athletic Club','Villarreal',
  'Olympique de Marseille','Olympique Lyonnais','AS Monaco','LOSC Lille','PSV Eindhoven',
  'Feyenoord','Celtic','Rangers','Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor',
  'Zenit Saint Petersburg','CSKA Moscow','Spartak Moscow','Shakhtar Donetsk','Dynamo Kyiv',
  'Flamengo','Palmeiras','São Paulo','Corinthians','Santos','Grêmio','Boca Juniors',
  'River Plate','Racing Club','Independiente','Estudiantes','América','Chivas','Cruz Azul',
  'Pumas UNAM','LA Galaxy','New York City FC','Inter Miami','Seattle Sounders',
  'Portland Timbers','Atlanta United','Club Brugge','Anderlecht','Red Bull Salzburg',
  'Olympiacos','Panathinaikos','PAOK','Dinamo Zagreb','Rapid Vienna','Aston Villa',
  'Newcastle United','West Ham United','Brighton','Leicester City','Everton','Leeds United',
  'Wolverhampton','Crystal Palace','Burnley','Southampton','Al-Nassr','Al-Hilal','Al-Ahly',
  'Kaizer Chiefs','Orlando Pirates','Wydad Casablanca','Raja Casablanca','Zamalek',
  'Nacional','Peñarol','Millonarios','América de Cali','Deportivo Cali','LDU Quito',
  'Barcelona SC','Alianza Lima','Universitario','Fluminense','Vasco da Gama','Cruzeiro',
  'Atlético Mineiro','Internacional','Botafogo','Sport Club Recife','Colo-Colo',
  'Universidad de Chile','Estudiantes de La Plata','Vélez Sársfield','Lanús','Talleres',
  'Borussia Mönchengladbach','Wolfsburg','Hamburger SV','Schalke 04','Stuttgart',
  'Hertha Berlin','Werder Bremen','Hoffenheim','Augsburg','Mainz','Freiburg','Köln',
  'Getafe','Rayo Vallecano','Espanyol','Osasuna','Girona','Real Sociedad','Celta Vigo',
  'Alavés','Mallorca','Torino','Bologna','Genoa','Sampdoria','Sassuolo','Empoli','Spezia',
  'Udinese','Salernitana','Lecce','Monza','Cagliari','Frosinone','Verona',
  'Strasbourg','Rennes','Nantes','Nice','Lens','Reims','Montpellier','Bordeaux','Saint-Étienne',
  'Twente','Vitesse','AZ Alkmaar','Utrecht','Groningen','Midtjylland','Copenhagen',
  'Brøndby','Rosenborg','Malmö FF','IFK Göteborg','AIK','Shamrock Rovers','Bohemian',
].sort()

export default function AccountPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [session, setSession] = useState<{ name: string; sessionId: string } | null>(null)
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [age, setAge] = useState('')
  const [team, setTeam] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [teamOpen, setTeamOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    const s = getSession()
    if (!s) { router.push('/'); return }
    setSession(s)
    getProfile(s.sessionId).then(profile => {
      if (profile) {
        setAvatar(profile.avatar || '')
        setBio(profile.bio || '')
        setAge(profile.age ? String(profile.age) : '')
        setTeam(profile.favourite_team || '')
        setTeamSearch(profile.favourite_team || '')
      }
    })
  }, [])

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setSavingProfile(true)
    await updateProfile(session.sessionId, {
      avatar: avatar || undefined,
      bio: bio || undefined,
      age: age ? parseInt(age) : null,
      favourite_team: team || undefined,
    })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setPwError('')
    setSavingPw(true)
    const result = await changePassword(session.sessionId, oldPassword, newPassword)
    setSavingPw(false)
    if (!result.success) { setPwError(result.error || 'Eroare.'); return }
    setPwSaved(true)
    setOldPassword(''); setNewPassword('')
    setTimeout(() => setPwSaved(false), 2000)
  }

  const filteredTeams = FOOTBALL_TEAMS.filter(t =>
    t.toLowerCase().includes(teamSearch.toLowerCase())
  ).slice(0, 8)

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"

  if (!session) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Înapoi
      </Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Editează contul</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold cursor-pointer"
            style={{ background: avatar ? undefined : `linear-gradient(135deg, ${hashColor(session.name)}, #0d9488)` }}
            onClick={() => fileRef.current?.click()}
          >
            {avatar
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              : getInitials(session.name)
            }
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-black/[0.1] shadow flex items-center justify-center text-gray-600 hover:bg-green-50 transition-colors"
          >
            <Camera size={14} />
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
        <p className="text-sm text-gray-400 mt-2">Apasă pe poză pentru a o schimba</p>
        <p className="text-lg font-bold text-gray-900 mt-1">{session.name}</p>
      </div>

      {/* Profile form */}
      <form onSubmit={saveProfile} className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-black/[0.07] mb-6">
        <h2 className="text-lg font-bold text-gray-900">Profil</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Despre tine <span className="text-gray-400 font-normal">(opțional)</span>
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Scrie câteva cuvinte despre tine..."
            rows={3}
            className={inputClass + ' resize-none'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Vârstă <span className="text-gray-400 font-normal">(opțional)</span>
          </label>
          <input
            type="number"
            min="10"
            max="99"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="ex: 24"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Echipa favorită <span className="text-gray-400 font-normal">(opțional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={teamSearch}
              onChange={e => { setTeamSearch(e.target.value); setTeam(e.target.value); setTeamOpen(true) }}
              onFocus={() => setTeamOpen(true)}
              onBlur={() => setTimeout(() => setTeamOpen(false), 150)}
              placeholder="Caută echipa ta..."
              className={inputClass}
            />
            {teamOpen && teamSearch && filteredTeams.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-black/[0.08] rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {filteredTeams.map(t => (
                  <button
                    key={t}
                    type="button"
                    onMouseDown={() => { setTeam(t); setTeamSearch(t); setTeamOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${team === t ? 'text-green-700 font-semibold' : 'text-gray-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="btn-gradient w-full py-3 font-semibold flex items-center justify-center gap-2"
        >
          {savingProfile && <Loader2 size={16} className="animate-spin" />}
          {profileSaved ? <><Check size={16} /> Salvat!</> : savingProfile ? 'Se salvează...' : 'Salvează profilul'}
        </button>
      </form>

      {/* Change password form */}
      <form onSubmit={savePassword} className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-black/[0.07]">
        <h2 className="text-lg font-bold text-gray-900">Schimbă parola</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Parola actuală</label>
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={e => { setOldPassword(e.target.value); setPwError('') }}
              placeholder="Parola ta actuală"
              className={inputClass + ' pr-12'}
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Parola nouă</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setPwError('') }}
              placeholder="Noua ta parolă"
              className={inputClass + ' pr-12'}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {pwError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{pwError}</p>
        )}

        <button
          type="submit"
          disabled={!oldPassword || !newPassword || savingPw}
          className="btn-gradient w-full py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {savingPw && <Loader2 size={16} className="animate-spin" />}
          {pwSaved ? <><Check size={16} /> Parola schimbată!</> : savingPw ? 'Se actualizează...' : 'Schimbă parola'}
        </button>
      </form>
    </div>
  )
}
