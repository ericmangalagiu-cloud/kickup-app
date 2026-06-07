'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Eye, EyeOff, Loader2, Check, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react'
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
  'Wolverhampton','Crystal Palace','Al-Nassr','Al-Hilal','Al-Ahly','Kaizer Chiefs',
  'Nacional','Peñarol','Millonarios','Fluminense','Vasco da Gama','Cruzeiro',
  'Atlético Mineiro','Internacional','Botafogo','Colo-Colo','Universidad de Chile',
  'Borussia Mönchengladbach','Wolfsburg','Hamburger SV','Schalke 04','Stuttgart',
  'Hertha Berlin','Werder Bremen','Hoffenheim','Augsburg','Mainz','Freiburg','Köln',
  'Getafe','Rayo Vallecano','Espanyol','Osasuna','Girona','Real Sociedad','Celta Vigo',
  'Torino','Bologna','Genoa','Sampdoria','Sassuolo','Empoli','Udinese','Monza','Cagliari',
  'Strasbourg','Rennes','Nantes','Nice','Lens','Reims','Montpellier',
  'Twente','AZ Alkmaar','Utrecht','Midtjylland','Copenhagen','Brøndby','Malmö FF',
  'AIK','Rosenborg','Sparta Prague','Slavia Prague','Viktoria Plzeň','Ferencváros',
  'Partizan','Red Star Belgrade','Sheriff Tiraspol','Maccabi Tel Aviv','Legia Warsaw',
  'Esteghlal','Persepolis','Urawa Red Diamonds','Kashima Antlers','Jeonbuk Hyundai',
  // Liga 1 România
  'FCSB','CFR Cluj','Rapid București','UTA Arad','CS Universitatea Craiova',
  'Farul Constanța','Sepsi OSK','Petrolul Ploiești','FC Voluntari','Hermannstadt',
  'FC Botoșani','FC Argeș','Dinamo București','Poli Timișoara','Chindia Târgoviște',
  'CS Mioveni','Gaz Metan Mediaș','Astra Giurgiu','Politehnica Iași','FC Brașov',
  'Ripensia Timișoara','Metalul Reșița','FC Buzău','Unirea Slobozia','Concordia Chiajna',
  // Liga 2 România
  'CSA Steaua București','Corvinul Hunedoara','FK Miercurea Ciuc','ASU Politehnica Timișoara',
  'CSM Politehnica Iași','FC Snagov','CS Afumați','FC Deva','CSM Slatina','Unirea Dej',
  'Progresul Spartac','FC Hunedoara','CSM Câmpina','Viitorul Pandurii Tg-Jiu',
  // Liga 3 România
  'FC Bihor Oradea','FCM Baia Mare','FC Brăila','CS Aerostar Bacău','Avântul Reghin',
  'CS Luceafărul Oradea','CS Ocna Mureș','AFC Odorheiu Secuiesc','CS Balotești',
  'CS Sporting Roșiori','CS Comunal Șelimbăr','Fotbal Club Bistrița','AFC Hermannstadt',
].sort()

const SIZE = 270

