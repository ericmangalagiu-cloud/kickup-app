import Link from 'next/link'
import { Game } from '@/lib/supabase'
import { formatDate, formatTime } from '@/lib/utils'

interface GameCardProps {
  game: Game
  spotsLeft: number
  totalSpots: number
}

const levelColors = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function GameCard({ game, spotsLeft, totalSpots }: GameCardProps) {
  const isFull = spotsLeft === 0
  const levelColor = game.level ? levelColors[game.level as keyof typeof levelColors] : null

  return (
    <Link href={`/game/${game.id}`}>
      <div className="glass rounded-2xl p-5 card-hover cursor-pointer group border border-white/[0.08] h-full flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-violet-300 transition-colors">
              {game.name}
            </h3>
            <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
              {isFull && (
                <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                  Full
                </span>
              )}
              {levelColor && (
                <span className={`text-xs border px-2 py-0.5 rounded-full ${levelColor}`}>
                  {game.level}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-zinc-400">
            <p>📍 {game.location}</p>
            <p>📅 {formatDate(game.date)} · {formatTime(game.start_time)}–{formatTime(game.end_time)}</p>
            <p>👥 <span className={isFull ? 'text-red-400' : 'text-emerald-400'}>{spotsLeft} / {totalSpots} spots left</span></p>
            <p>💰 {game.price}</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-zinc-500">by {game.organizer_name}</p>
          <span className="text-xs text-violet-400 group-hover:text-violet-300 transition-colors">View →</span>
        </div>
      </div>
    </Link>
  )
}
