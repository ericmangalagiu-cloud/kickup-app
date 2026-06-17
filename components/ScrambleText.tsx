'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ăîâșțĂÎÂȘȚ!@#$%'

interface ScrambleTextProps {
  text: string
  delay?: number
  duration?: number
  className?: string
}

export function ScrambleText({ text, delay = 0, duration = 900, className = '' }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const chars = text.split('')
    const revealed = new Array(chars.length).fill(false)
    let startTime = 0

    timeoutRef.current = setTimeout(() => {
      startTime = Date.now()

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Gradually reveal chars from left to right, with overlap
        const revealCount = Math.floor(progress * chars.length * 1.2)

        const scrambled = chars.map((char, i) => {
          if (char === ' ') return ' '
          if (i < revealCount || revealed[i]) {
            revealed[i] = true
            return char
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })

        setDisplay(scrambled.join(''))

        if (progress >= 1) {
          setDisplay(text)
          if (timerRef.current) clearInterval(timerRef.current)
        }
      }, 32)
    }, delay)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [text, delay, duration])

  return <span className={className}>{display}</span>
}
