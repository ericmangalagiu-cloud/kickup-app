'use client'

import { useEffect, useRef } from 'react'

interface CursorGlowProps {
  opacity?: number
}

export function CursorGlow({ opacity = 0.10 }: CursorGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const rafId = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const parent = canvas.parentElement
    if (!parent) return

    function resize() {
      if (!canvas || !parent) return
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
    }

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (mouse.current.x < 0) {
        rafId.current = requestAnimationFrame(draw)
        return
      }
      const gradient = ctx.createRadialGradient(
        mouse.current.x, mouse.current.y, 0,
        mouse.current.x, mouse.current.y, 280
      )
      gradient.addColorStop(0, `rgba(74, 222, 128, ${opacity})`)
      gradient.addColorStop(0.45, `rgba(22, 163, 74, ${opacity * 0.28})`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      rafId.current = requestAnimationFrame(draw)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = parent?.getBoundingClientRect()
      if (!rect) return
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function onMouseLeave() {
      mouse.current = { x: -9999, y: -9999 }
    }

    resize()
    window.addEventListener('resize', resize)
    parent.addEventListener('mousemove', onMouseMove)
    parent.addEventListener('mouseleave', onMouseLeave)
    rafId.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      parent.removeEventListener('mousemove', onMouseMove)
      parent.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(rafId.current)
    }
  }, [opacity])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: 'screen', zIndex: 0 }}
    />
  )
}
