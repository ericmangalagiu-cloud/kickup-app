'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface BlurRevealProps {
  text: string
  className?: string
  charDelay?: number
  as?: 'h2' | 'h3' | 'p' | 'span'
}

export function BlurReveal({ text, className = '', charDelay = 0.028, as: Tag = 'span' }: BlurRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  const chars = text.split('')

  return (
    <Tag className={className} aria-label={text}>
      <span ref={ref} aria-hidden="true">
        {chars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
            variants={{
              hidden: { opacity: 0, filter: 'blur(10px)', y: 10 },
              visible: {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                transition: {
                  delay: i * charDelay,
                  type: 'spring' as const,
                  stiffness: 200,
                  damping: 22,
                },
              },
            }}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </span>
    </Tag>
  )
}
