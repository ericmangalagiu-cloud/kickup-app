'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('kickup-splash')
    if (!seen) {
      setVisible(true)
      sessionStorage.setItem('kickup-splash', '1')
      // Hide after 2.1s
      const t = setTimeout(() => setVisible(false), 2100)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{ background: '#071608' }}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.55, ease: 'easeIn', delay: 0.05 },
          }}
        >
          {/* Football drop-in */}
          <motion.div
            initial={{ y: '-60vh', rotate: 0, scale: 0.6 }}
            animate={{ y: 0, rotate: 720, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-7xl select-none"
            style={{ filter: 'drop-shadow(0 0 40px rgba(22,163,74,0.6))' }}
          >
            ⚽
          </motion.div>

          {/* Shadow that appears under ball */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.35 }}
            transition={{ delay: 0.55, duration: 0.3, ease: 'easeOut' }}
            className="rounded-full mt-2"
            style={{
              width: 64, height: 10,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)',
            }}
          />

          {/* Logo text materialise */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.72, type: 'spring', stiffness: 200, damping: 18 }}
            className="mt-6 text-center"
          >
            <span className="text-5xl font-black tracking-tight text-white">KickUp</span>
          </motion.div>

          {/* Green underline draws left to right */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.05, duration: 0.55, ease: 'easeOut' }}
            className="mt-3 h-0.5 rounded-full"
            style={{
              width: 180,
              background: 'linear-gradient(90deg, #16a34a, #0d9488)',
              transformOrigin: 'left',
            }}
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="mt-3 text-green-500 text-sm font-medium tracking-widest uppercase"
          >
            Fotbal pickup în România
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
