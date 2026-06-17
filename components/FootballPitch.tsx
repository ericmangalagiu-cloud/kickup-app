'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const LINE = { stroke: '#16a34a', strokeWidth: 1.5, fill: 'none' }

function Path({ d, delay = 0, duration = 0.9 }: { d: string; delay?: number; duration?: number }) {
  return (
    <motion.path
      d={d}
      {...LINE}
      variants={{
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
          pathLength: 1,
          opacity: 1,
          transition: { delay, duration, ease: 'easeOut' as const },
        },
      }}
    />
  )
}

function Circle2({ cx, cy, r, delay = 0, duration = 0.7 }: { cx: number; cy: number; r: number; delay?: number; duration?: number }) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={r}
      {...LINE}
      variants={{
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
          pathLength: 1,
          opacity: 1,
          transition: { delay, duration, ease: 'easeOut' as const },
        },
      }}
    />
  )
}

export function FootballPitch() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <div ref={ref} className="relative w-full py-16 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #fff 0%, #f0fdf4 40%, #fff 100%)' }}>

      {/* Decorative label */}
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5 } },
        }}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="text-center text-green-600 font-bold text-xs uppercase tracking-[0.25em] mb-6"
      >
        Terenul tău te așteaptă
      </motion.p>

      <motion.svg
        viewBox="0 0 520 300"
        className="w-full max-w-xl mx-auto block"
        style={{ filter: 'drop-shadow(0 0 24px rgba(22,163,74,0.22))' }}
        variants={{ hidden: {}, visible: {} }}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {/* Outer pitch boundary */}
        <Path d="M 20,20 L 500,20 L 500,280 L 20,280 Z" delay={0} duration={1.1} />

        {/* Halfway line */}
        <Path d="M 260,20 L 260,280" delay={0.25} duration={0.6} />

        {/* Center circle */}
        <Circle2 cx={260} cy={150} r={45} delay={0.55} duration={0.75} />

        {/* Center spot */}
        <motion.circle cx={260} cy={150} r={3.5} fill="#16a34a"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: { scale: 1, opacity: 1, transition: { delay: 1.15, type: 'spring', stiffness: 400, damping: 14 } },
          }}
        />

        {/* Left penalty area */}
        <Path d="M 20,80 L 110,80 L 110,220 L 20,220" delay={0.85} duration={0.5} />
        {/* Left goal area */}
        <Path d="M 20,115 L 55,115 L 55,185 L 20,185" delay={1.0} duration={0.35} />

        {/* Right penalty area */}
        <Path d="M 500,80 L 410,80 L 410,220 L 500,220" delay={0.85} duration={0.5} />
        {/* Right goal area */}
        <Path d="M 500,115 L 465,115 L 465,185 L 500,185" delay={1.0} duration={0.35} />

        {/* Corner arcs (decorative) */}
        <motion.path d="M 20,35 A 15,15 0 0 0 35,20" {...LINE} strokeWidth={1}
          variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { delay: 1.3, duration: 0.25 } } }} />
        <motion.path d="M 485,20 A 15,15 0 0 0 500,35" {...LINE} strokeWidth={1}
          variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { delay: 1.35, duration: 0.25 } } }} />
        <motion.path d="M 20,265 A 15,15 0 0 1 35,280" {...LINE} strokeWidth={1}
          variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { delay: 1.4, duration: 0.25 } } }} />
        <motion.path d="M 500,265 A 15,15 0 0 0 485,280" {...LINE} strokeWidth={1}
          variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { delay: 1.45, duration: 0.25 } } }} />

        {/* Penalty spots */}
        <motion.circle cx={75} cy={150} r={3} fill="#16a34a"
          variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { delay: 1.25, type: 'spring' } } }} />
        <motion.circle cx={445} cy={150} r={3} fill="#16a34a"
          variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { delay: 1.28, type: 'spring' } } }} />
      </motion.svg>
    </div>
  )
}
