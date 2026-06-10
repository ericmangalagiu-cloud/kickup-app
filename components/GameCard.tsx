'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Game } from '@/lib/supabase'
import { formatDate, formatTime } from '@/lib/utils'
import { MapPin, Calendar, Users, Banknote, Lock, Crown } from 'lucide-react'

interface GameCardProps {
  game: Game
  spotsLeft: number
  totalSpots: number
}

const levelColors: Record<string, { badge: string; dot: string }> = {
  beginner:     { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#10b981' },
  intermediate: { badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: '#f59e0b' },
  advanced:     { badge: 'bg-red-50 text-red-600 border-red-200',             dot: '#ef4444' },
}

export function GameCard({ game, spotsLeft, totalSpots }: GameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isFull = spotsLeft === 0
  const isUrgent = spotsLeft > 0 && spotsLeft <= 3
  const fillPct = Math.min(100, ((totalSpots - spotsLeft) / totalSpots) * 100)
  const levelInfo = game.level ? levelColors[game.level as keyof typeof levelColors] : null

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.classList.add('tilt-card')
    el.classList.remove('tilt-card-reset')
    el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-3px) scale(1.01)`
    el.style.boxShadow = `${-x * 12}px ${-y * 12}px 40px rgba(22,163,74,0.12), 0 12px 32px rgba(0,0,0,0.07)`
  }

  function onMouseLeave() {
    const el = cardRef.current
    if (!el) return
    el.classList.add('tilt-card-reset')
    el.classList.remove('tilt-card')
    el.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)'
    el.style.boxShadow = ''
  }

  return (
    <Link href={`/game/${game.id}`} className="block h-full">
      <div ref={cardRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        className="bg-white rounded-2xl cursor-pointer group border border-black/[0.07] h-full flex flex-col overflow-hidden shadow-sm">

        {/* Progress fill strip at top */}
        <div className="h-1 w-full bg-gray-100 flex-shrink-0">
          <div className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${fillPct}%`,
              background: isFull
                ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                : isUrgent
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(90deg, #16a34a, #0d9488)'
            }} />
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="text-gray-900 font-bold text-base leading-tight group-hover:text-green-700 transition-colors line-clamp-2">
              {game.name}
            </h3>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {game.is_private && (
                <span className="flex items-center gap-1 text-[11px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Lock size={9} /> Privat
                </span>
              )}
              {isFull && (
                <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">Full</span>
              )}
              {isUrgent && !isFull && (
                <span className="text-[11px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  🔥 {spotsLeft} locuri
                </span>
              )}
              {levelInfo && (
                <span className={`text-[11px] border px-2 py-0.5 rounded-full capitalize ${levelInfo.badge}`}>
                  {game.level}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-sm text-gray-500 flex-1">
            <p className="flex items-center gap-2">
              <MapPin size={12} className="text-green-600 flex-shrink-0" />
              <span className="truncate">{game.location}, {game.city}</span>
            </p>
            <p className="flex items-center gap-2">
              <Calendar size={12} className="text-green-600 flex-shrink-0" />
              {formatDate(game.date)} · {formatTime(game.start_time)}–{formatTime(game.end_time)}
            </p>
            <p className="flex items-center gap-2">
              <Users size={12} className={`flex-shrink-0 ${isFull ? 'text-red-500' : 'text-green-600'}`} />
              <span className={`font-medium ${isFull ? 'text-red-500' : isUrgent ? 'text-orange-600' : 'text-green-700'}`}>
                {spotsLeft} / {totalSpots} locuri rămase
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Banknote size={12} className="text-green-600 flex-shrink-0" />
              {game.price}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
              <Crown size={11} className="text-amber-400 flex-shrink-0" />
              <span className="truncate">{game.organizer_name}</span>
            </div>
            <span className="text-xs text-green-600 group-hover:text-green-700 font-semibold flex-shrink-0 ml-2">
              Vezi →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