function CropModal({ src, onConfirm, onCancel }: { src: string; onConfirm: (v: string) => void; onCancel: () => void }) {
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [natW, setNatW] = useState(0)
  const [natH, setNatH] = useState(0)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const mz = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight)
      setNatW(img.naturalWidth)
      setNatH(img.naturalHeight)
      setMinZoom(mz)
      setZoom(mz)
      setOffset({ x: 0, y: 0 })
    }
    img.src = src
  }, [src])

  function clamp(ox: number, oy: number, z: number) {
    const sw = natW * z, sh = natH * z
    const maxX = Math.max(0, (sw - SIZE) / 2)
    const maxY = Math.max(0, (sh - SIZE) / 2)
    return { x: Math.max(-maxX, Math.min(maxX, ox)), y: Math.max(-maxY, Math.min(maxY, oy)) }
  }

  const scaledW = natW * zoom
  const scaledH = natH * zoom
  const imgLeft = SIZE / 2 - scaledW / 2 + offset.x
  const imgTop = SIZE / 2 - scaledH / 2 + offset.y

  function onDown(cx: number, cy: number) { dragging.current = true; lastPos.current = { x: cx, y: cy } }
  function onMove(cx: number, cy: number) {
    if (!dragging.current) return
    const dx = cx - lastPos.current.x, dy = cy - lastPos.current.y
    lastPos.current = { x: cx, y: cy }
    setOffset(o => clamp(o.x + dx, o.y + dy, zoom))
  }
  function onUp() { dragging.current = false }
  function onZoomChange(z: number) { setZoom(z); setOffset(o => clamp(o.x, o.y, z)) }

  function confirm() {
    if (!natW) return
    const canvas = document.createElement('canvas')
    canvas.width = SIZE; canvas.height = SIZE
    const ctx = canvas.getContext('2d')!
    ctx.beginPath(); ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2); ctx.clip()
    const img = new Image()
    img.onload = () => { ctx.drawImage(img, imgLeft, imgTop, scaledW, scaledH); onConfirm(canvas.toDataURL('image/jpeg', 0.88)) }
    img.src = src
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 w-full shadow-2xl" style={{ maxWidth: SIZE + 48 }}>
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Ajustează poza de profil</h3>
        <div
          className="relative overflow-hidden rounded-full select-none mx-auto mb-5"
          style={{ width: SIZE, height: SIZE, background: '#f3f4f6', cursor: 'grab' }}
          onMouseDown={e => { onDown(e.clientX, e.clientY); e.preventDefault() }}
          onMouseMove={e => onMove(e.clientX, e.clientY)}
          onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={e => onDown(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e => { onMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault() }}
          onTouchEnd={onUp}
        >
          {natW > 0 && (
            <img
              src={src} draggable={false} alt=""
              style={{ position: 'absolute', width: scaledW, height: scaledH, left: imgLeft, top: imgTop, pointerEvents: 'none', userSelect: 'none' }}
            />
          )}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
          <div className="absolute inset-0 rounded-full ring-2 ring-green-400 ring-inset pointer-events-none" />
        </div>
        <div className="flex items-center gap-3 mb-5">
          <ZoomOut size={16} className="text-gray-400 flex-shrink-0" />
          <input type="range" min={minZoom} max={minZoom * 3.5} step={0.01}
            value={zoom} onChange={e => onZoomChange(parseFloat(e.target.value))}
            className="flex-1 accent-green-600" />
          <ZoomIn size={16} className="text-gray-400 flex-shrink-0" />
        </div>
        <p className="text-xs text-gray-400 text-center mb-5">Trage pentru a poziționa • Slider pentru zoom</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">Anulează</button>
          <button onClick={confirm} className="flex-1 py-3 rounded-xl btn-gradient font-semibold">Confirmă</button>
        </div>
      </div>
    </div>
  )
}

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
  const [nationality, setNationality] = useState('')
  const [bestFoot, setBestFoot] = useState('')
  const [position, setPosition] = useState('')
  const [cropSrc, setCropSrc] = useState('')
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
    setAvatar(localStorage.getItem('kickup_avatar') || '')
    getProfile(s.sessionId).then(p => {
      if (!p) return
      const av = p.avatar || ''
      setAvatar(av)
      if (av) localStorage.setItem('kickup_avatar', av)
      setBio(p.bio || '')
      setAge(p.age ? String(p.age) : '')
      setTeam(p.favourite_team || ''); setTeamSearch(p.favourite_team || '')
      setNationality(p.nationality || '')
      setBestFoot(p.best_foot || '')
      setPosition(p.preferred_position || '')
    })
  }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCropSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); if (!session) return
    setSaving(true)
    await updateProfile(session.sessionId, {
      avatar: avatar || undefined, bio: bio || undefined,
      age: age ? parseInt(age) : null, favourite_team: team || undefined,
      nationality: nationality || undefined, best_foot: bestFoot || undefined,
      preferred_position: position || undefined,
    })
    if (avatar) { localStorage.setItem('kickup_avatar', avatar); window.dispatchEvent(new Event('avatar-updated')) }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault(); if (!session) return
    setPwError(''); setSavingPw(true)
    const result = await changePassword(session.sessionId, oldPassword, newPassword)
    setSavingPw(false)
    if (!result.success) { setPwError(result.error || 'Eroare.'); return }
    setPwSaved(true); setOldPassword(''); setNewPassword('')
    setTimeout(() => { setPwSaved(false); setPwOpen(false) }, 1500)
  }

  const filteredTeams = FOOTBALL_TEAMS.filter(t => t.toLowerCase().includes(teamSearch.toLowerCase())).slice(0, 10)
  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
  const selectClass = inputClass + ' cursor-pointer'

  if (!session) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      {cropSrc && <CropModal src={cropSrc} onConfirm={v => { setAvatar(v); setCropSrc('') }} onCancel={() => setCropSrc('')} />}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-8"><ArrowLeft size={16} /> Înapoi</Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Editează contul</h1>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.07] flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold cursor-pointer"
              style={{ background: avatar ? undefined : `linear-gradient(135deg, ${hashColor(session.name)}, #0d9488)` }}
              onClick={() => fileRef.current?.click()}>
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitials(session.name)}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-black/[0.1] shadow flex items-center justify-center text-gray-600 hover:bg-green-50 transition-colors">
              <Camera size={14} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <p className="text-sm text-gray-400">Apasă pe poză pentru a o schimba</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{session.name}</p>
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-black/[0.07]">
          <h2 className="text-base font-bold text-gray-900">Informații profil</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Despre tine <span className="text-gray-400 font-normal">(opțional)</span></label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Scrie câteva cuvinte despre tine..." rows={3} className={inputClass + ' resize-none'} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vârstă <span className="text-gray-400 font-normal">(opțional)</span></label>
              <input type="number" min="10" max="99" value={age} onChange={e => setAge(e.target.value)} placeholder="ex: 24" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naționalitate <span className="text-gray-400 font-normal">(opțional)</span></label>
              <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="ex: Română" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Picior dominant <span className="text-gray-400 font-normal">(opțional)</span></label>
              <select value={bestFoot} onChange={e => setBestFoot(e.target.value)} className={selectClass}>
                <option value="">Nespecificat</option>
                <option value="Dreptul">Dreptul</option>
                <option value="Stângul">Stângul</option>
                <option value="Ambele">Ambele</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Poziție preferată <span className="text-gray-400 font-normal">(opțional)</span></label>
              <select value={position} onChange={e => setPosition(e.target.value)} className={selectClass}>
                <option value="">Nespecificat</option>
                <option value="Portar">Portar</option>
                <option value="Fundaș">Fundaș</option>
                <option value="Mijlocaș">Mijlocaș</option>
                <option value="Atacant">Atacant</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Echipa favorită <span className="text-gray-400 font-normal">(opțional)</span></label>
            <div className="relative">
              <input type="text" value={teamSearch}
                onChange={e => { setTeamSearch(e.target.value); setTeam(e.target.value); setTeamOpen(true) }}
                onFocus={() => setTeamOpen(true)} onBlur={() => setTimeout(() => setTeamOpen(false), 150)}
                placeholder="Caută echipa ta..." className={inputClass} />
              {teamOpen && teamSearch && filteredTeams.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-black/[0.08] rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {filteredTeams.map(t => (
                    <button key={t} type="button" onMouseDown={() => { setTeam(t); setTeamSearch(t); setTeamOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${team === t ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>{t}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change password collapsible */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/[0.07] overflow-hidden">
          <button type="button" onClick={() => setPwOpen(!pwOpen)}
            className="w-full flex items-center justify-between px-6 py-4">
            <span className="text-base font-bold text-gray-900">Schimbă parola</span>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${pwOpen ? 'rotate-180' : ''}`} />
          </button>
          {pwOpen && (
            <div className="px-6 pb-6 space-y-4 border-t border-black/[0.05] pt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parola actuală</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} value={oldPassword}
                    onChange={e => { setOldPassword(e.target.value); setPwError('') }}
                    placeholder="Parola ta actuală" className={inputClass + ' pr-12'} />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parola nouă</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPwError('') }}
                    placeholder="Noua ta parolă" className={inputClass + ' pr-12'} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {pwError && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{pwError}</p>}
              <button type="button" onClick={savePassword} disabled={!oldPassword || !newPassword || savingPw}
                className="btn-gradient w-full py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {savingPw && <Loader2 size={16} className="animate-spin" />}
                {pwSaved ? <><Check size={16} /> Salvat!</> : 'Salvează parola'}
              </button>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="btn-gradient w-full py-4 font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saved ? <><Check size={18} /> Salvat cu succes!</> : saving ? 'Se salvează...' : 'Salvează modificările'}
        </button>
      </form>
    </div>
  )
}
