'use client'

import { useEffect, useRef, useState } from 'react'

interface SlotCounterProps {
  target: number
  suffix?: string
  className?: string
}

export function SlotCounter({ target, suffix = '', className = '' }: SlotCounterProps) {
  const [digits, setDigits] = useState<string[]>(String(target).split(''))
  const [blurring, setBlurring] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started.current) return
        started.current = true

        const finalStr = String(target)
        const len = finalStr.length

        // Phase 1 — fast random cycling with blur
        setBlurring(true)
        let cycleCount = 0
        const CYCLES = 22
        const cycle = setInterval(() => {
          cycleCount++
          setDigits(
            Array.from({ length: len }, () =>
              String(Math.floor(Math.random() * 10))
            )
          )

          // Phase 2 — settle digit by digit from right
          if (cycleCount > CYCLES * 0.55) {
            const settled = CYCLES - cycleCount
            const cutoff = len - Math.floor((CYCLES - settled) * (len / (CYCLES * 0.45)))
            setDigits(prev =>
              prev.map((d, i) => (i >= cutoff ? finalStr[i] ?? d : String(Math.floor(Math.random() * 10))))
            )
          }

          if (cycleCount >= CYCLES) {
            clearInterval(cycle)
            setDigits(finalStr.split(''))
            setBlurring(false)
          }
        }, 55)
      },
      { threshold: 0.3 }
    )

    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])

  return (
    <div
      ref={ref}
      className={`inline-flex items-end tabular-nums ${className}`}
      style={{
        filter: blurring ? 'blur(5px)' : 'none',
        transition: 'filter 0.3s ease',
      }}
    >
      {digits.map((d, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-75"
          style={{ transform: blurring ? 'translateY(-2px)' : 'none' }}
        >
          {d}
        </span>
      ))}
      {suffix && (
        <span
          className="inline-block ml-0.5"
          style={{
            opacity: blurring ? 0 : 1,
            transition: 'opacity 0.4s ease 0.15s',
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}
