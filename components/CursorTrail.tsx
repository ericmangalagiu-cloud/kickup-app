'use client'

import { useEffect, useRef } from 'react'

const TRAIL_LENGTH = 10

export function CursorTrail() {
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseRef = useRef({ x: -200, y: -200 })
  const trailPos = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -200, y: -200 }))
  )
  const frameRef = useRef<number>(0)
  const visibleRef = useRef(false)

  useEffect(() => {
    /* Desktop only */
    if (window.matchMedia('(pointer: coarse)').matches) return

    function handleMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      visibleRef.current = true
    }

    function handleLeave() {
      visibleRef.current = false
      trailRefs.current.forEach(el => { if (el) el.style.opacity = '0' })
    }

    function handleEnter() {
      visibleRef.current = true
    }

    function animate() {
      const mouse = mouseRef.current

      /* Shift trail buffer forward */
      trailPos.current = [{ ...mouse }, ...trailPos.current.slice(0, -1)]

      /* Update trail elements */
      trailRefs.current.forEach((el, i) => {
        if (!el || !visibleRef.current) {
          if (el) el.style.opacity = '0'
          return
        }
        const pos = trailPos.current[i]
        const size = Math.max(2, 11 - i * 0.85)
        const alpha = ((TRAIL_LENGTH - i) / TRAIL_LENGTH) * 0.45
        el.style.transform = `translate(${pos.x - size / 2}px, ${pos.y - size / 2}px)`
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.opacity = String(alpha)
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <div
          key={i}
          ref={el => { trailRefs.current[i] = el }}
          className="fixed top-0 left-0 rounded-full pointer-events-none"
          style={{
            zIndex: 9998,
            background: 'rgba(74,222,128,0.9)',
            width: 10,
            height: 10,
            opacity: 0,
            willChange: 'transform, opacity',
            transition: `transform ${(i + 1) * 18}ms linear`,
          }}
        />
      ))}
    </>
  )
}
