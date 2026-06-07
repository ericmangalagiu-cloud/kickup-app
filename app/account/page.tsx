'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Eye, EyeOff, Loader2, Check, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react'
import { getSession, getInitials, hashColor, getProfile, updateProfile, changePassword } from '@/lib/session'

const FOOTBALL_TEAMS = [
  // Top Global
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
  'Nacional','Peñarol','Millonarios','América de Cali','LDU Quito','Barcelona SC',
  'Alianza Lima','Universitario','Fluminense','Vasco da Gama','Cruzeiro','Atlético Mineiro',
  'Internacional','Botafogo','Colo-Colo','Universidad de Chile','Vélez Sársfield','Lanús',
  'Borussia Mönchengladbach','Wolfsburg','Hamburger SV','Schalke 04','Stuttgart',
  'Hertha Berlin','Werder Bremen','Hoffenheim','Augsburg','Mainz','Freiburg','Köln',
  'Getafe','Rayo Vallecano','Espanyol','Osasuna','Girona','Real Sociedad','Celta Vigo',
  'Torino','Bologna','Genoa','Sampdoria','Sassuolo','Empoli','Udinese','Monza','Cagliari',
  'Strasbourg','Rennes','Nantes','Nice','Lens','Reims','Montpellier',
  'Twente','AZ Alkmaar','Utrecht','Midtjylland','Copenhagen','Brøndby','Malmö FF',
  'AIK','IFK Göteborg','Rosenborg','Shamrock Rovers','Legia Warsaw','Wisła Kraków',
  'Sparta Prague','Slavia Prague','Viktoria Plzeň','Ferencváros','Partizan','Red Star Belgrade',
  'Sheriff Tiraspol','Maccabi Tel Aviv','Hapoel Tel Aviv','Beitar Jerusalem',
  'Esteghlal','Persepolis','Al-Ittihad','Al-Ahli','Urawa Red Diamonds','Kashima Antlers',
  'Jeonbuk Hyundai','Sydney FC','Melbourne City','Auckland City',
  // Liga 1 România
  'FCSB','CFR Cluj','Rapid București','UTA Arad','CS Universitatea Craiova',
  'Farul Constanța','Sepsi OSK','Petrolul Ploiești','FC Voluntari','Hermannstadt',
  'FC Botoșani','FC Argeș','Dinamo București','Poli Timișoara','Chindia Târgoviște',
  'CS Mioveni','Academica Clinceni','Gaz Metan Mediaș','Astra Giurgiu',
  'Politehnica Iași','FC Brașov','Ripensia Timișoara','Metalul Reșița',
  // Liga 2 România
  'CSA Steaua București','Corvinul Hunedoara','FK Miercurea Ciuc','Unirea Slobozia',
  'Concordia Chiajna','ASU Politehnica Timișoara','CSM Politehnica Iași','FC Snagov',
  'CS Afumați','FC Deva','CSM Slatina','Progresul Spartac','Unirea Dej','FC Hunedoara',
  'CSM Câmpina','Viitorul Pandurii Tg-Jiu','FC Mediaș','CS Tunari','Poli Iași',
  // Liga 3 România
  'Viitorul Constanța','Fotbal Club Argeș','CS Comunal Șelimbăr','AFC Hermannstadt',
  'CS Sporting Roșiori','FCM Baia Mare','CS Balotești','Recolta Gheraești',
  'CS Sporting Liești','AFC Odorheiu Secuiesc','FC Buzău','Sportul Chișineu-Criș',
  'FC Bihor Oradea','Fotbal Club Bistrița','CS Ocna Mureș','FC Fălticeni',
  'CS Luceafărul Oradea','FC Brăila','CS Aerostar Bacău','Avântul Reghin',
].sort()

// --- Image Crop Modal ---
interface CropModalProps {
  src: string
  onConfirm: (cropped: string) => void
  onCancel: () => void
}

