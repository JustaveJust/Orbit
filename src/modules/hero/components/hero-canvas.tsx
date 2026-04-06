import { useEffect, useRef } from 'react'

/**
 * Unified hero canvas: dot grid with proximity glow + radar sweep.
 * Replaces the 55 CSS particle divs and the old separate radar canvas.
 * - Pointer data stored in refs (zero React state from mousemove)
 * - Canvas resize only on window resize (not every frame)
 * - Mobile: static grid, no interaction
 * - Reduced-motion: completely off
 */

/* ── Grid config ─────────────────────────────────────────────────── */
const DOT_SPACING  = 32
const DOT_BASE_R   = 1
const DOT_BASE_A   = 0.10
const GLOW_RADIUS  = 140
const GLOW_MAX_A   = 0.55
const GLOW_MAX_R   = 2.8
const DOT_COLOR_R  = 0
const DOT_COLOR_G  = 212
const DOT_COLOR_B  = 255

/* ── Detect coarse pointer (touch device) ────────────────────────── */
function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches
}

interface HeroCanvasProps {
  readonly prefersReducedMotion: boolean
}

export function HeroCanvas({ prefersReducedMotion }: HeroCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const sizeRef   = useRef({ w: 0, h: 0 })
  const rectRef   = useRef({ top: 0, left: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    /* ── Reduced motion: draw static grid once, then stop ──────── */
    if (prefersReducedMotion) {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      drawStaticGrid(ctx, window.innerWidth, window.innerHeight)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let sweepAngle = 0
    const isMobile = isCoarsePointer()

    /* ── Cache canvas rect (updated on resize + scroll, not per-frame) */
    function updateRect(): void {
      const r = canvas!.getBoundingClientRect()
      rectRef.current = { top: r.top, left: r.left }
    }

    /* ── Resize handler (not per-frame) ────────────────────────── */
    function resize(): void {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      sizeRef.current = { w, h }
      canvas!.width  = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      updateRect()
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', updateRect, { passive: true })

    /* ── Pointer tracking (ref only, no React state) ───────────── */
    function onPointerMove(e: PointerEvent): void {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    function onPointerLeave(): void {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }
    if (!isMobile) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave)
    }

    /* ── Main draw loop ────────────────────────────────────────── */
    function draw(): void {
      const { w, h } = sizeRef.current
      ctx!.clearRect(0, 0, w, h)

      /* 1. Dot grid with proximity glow (canvas-local coords via cached rect) */
      const mx = mouseRef.current.x - rectRef.current.left
      const my = mouseRef.current.y - rectRef.current.top
      const glowR2 = GLOW_RADIUS * GLOW_RADIUS

      for (let gx = DOT_SPACING / 2; gx < w; gx += DOT_SPACING) {
        for (let gy = DOT_SPACING / 2; gy < h; gy += DOT_SPACING) {
          const dx = gx - mx
          const dy = gy - my
          const dist2 = dx * dx + dy * dy

          let alpha = DOT_BASE_A
          let radius = DOT_BASE_R

          if (!isMobile && dist2 < glowR2) {
            const proximity = 1 - Math.sqrt(dist2) / GLOW_RADIUS
            const eased = proximity * proximity
            alpha  = DOT_BASE_A + (GLOW_MAX_A - DOT_BASE_A) * eased
            radius = DOT_BASE_R + (GLOW_MAX_R - DOT_BASE_R) * eased
          }

          ctx!.beginPath()
          ctx!.arc(gx, gy, radius, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${DOT_COLOR_R},${DOT_COLOR_G},${DOT_COLOR_B},${alpha})`
          ctx!.fill()
        }
      }

      /* 2. Radar sweep (merged from old separate canvas) */
      const radarCX = w * 0.72
      const radarCY = h * 0.45
      const radarR  = Math.min(w, h) * 0.20

      /* Sweep fan */
      ctx!.save()
      ctx!.translate(radarCX, radarCY)
      ctx!.rotate(sweepAngle)
      const sweepGrad = ctx!.createLinearGradient(0, 0, radarR, 0)
      sweepGrad.addColorStop(0,   'rgba(0,212,255,0.26)')
      sweepGrad.addColorStop(0.5, 'rgba(0,212,255,0.07)')
      sweepGrad.addColorStop(1,   'rgba(0,212,255,0)')
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.arc(0, 0, radarR, -Math.PI / 5, 0)
      ctx!.closePath()
      ctx!.fillStyle = sweepGrad
      ctx!.fill()
      ctx!.restore()

      /* Rings */
      for (let ring = 1; ring <= 5; ring++) {
        ctx!.beginPath()
        ctx!.arc(radarCX, radarCY, (radarR * ring) / 5, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(0,212,255,${0.030 + 0.015 * ring})`
        ctx!.lineWidth = ring === 5 ? 1 : 0.5
        ctx!.stroke()
      }

      /* Cross hairs */
      ctx!.strokeStyle = 'rgba(0,212,255,0.04)'
      ctx!.lineWidth = 0.5
      ctx!.beginPath(); ctx!.moveTo(radarCX - radarR, radarCY); ctx!.lineTo(radarCX + radarR, radarCY); ctx!.stroke()
      ctx!.beginPath(); ctx!.moveTo(radarCX, radarCY - radarR); ctx!.lineTo(radarCX, radarCY + radarR); ctx!.stroke()

      /* Blips */
      const blips = [
        { a: 0.8, d: radarR * 0.45 }, { a: 2.3, d: radarR * 0.70 },
        { a: 4.1, d: radarR * 0.55 }, { a: 5.5, d: radarR * 0.30 },
        { a: 1.4, d: radarR * 0.62 },
      ]
      for (const blip of blips) {
        const bx = radarCX + Math.cos(blip.a) * blip.d
        const by = radarCY + Math.sin(blip.a) * blip.d
        const ad = (blip.a - (sweepAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        const fa = ad < 0.5 ? 1 : ad > Math.PI ? 0 : 1 - (ad - 0.5) / (Math.PI - 0.5)
        if (fa > 0.01) {
          ctx!.beginPath(); ctx!.arc(bx, by, 7, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(0,212,255,${fa * 0.06})`; ctx!.fill()
          ctx!.beginPath(); ctx!.arc(bx, by, 2.5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(0,212,255,${fa * 0.95})`; ctx!.fill()
        }
      }

      /* Center dot */
      ctx!.beginPath(); ctx!.arc(radarCX, radarCY, 3, 0, Math.PI * 2)
      ctx!.fillStyle = 'rgba(0,212,255,0.9)'; ctx!.fill()
      ctx!.beginPath(); ctx!.arc(radarCX, radarCY, 9, 0, Math.PI * 2)
      ctx!.fillStyle = 'rgba(0,212,255,0.09)'; ctx!.fill()

      sweepAngle += 0.007
      animFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', updateRect)
      if (!isMobile) {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerleave', onPointerLeave)
      }
    }
  }, [prefersReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-55"
      style={{ zIndex: 0 }}
    />
  )
}

/* ── Static grid for reduced-motion / initial render ──────────── */
function drawStaticGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  for (let gx = DOT_SPACING / 2; gx < w; gx += DOT_SPACING) {
    for (let gy = DOT_SPACING / 2; gy < h; gy += DOT_SPACING) {
      ctx.beginPath()
      ctx.arc(gx, gy, DOT_BASE_R, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${DOT_COLOR_R},${DOT_COLOR_G},${DOT_COLOR_B},${DOT_BASE_A})`
      ctx.fill()
    }
  }
}
