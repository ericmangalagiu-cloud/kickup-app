'use client'

import { useEffect, useRef } from 'react'

const TRAIL_LENGTH = 10

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseRef = useRef({ x: -200, y: -200 })
  const trailPos = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -200, y: -200 }))
  )
  const frameRef = useRef<number>(0)
  const visibleRef = useRef(false)
  const hoverRef = useRef(false)

  useEffect(() => {
    // Hide default cursor
    document.documentElement.classList.add('custom-cursor-active')

    function handleMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (!visibleRef.current) {
        visibleRef.current = true
        if (dotRef.current) dotRef.current.style.opacity = '1'
      }
    }

    function handleLeave() {
      visibleRef.current = false
      if (dotRef.current) dotRef.current.style.opacity = '0'
      trailRefs.current.forEach(el => { if (el) el.style.opacity = '0' })
    }

    function handleEnter() {
      visibleRef.current = true
      if (dotRef.current) dotRef.current.style.opacity = '1'
    }

    function handlePointerOver(e: MouseEvent) {
      const el = e.target as HTMLElement
      hoverRef.current = !!(el.closest('a, button, [role="button"], input, select, textarea, label'))
    }

    function animate() {
      const mouse = mouseRef.current
      const dot = dotRef.current

      // Move main cursor dot to exact mouse position
      if (dot) {
        dot.style.transform = `translate(${mouse.x - 6}px, ${mouse.y - 6}px) scale(${hoverRef.current ? 1.8 : 1})`
      }

      // Shift trail buffer
      trailPos.current = [{ ...mouse }, ...trailPos.current.slice(0, -1)]

      // Update trail elements
      trailRefs.current.forEach((el, i) => {
        if (!el || !visibleRef.current) {
          if (el) el.style.opacity = '0'
          return
        }
        const pos = trailPos.current[i]
        const size = Math.max(2, 11 - i * 0.85)
        const alpha = ((TRAIL_LENGTH - i) / TRAIL_LENGTH) * 0.35
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
    document.addEventListener('mouseover', handlePointerOver)
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
      document.removeEventListener('mouseover', handlePointerOver)
      cancelAnimationFrame(frameRef.current)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [])

  return (
    <>
      {/* Trail dots */}
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

      {/* Main cursor dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none"
        style={{
          zIndex: 9999,
          width: 12,
          height: 12,
          background: '#4ade80',
          boxShadow: '0 0 14px 4px rgba(74,222,128,0.55)',
          opacity: 0,
          willChange: 'transform',
          transition: 'transform 0.08s linear, opacity 0.2s ease, width 0.15s ease, height 0.15s ease',
        }}
      />
    </>
  )
}
