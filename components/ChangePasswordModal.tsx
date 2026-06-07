'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, X } from 'lucide-react'
import { changePassword, getSession } from '@/lib/session'

interface Props {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!oldPassword || !newPassword) return
    if (newPassword.length < 1) return

    const session = getSession()
    if (!session) return

    setLoading(true)
    const result = await changePassword(session.sessionId, oldPassword, newPassword)
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Eroare.')
      return
    }
    setSuccess(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-black/[0.07] animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Schimbă parola</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="text-green-700 font-semibold">Parola a fost schimbată!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Parola veche</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={e => { setOldPassword(e.target.value); setError('') }}
                  placeholder="Parola actuală"
                  autoFocus
                  disabled={loading}
                  className={inputClass}
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
                  onChange={e => { setNewPassword(e.target.value); setError('') }}
                  placeholder="Parola nouă"
                  disabled={loading}
                  className={inputClass}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={!oldPassword || !newPassword || loading}
              className="btn-gradient w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Se actualizează...' : 'Salvează parola'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
