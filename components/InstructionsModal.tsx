'use client'

import { useState, useEffect } from 'react'
import { MapPin, PlusCircle, Users, Share2 } from 'lucide-react'

const ONBOARDED_KEY = 'kickup_onboarded'

export function InstructionsModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay so it doesn't flash on hydration
    const timer = setTimeout(() => {
      const name = localStorage.getItem('kickup_name')
      const onboarded = localStorage.getItem(ONBOARDED_KEY)
      if (name && !onboarded) {
        setShow(true)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  // Also listen for when name is set for the first time
  useEffect(() => {
    function handler() {
      const onboarded = localStorage.getItem(ONBOARDED_KEY)
      if (!onboarded) {
        setTimeout(() => setShow(true), 300)
      }
    }
    window.addEventListener('session-updated', handler)
    return () => window.removeEventListener('session-updated', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(ONBOARDED_KEY, 'true')
    setShow(false)
  }

  if (!show) return null

  const steps = [
    {
      icon: <MapPin size={18} className="text-green-600" />,
      title: 'Alege orașul tău',
      desc: 'Folosește selectorul din dreapta sus pentru a vedea meciurile din orașul tău.',
    },
    {
      icon: <Users size={18} className="text-green-600" />,
      title: 'Găsește un meci',
      desc: 'Răsfoiește meciurile disponibile și apasă pe unul pentru detalii și înscriere.',
    },
    {
      icon: <PlusCircle size={18} className="text-green-600" />,
      title: 'Organizează propriul tău meci',
      desc: 'Apasă "Creează un meci", completează detaliile și invită jucătorii.',
    },
    {
      icon: <Share2 size={18} className="text-green-600" />,
      title: 'Distribuie linkul',
      desc: 'Din pagina meciului, copiază linkul și trimite-l prietenilor.',
    },
  ]

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-7 w-full max-w-md animate-slide-up shadow-xl border border-black/[0.07]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12l3 3 5-5"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bine ai venit pe KickUp!</h2>
            <p className="text-sm text-gray-400">Iată cum funcționează aplicația</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                {step.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={dismiss}
          className="btn-gradient w-full py-3 font-semibold text-base"
        >
          Am înțeles, să jucăm!
        </button>
      </div>
    </div>
  )
}
