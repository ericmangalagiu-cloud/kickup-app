'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Trash2, Users, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSession, isAdmin } from '@/lib/session'

type UserRow = {
  id: string
  name: string
  name_lower: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session || !isAdmin(session.name)) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('id, name, name_lower, created_at')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function deleteUser(user: UserRow) {
    if (!confirm(`Ștergi contul "${user.name}"? Această acțiune nu poate fi anulată.`)) return
    setDeleting(user.id)
    await supabase.from('users').delete().eq('id', user.id)
    setUsers(prev => prev.filter(u => u.id !== user.id))
    setDeleting(null)
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Panou Admin</h1>
          <p className="text-gray-400 text-sm">Gestionează conturile utilizatorilor</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-black/[0.07] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
          <Users size={16} className="text-green-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{users.length}</p>
          <p className="text-xs text-gray-400">conturi înregistrate</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Caută după nume..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-black/[0.08] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
        />
      </div>

      {/* User list */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/[0.07] overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Se încarcă...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {search ? 'Niciun cont găsit.' : 'Niciun cont înregistrat.'}
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05]">
            {filtered.map(user => (
              <div key={user.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(user.created_at)}</p>
                </div>
                <button
                  onClick={() => deleteUser(user)}
                  disabled={deleting === user.id || user.name.toLowerCase() === 'admin'}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={13} />
                  {deleting === user.id ? 'Se șterge...' : 'Șterge'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