function CropModal({ src, onConfirm, onCancel }: CropModalProps) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const SIZE = 240

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => { imgRef.current = img }
    img.src = src
  }, [src])

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return
    setOffset(o => ({ x: o.x + e.clientX - lastPos.current.x, y: o.y + e.clientY - lastPos.current.y }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  function onMouseUp() { dragging.current = false }

  function onTouchStart(e: React.TouchEvent) {
    dragging.current = true
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return
    setOffset(o => ({ x: o.x + e.touches[0].clientX - lastPos.current.x, y: o.y + e.touches[0].clientY - lastPos.current.y }))
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd() { dragging.current = false }

  function confirm() {
    const img = imgRef.current
    if (!img) return
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')!
    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    const scaledW = img.naturalWidth * zoom
    const scaledH = img.naturalHeight * zoom
    const sx = (SIZE - scaledW) / 2 + offset.x
    const sy = (SIZE - scaledH) / 2 + offset.y
    ctx.drawImage(img, sx, sy, scaledW, scaledH)
    onConfirm(canvas.toDataURL('image/jpeg', 0.85))
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Ajustează poza</h3>
        {/* Crop area */}
        <div className="flex justify-center mb-4">
          <div
            className="relative overflow-hidden rounded-full cursor-grab active:cursor-grabbing select-none"
            style={{ width: SIZE, height: SIZE, background: '#f3f4f6' }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          >
            <img
              src={src}
              draggable={false}
              style={{
                position: 'absolute',
                width: `${zoom * 100}%`,
                left: `${(SIZE - SIZE * zoom) / 2 + offset.x}px`,
                top: `${(SIZE - SIZE * zoom) / 2 + offset.y}px`,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              alt=""
            />
            {/* Circle outline */}
            <div className="absolute inset-0 rounded-full ring-2 ring-green-400 ring-inset pointer-events-none" />
          </div>
        </div>
        {/* Zoom slider */}
        <div className="flex items-center gap-3 mb-5">
          <ZoomOut size={16} className="text-gray-400" />
          <input
            type="range" min="0.5" max="3" step="0.05"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-green-600"
          />
          <ZoomIn size={16} className="text-gray-400" />
        </div>
        <p className="text-xs text-gray-400 text-center mb-5">Trage poza și ajustează zoom-ul</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
            Anulează
          </button>
          <button onClick={confirm} className="flex-1 py-2.5 rounded-xl btn-gradient font-semibold">
            Confirmă
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Page ---
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

  const [cropSrc, setCropSrc] = useState('')  // raw image to crop
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [pwOpen, setPwOpen] = useState(false)
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
    // Load avatar from localStorage first for instant display
    const cached = localStorage.getItem('kickup_avatar')
    if (cached) setAvatar(cached)
    getProfile(s.sessionId).then(profile => {
      if (profile) {
        const av = profile.avatar || ''
        setAvatar(av)
        if (av) localStorage.setItem('kickup_avatar', av)
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
    reader.onload = ev => {
      setCropSrc(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function onCropConfirm(cropped: string) {
    setAvatar(cropped)
    setCropSrc('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setSaving(true)
    const ok = await updateProfile(session.sessionId, {
      avatar: avatar || undefined,
      bio: bio || undefined,
      age: age ? parseInt(age) : null,
      favourite_team: team || undefined,
    })
    if (ok && avatar) {
      localStorage.setItem('kickup_avatar', avatar)
      window.dispatchEvent(new Event('avatar-updated'))
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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
    setTimeout(() => { setPwSaved(false); setPwOpen(false) }, 1500)
  }

  const filteredTeams = FOOTBALL_TEAMS.filter(t =>
    t.toLowerCase().includes(teamSearch.toLowerCase())
  ).slice(0, 10)

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"

  if (!session) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      {cropSrc && (
        <CropModal src={cropSrc} onConfirm={onCropConfirm} onCancel={() => setCropSrc('')} />
      )}

      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Înapoi
      </Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Editează contul</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.07]">
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
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
            <p className="text-sm text-gray-400">Apasă pe poză pentru a o schimba</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{session.name}</p>
          </div>
        </div>

        {/* Profile fields */}
        <div className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-black/[0.07]">
          <h2 className="text-base font-bold text-gray-900">Informații profil</h2>

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
              type="number" min="10" max="99"
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
        </div>

        {/* Change password — collapsible */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/[0.07] overflow-hidden">
          <button
            type="button"
            onClick={() => setPwOpen(!pwOpen)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-base font-bold text-gray-900">Schimbă parola</span>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${pwOpen ? 'rotate-180' : ''}`} />
          </button>

          {pwOpen && (
            <div className="px-6 pb-6 space-y-4 border-t border-black/[0.05]" style={{ paddingTop: '1.25rem' }}>
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
              {pwError && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{pwError}</p>}
              <button
                type="button"
                onClick={savePassword}
                disabled={!oldPassword || !newPassword || savingPw}
                className="btn-gradient w-full py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingPw && <Loader2 size={16} className="animate-spin" />}
                {pwSaved ? <><Check size={16} /> Parola schimbată!</> : savingPw ? 'Se actualizează...' : 'Salvează parola'}
              </button>
            </div>
          )}
        </div>

        {/* Main save button */}
        <button
          type="submit"
          disabled={saving}
          className="btn-gradient w-full py-4 font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saved ? <><Check size={18} /> Salvat cu succes!</> : saving ? 'Se salvează...' : 'Salvează modificările'}
        </button>
      </form>
    </div>
  )
}
