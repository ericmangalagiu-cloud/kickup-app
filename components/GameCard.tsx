'use client'

import Link from 'next/link'
import { Game } from '@/lib/supabase'
import { formatDate, formatTime } from '@/lib/utils'
import { MapPin, Calendar, Users, Banknote, Lock, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

interface GameCardProps {
  game: Game
  spotsLeft: number
  totalSpots: number
}

const levelColors: Record<string, { badge: string }> = {
  'Începător':  { badge: 'bg-green-50 text-green-700 border-green-200' },
  'Intermediar':{ badge: 'bg-amber-50 text-amber-600 border-amber-200' },
  'Avansat':    { badge: 'bg-blue-50 text-blue-600 border-blue-200'   },
  'Orice nivel':{ badge: 'bg-gray-50 text-gray-500 border-gray-200'   },
}

/* Card lift + border glow on hover */
const cardVariants = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 0 0 2px rgba(22,163,74,0.32), 0 20px 40px rgba(22,163,74,0.13), 0 8px 16px rgba(0,0,0,0.08)',
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

/* "Locuri" player name row nudge on hover */
const playerRowVariants = {
  rest: { x: 0 },
  hover: {
    x: 4,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

/* Urgent badge pulse */
const badgePulseVariants = {
  animate: {
    scale: [1, 1.06, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

/* "Vezi →" text shimmer on hover (opacity fade) */
const viewBtnVariants = {
  rest: { opacity: 0.7 },
  hover: {
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
}

export function GameCard({ game, spotsLeft, totalSpots }: GameCardProps) {
  const isFull    = spotsLeft === 0
  const isUrgent  = spotsLeft > 0 && spotsLeft <= 3
  const fillPct   = Math.min(100, ((totalSpots - spotsLeft) / totalSpots) * 100)
  const levelKey  = game.level ?? 'Orice nivel'
  const levelInfo = levelColors[levelKey] ?? levelColors['Orice nivel']

  return (
    <Link href={`/game/${game.id}`} className="block h-full">
      <motion.div
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="bg-white rounded-2xl cursor-pointer border border-black/[0.07] h-full flex flex-col overflow-hidden"
      >
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
                <motion.span
                  variants={badgePulseVariants}
                  animate="animate"
                  className="text-[11px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full whitespace-nowrap inline-block"
                >
                  🔥 {spotsLeft} locuri
                </motion.span>
              )}
              <span className={`text-[11px] border px-2 py-0.5 rounded-full ${levelInfo.badge}`}>
                {levelKey}
              </span>
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
            <motion.p
              variants={playerRowVariants}
              className="flex items-center gap-2"
            >
              <Users size={12} className={`flex-shrink-0 ${isFull ? 'text-red-500' : 'text-green-600'}`} />
              <span className={`font-medium ${isFull ? 'text-red-500' : isUrgent ? 'text-orange-600' : 'text-green-700'}`}>
                {spotsLeft} / {totalSpots} locuri rămase
              </span>
            </motion.p>
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
            <motion.span
              variants={viewBtnVariants}
              className="text-xs text-green-600 font-semibold flex-shrink-0 ml-2"
            >
              Vezi →
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
