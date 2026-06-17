'use client'

import { useScroll, motion, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 pointer-events-none"
      style={{
        scaleX,
        height: 3,
        zIndex: 200,
        background: 'linear-gradient(90deg, #16a34a 0%, #4ade80 50%, #0d9488 100%)',
        transformOrigin: 'left',
        boxShadow: '0 0 8px rgba(74,222,128,0.6)',
      }}
    />
  )
}
