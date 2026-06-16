'use client'

import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'

const CONSENT_KEY = 'kickup_cookies_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if user hasn't made a choice yet
    if (!localStorage.getItem(CONSENT_KEY)) {
      // Slight delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-0 right-0 z-[200] flex justify-center px-4 animate-slide-up"
    >
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full max-w-2xl rounded-2xl px-5 py-4 shadow-2xl"
        style={{
          background: 'rgba(17,24,39,0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}
        >
          <Cookie size={18} className="text-white" />
        </div>

        {/* Text */}
        <p className="text-gray-300 text-sm leading-relaxed flex-1">
          Folosim <span className="text-white font-semibold">cookie-uri esențiale</span> pentru a-ți salva sesiunea și a te ține conectat.
          Nu urmărim, nu vindem date.{' '}
          <span className="text-gray-500">Fără cookie-uri, trebuie să te loghezi la fiecare vizită.</span>
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Refuz
          </button>
          <button onClick={decline} className="text-gray-600 hover:text-gray-400 transition-colors ml-1" aria-label="Închide">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
