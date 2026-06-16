'use client'

import { useEffect, useRef } from 'react'

interface Props { size?: number }

export default function Football3D({ size = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shadowRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return
    const el: HTMLDivElement = containerRef.current

    let rafId: number
    let disposed = false

    async function init() {
      const THREE = await import('three')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js') as any
      if (disposed) return

      /* ── Renderer ──────────────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(size, size)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping    = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      renderer.shadowMap.enabled = true
      el.appendChild(renderer.domElement)

      /* ── Scene / Camera ────────────────────────────────────── */
      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 100)
      camera.position.z = 4.2

      /* ── Lights ────────────────────────────────────────────── */
      scene.add(new THREE.AmbientLight(0xffffff, 0.9))

      const key = new THREE.DirectionalLight(0xffffff, 3.5)
      key.position.set(3, 5, 4)
      scene.add(key)

      const fill = new THREE.DirectionalLight(0xccffdd, 0.8)
      fill.position.set(-4, 1, 3)
      scene.add(fill)

      const rim = new THREE.DirectionalLight(0xffffff, 0.5)
      rim.position.set(0, -3, -2)
      scene.add(rim)

      /* ── Shared materials (white panels + black patches) ───── */
      const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.28,
        metalness: 0.04,
        envMapIntensity: 0.6,
      })
      const blackMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.35,
        metalness: 0.04,
        envMapIntensity: 0.4,
      })

      /* ── Load FBX ──────────────────────────────────────────── */
      const loader = new FBXLoader()
      loader.load(
        '/soccer_ball.fbx',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fbx: any) => {
          if (disposed) return

          /* Auto-scale so the ball fills ~80% of the viewport */
          const box   = new THREE.Box3().setFromObject(fbx)
          const size3 = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size3.x, size3.y, size3.z)
          if (maxDim > 0) fbx.scale.setScalar(1.8 / maxDim)

          /* Centre at origin */
          const box2 = new THREE.Box3().setFromObject(fbx)
          const ctr  = box2.getCenter(new THREE.Vector3())
          fbx.position.sub(ctr)

          /* Replace materials: check FBXLoader's parsed color.
             Black-patch meshes have dark DiffuseColor; white panels are light. */
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fbx.traverse((child: any) => {
            if (!child.isMesh) return
            child.castShadow    = true
            child.receiveShadow = true

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pickMat = (m: any) => {
              if (!m) return whiteMat
              // FBXLoader stores DiffuseColor on material.color
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const col = m.color as any
              const brightness = col
                ? (col.r + col.g + col.b) / 3
                : 1
              // Threshold: anything below 0.4 brightness → black patch
              return brightness < 0.4 ? blackMat : whiteMat
            }

            if (Array.isArray(child.material)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              child.material = child.material.map((m: any) => pickMat(m))
            } else {
              child.material = pickMat(child.material)
            }
          })

          scene.add(fbx)

          /* ── Animation loop ─────────────────────────────────── */
          let t = 0
          function frame() {
            if (disposed) return
            rafId = requestAnimationFrame(frame)
            t += 0.015

            fbx.rotation.y += 0.009
            fbx.rotation.x += 0.002
            fbx.rotation.z += 0.001

            const floatY = Math.sin(t * 1.05) * 0.18
            fbx.position.y = floatY

            /* Sync shadow */
            if (shadowRef.current) {
              const norm = (floatY + 0.18) / 0.36
              shadowRef.current.style.transform = `translateX(-50%) scaleX(${0.50 + norm * 0.50})`
              shadowRef.current.style.opacity   = `${0.14 + norm * 0.50}`
            }

            renderer.render(scene, camera)
          }
          frame()
        },
        undefined,
        (err: unknown) => console.error('FBX load error:', err),
      )
    }

    init()

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      while (el?.firstChild) el.removeChild(el.firstChild)
    }
  }, [size])

  return (
    <div className="relative flex-shrink-0 select-none" style={{ width: size, height: size + 36 }}>
      <div ref={containerRef} style={{ width: size, height: size }} />
      <div
        ref={shadowRef}
        style={{
          position:   'absolute',
          bottom:     0,
          left:       '50%',
          width:      size * 0.68,
          height:     20,
          transform:  'translateX(-50%)',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, transparent 70%)',
          opacity:    0.55,
          filter:     'blur(2px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
