'use client'

import { useEffect, useRef } from 'react'

interface GrainOverlayProps {
  opacity?: number
  /** 'fixed' renders over entire viewport; 'absolute' clips to parent */
  mode?: 'fixed' | 'absolute'
}

export function GrainOverlay({ opacity = 0.038, mode = 'absolute' }: GrainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const offRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Offscreen tile for performance — small tile tiled across canvas
    const TILE = 256
    const offscreen = document.createElement('canvas')
    offscreen.width = TILE
    offscreen.height = TILE
    const octx = offscreen.getContext('2d')!
    offRef.current = offscreen

    function resize() {
      if (!canvas) return
      if (mode === 'fixed') {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      } else {
        const parent = canvas.parentElement
        canvas.width = parent ? parent.offsetWidth : window.innerWidth
        canvas.height = parent ? parent.offsetHeight : window.innerHeight
      }
    }

    function drawGrain() {
      if (!canvas || !ctx || !octx) return

      // Generate random noise tile
      const imageData = octx.createImageData(TILE, TILE)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0
        d[i] = d[i + 1] = d[i + 2] = v
        d[i + 3] = (Math.random() * 48) | 0
      }
      octx.putImageData(imageData, 0, 0)

      // Tile across canvas
      const pattern = ctx.createPattern(offscreen, 'repeat')
      if (!pattern) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    let lastTime = 0
    function animate(time: number) {
      if (time - lastTime > 83) { // ~12fps
        drawGrain()
        lastTime = time
      }
      frameRef.current = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [mode])

  const posClass = mode === 'fixed' ? 'fixed' : 'absolute'

  return (
    <canvas
      ref={canvasRef}
      className={`${posClass} inset-0 pointer-events-none`}
      style={{
        zIndex: 3,
        opacity,
        mixBlendMode: 'screen',
      }}
    />
  )
}
