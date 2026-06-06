import Link from 'next/link'
import { Game } from '@/lib/supabase'
import { formatDate, formatTime } from '@/lib/utils'
import { MapPin, Calendar, Users, Banknote } from 'lucide-react'

interface GameCardProps {
  game: Game
  spotsLeft: number
  totalSpots: number
}

const levelColors = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced: 'bg-red-50 text-red-700 border-red-200',
}

export function GameCard({ game, spotsLeft, totalSpots }: GameCardProps) {
  const isFull = spotsLeft === 0
  const levelColor = game.level ? levelColors[game.level as keyof typeof levelColors] : null

  return (
    <Link href={`/game/${game.id}`}>
      <div className="bg-white rounded-2xl p-5 card-hover cursor-pointer group border border-black/[0.07] h-full flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-gray-900 font-bold text-lg leading-tight group-hover:text-green-700 transition-colors">
              {game.name}
            </h3>
            <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
              {isFull && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                  Full
                </span>
              )}
              {levelColor && (
                <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${levelColor}`}>
                  {game.level}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-gray-500">
            <p className="flex items-center gap-1.5"><MapPin size={13} className="text-green-600 flex-shrink-0" />{game.location}</p>
            <p className="flex items-center gap-1.5"><Calendar size={13} className="text-green-600 flex-shrink-0" />{formatDate(game.date)} · {formatTime(game.start_time)}–{formatTime(game.end_time)}</p>
            <p className="flex items-center gap-1.5">
              <Users size={13} className="flex-shrink-0" style={{ color: isFull ? '#dc2626' : '#16a34a' }} />
              <span className={isFull ? 'text-red-500' : 'text-green-700'}>{spotsLeft} / {totalSpots} spots left</span>
            </p>
            <p className="flex items-center gap-1.5"><Banknote size={13} className="text-green-600 flex-shrink-0" />{game.price}</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between">
          <p className="text-xs text-gray-400">by {game.organizer_name}</p>
          <span className="text-xs text-green-600 group-hover:text-green-700 transition-colors font-medium">View</span>
        </div>
      </div>
    </Link>
  )
}
