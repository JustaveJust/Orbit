import { useRef, useEffect, useCallback, useState } from 'react'
import { cn } from '@/shared/utils/cn'

interface BeforeAfterSliderProps {
  readonly disasterName: string
  readonly disasterType: string
  readonly beforeImageUrl?: string | null
  readonly afterImageUrl?: string | null
}

// ── Deterministic seeded PRNG (LCG) ─────────────────────────────────────────
function makePrng(seed: number): () => number {
  let s = (seed ^ 0x9e3779b9) >>> 0
  return (): number => {
    s = ((s * 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// ── FALSE-COLOR NIR "BEFORE" renderer ────────────────────────────────────────
// Vegetation  → pinkish-red/magenta (chlorophyll reflects NIR strongly)
// Urban       → steel-grey with cyan tint
// Agricultural/Soil → warm ochre
// Water       → near-black (absorbs NIR)
function renderBefore(ctx: CanvasRenderingContext2D, W: number, H: number, disasterType: string): void {
  const seed = disasterType.charCodeAt(0) * 7

  // Per-pixel land-cover noise
  const img  = ctx.createImageData(W, H)
  const data = img.data

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4
      const nx  = x / W
      const ny  = y / H

      const landNoise = (
        Math.sin(nx * 11.3 + ny * 7.8  + 0.5) * 0.45 +
        Math.sin(nx * 23.1 - ny * 16.4 + 1.8) * 0.28 +
        Math.sin(nx *  5.7 + ny *  4.2 + 3.1) * 0.17 +
        Math.sin(nx * 47.3 + ny * 31.9 + 2.4) * 0.07 +
        Math.sin(nx *  2.1 + ny *  1.6 + 0.9) * 0.03
      ) * 0.5 + 0.5

      const landType = (
        Math.sin(nx * 4.7 + ny * 3.1 + 0.7) * 0.5 +
        Math.sin(nx * 2.3 + ny * 5.8 + 1.4) * 0.3 +
        Math.sin(nx * 8.1 + ny * 1.9 + 2.2) * 0.2
      ) * 0.5 + 0.5

      const pn = ((x * 127 ^ y * 311) & 0xf) - 8

      let r: number, g: number, b: number

      if (landType < 0.38) {
        // Vegetation — NIR false-color: vivid pinkish-red
        r = 155 + (landNoise * 58) | 0; g = 24 + (landNoise * 28) | 0; b = 48 + (landNoise * 26) | 0
      } else if (landType < 0.62) {
        // Urban — steel cyan-grey
        r = 64  + (landNoise * 46) | 0; g = 86 + (landNoise * 50) | 0; b = 88 + (landNoise * 46) | 0
      } else if (landType < 0.80) {
        // Agricultural / soil — warm ochre
        r = 114 + (landNoise * 64) | 0; g = 92 + (landNoise * 46) | 0; b = 50 + (landNoise * 30) | 0
      } else {
        // Water — absorbs NIR, near-black
        r = 7   + (landNoise * 14) | 0; g = 12 + (landNoise * 16) | 0; b = 26 + (landNoise * 22) | 0
      }

      data[idx]     = Math.max(0, Math.min(255, r + pn))
      data[idx + 1] = Math.max(0, Math.min(255, g + pn))
      data[idx + 2] = Math.max(0, Math.min(255, b + pn))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // Agricultural field parcels
  const fieldRng = makePrng(seed + 100)
  ctx.strokeStyle = 'rgba(78,52,18,0.32)'
  ctx.lineWidth   = 1
  const fw = 44 + (fieldRng() * 28 | 0)
  const fh = 30 + (fieldRng() * 20 | 0)
  for (let fx = 0; fx < W; fx += fw) {
    for (let fy = Math.floor(H * 0.28); fy < H * 0.82; fy += fh) {
      const fw2 = fw - 2 + (fieldRng() * 8 | 0)
      const fh2 = fh - 2 + (fieldRng() * 6 | 0)
      ctx.strokeRect(fx + 1, fy + 1, fw2, fh2)
    }
  }

  // River / stream
  const riverRng = makePrng(seed + 150)
  ctx.strokeStyle = 'rgba(6,14,32,0.68)'
  ctx.lineWidth   = 3.5
  ctx.beginPath()
  ctx.moveTo(W * 0.13, 0)
  ctx.bezierCurveTo(
    W * (0.19 + riverRng() * 0.08), H * 0.28,
    W * (0.09 + riverRng() * 0.10), H * 0.62,
    W * (0.16 + riverRng() * 0.06), H,
  )
  ctx.stroke()

  // Intact buildings — sparse clusters, not a uniform grid
  const bldRng = makePrng(seed + 500)
  const cell   = 38
  for (let gx = 0; gx < W; gx += cell) {
    for (let gy = 0; gy < H; gy += cell) {
      if (bldRng() < 0.72) continue   // ~28% density — no obvious grid
      const clusterCount = 1 + (bldRng() * 3 | 0)
      for (let k = 0; k < clusterCount; k++) {
        const ox = (bldRng() * (cell - 10)) | 0
        const oy = (bldRng() * (cell - 10)) | 0
        const bw = 5 + (bldRng() * 8) | 0
        const bh = 4 + (bldRng() * 7) | 0
        ctx.fillStyle = 'rgba(28,20,10,0.28)'
        ctx.fillRect(gx + ox + bw, gy + oy + 1, 2, bh)
        ctx.fillRect(gx + ox + 1, gy + oy + bh, bw, 2)
        ctx.fillStyle = 'rgba(140,128,110,0.72)'
        ctx.fillRect(gx + ox, gy + oy, bw, bh)
      }
    }
  }

  // Roads — clean pre-disaster
  const roadRng = makePrng(seed + 800)
  ctx.strokeStyle = 'rgba(102,94,78,0.64)'; ctx.lineWidth = 1.5
  for (let ry = 24; ry < H; ry += 34 + (roadRng() * 20 | 0)) {
    ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(W, ry); ctx.stroke()
  }
  for (let rx = 24; rx < W; rx += 42 + (roadRng() * 24 | 0)) {
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx, H); ctx.stroke()
  }

  // NIR vegetation bloom clusters
  const vegRng = makePrng(seed + 400)
  for (let i = 0; i < 5; i++) {
    const vx = vegRng() * W; const vy = vegRng() * H; const vr = 28 + vegRng() * 38
    const gr = ctx.createRadialGradient(vx, vy, 0, vx, vy, vr)
    gr.addColorStop(0, 'rgba(188,26,64,0.44)')
    gr.addColorStop(1, 'rgba(188,26,64,0)')
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2); ctx.fill()
  }

  // CRT scanlines + vignette
  ctx.fillStyle = 'rgba(0,0,0,0.055)'
  for (let sl = 0; sl < H; sl += 3) ctx.fillRect(0, sl, W, 1)
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.72)
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.50)')
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)
}

// ── POST-DISASTER "AFTER" renderer ───────────────────────────────────────────
function renderAfter(ctx: CanvasRenderingContext2D, W: number, H: number, disasterType: string): void {
  const seed = disasterType.charCodeAt(0) * 7
  const img  = ctx.createImageData(W, H)
  const data = img.data

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4
      const nx  = x / W; const ny = y / H

      const v = (
        Math.sin(nx * 11.3 + ny * 7.8  + 0.5) * 0.45 +
        Math.sin(nx * 23.1 - ny * 16.4 + 1.8) * 0.28 +
        Math.sin(nx *  5.7 + ny *  4.2 + 3.1) * 0.17 +
        Math.sin(nx * 47.3 + ny * 31.9 + 2.4) * 0.07 +
        Math.sin(nx *  2.1 + ny *  1.6 + 0.9) * 0.03
      ) * 0.5 + 0.5

      const pn = ((x * 127 ^ y * 311) & 0xf) - 8
      let r: number, g: number, b: number

      if (disasterType === 'TYPHOON' || disasterType === 'FLOOD') {
        r = 20 + (v * 36) | 0; g = 32 + (v * 40) | 0; b = 50 + (v * 58) | 0
      } else if (disasterType === 'LANDSLIDE') {
        const ash = 70 + (v * 70) | 0; r = ash + 14; g = ash + 6; b = ash - 6
      } else if (disasterType === 'EARTHQUAKE') {
        r = 40 + (v * 60) | 0; g = 36 + (v * 50) | 0; b = 26 + (v * 36) | 0
      } else {
        r = 28 + (v * 46) | 0; g = 30 + (v * 42) | 0; b = 22 + (v * 34) | 0
      }

      data[idx]     = Math.max(0, Math.min(255, r + pn))
      data[idx + 1] = Math.max(0, Math.min(255, g + pn))
      data[idx + 2] = Math.max(0, Math.min(255, b + pn))
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // Flood / Typhoon overlays
  if (disasterType === 'TYPHOON' || disasterType === 'FLOOD') {
    ctx.fillStyle = 'rgba(5,38,82,0.50)'
    ctx.beginPath(); ctx.ellipse(W * 0.28, H * 0.68, W * 0.26, H * 0.16, 0.3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(5,38,82,0.36)'
    ctx.beginPath(); ctx.ellipse(W * 0.65, H * 0.52, W * 0.18, H * 0.12, -0.2, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(88,188,255,0.18)'; ctx.lineWidth = 1
    for (let wl = 0; wl < 7; wl++) {
      ctx.beginPath(); ctx.moveTo(W * 0.12, H * (0.62 + wl * 0.014)); ctx.lineTo(W * 0.46, H * (0.62 + wl * 0.014)); ctx.stroke()
    }
    const debRng = makePrng(seed + 600)
    ctx.fillStyle = 'rgba(55,42,22,0.58)'
    for (let d = 0; d < 22; d++) {
      ctx.fillRect(W * (0.12 + debRng() * 0.36), H * (0.54 + debRng() * 0.24), 2 + debRng() * 3, 1 + debRng() * 2)
    }
  }

  // Volcanic overlays
  if (disasterType === 'LANDSLIDE') {
    const laharRng = makePrng(seed + 250)
    ctx.strokeStyle = 'rgba(78,50,22,0.72)'; ctx.lineWidth = 4.5
    ctx.beginPath()
    ctx.moveTo(W * 0.50, 0)
    ctx.bezierCurveTo(
      W * (0.47 + laharRng() * 0.06), H * 0.30,
      W * (0.43 + laharRng() * 0.08), H * 0.60,
      W * (0.37 + laharRng() * 0.08), H,
    )
    ctx.stroke()
    const ash = ctx.createRadialGradient(W * 0.4, H * 0.36, 0, W * 0.4, H * 0.36, W * 0.54)
    ash.addColorStop(0, 'rgba(208,202,192,0.58)'); ash.addColorStop(1, 'rgba(208,202,192,0)')
    ctx.fillStyle = ash; ctx.fillRect(0, 0, W, H)
  }

  // Earthquake overlays
  if (disasterType === 'EARTHQUAKE') {
    const crng = makePrng(seed + 180)
    for (let c = 0; c < 4; c++) {
      const cx = crng() * W * 0.8 + W * 0.1; const cy = crng() * H * 0.8 + H * 0.1; const cr = 22 + crng() * 28
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr)
      gr.addColorStop(0, 'rgba(36,26,12,0.68)'); gr.addColorStop(1, 'rgba(36,26,12,0)')
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill()
    }
    const crackRng = makePrng(seed + 200)
    ctx.strokeStyle = 'rgba(40,28,12,0.74)'; ctx.lineWidth = 1.5
    for (let c = 0; c < 9; c++) {
      const x1 = crackRng() * W; const y1 = crackRng() * H
      ctx.beginPath(); ctx.moveTo(x1, y1)
      ctx.lineTo(x1 + (crackRng() - 0.5) * W * 0.22, y1 + (crackRng() - 0.5) * H * 0.18); ctx.stroke()
    }
  }

  // Damaged buildings
  // Damaged buildings — sparse, clustered, no obvious cell grid
  const bldRng = makePrng(seed + 500 + 999); const cell = 42
  for (let gx = 0; gx < W; gx += cell) {
    for (let gy = 0; gy < H; gy += cell) {
      if (bldRng() < 0.68) continue   // ~32% density
      const clusterCount = 1 + (bldRng() * 3 | 0)
      for (let k = 0; k < clusterCount; k++) {
        const ox = (bldRng() * (cell - 10)) | 0
        const oy = (bldRng() * (cell - 10)) | 0
        const bw = 5 + (bldRng() * 9) | 0; const bh = 4 + (bldRng() * 7) | 0
        const destroyed = bldRng() < 0.45
        if (destroyed) {
          ctx.fillStyle = disasterType === 'FLOOD'
            ? 'rgba(10,42,76,0.68)' : disasterType === 'LANDSLIDE'
            ? 'rgba(138,130,118,0.68)' : 'rgba(75,54,32,0.68)'
          ctx.fillRect(gx + ox - 1, gy + oy - 1, bw + 2, bh + 2)
          const rubRng = makePrng(gx * 31 + gy * 17 + k)
          ctx.fillStyle = 'rgba(102,80,50,0.55)'
          for (let r = 0; r < 3; r++) {
            ctx.fillRect(gx + ox + (rubRng() * (bw + 2) - 1), gy + oy + (rubRng() * (bh + 2) - 1), 2, 2)
          }
        } else {
          ctx.fillStyle = 'rgba(104,94,78,0.58)'
          ctx.fillRect(gx + ox, gy + oy, bw, bh)
        }
      }
    }
  }

  // Thermal damage hotspots
  const dmgRng = makePrng(seed + 300)
  for (let i = 0; i < 10; i++) {
    const dx = dmgRng() * W; const dy = dmgRng() * H; const dr = 8 + dmgRng() * 18
    const gr = ctx.createRadialGradient(dx, dy, 0, dx, dy, dr)
    gr.addColorStop(0, 'rgba(220,58,28,0.64)'); gr.addColorStop(0.4, 'rgba(220,58,28,0.20)'); gr.addColorStop(1, 'rgba(220,58,28,0)')
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2); ctx.fill()
  }

  // Roads — degraded
  const roadRng = makePrng(seed + 800)
  ctx.strokeStyle = disasterType === 'FLOOD' ? 'rgba(38,54,72,0.40)' : 'rgba(66,58,44,0.44)'
  ctx.lineWidth = 1.5
  for (let ry = 24; ry < H; ry += 34 + (roadRng() * 20 | 0)) {
    ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(W, ry); ctx.stroke()
  }
  for (let rx = 24; rx < W; rx += 42 + (roadRng() * 24 | 0)) {
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx, H); ctx.stroke()
  }

  // CRT scanlines + vignette
  ctx.fillStyle = 'rgba(0,0,0,0.065)'
  for (let sl = 0; sl < H; sl += 3) ctx.fillRect(0, sl, W, 1)
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.72)
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)
}

// ── COORDINATE GRID OVERLAY ──────────────────────────────────────────────────
function drawCoordGrid(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  // Grid lines
  ctx.strokeStyle = 'rgba(0,212,255,0.08)'; ctx.lineWidth = 1
  const cols = 5; const rows = 4
  for (let i = 1; i < cols; i++) {
    const x = (W / cols) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let i = 1; i < rows; i++) {
    const y = (H / rows) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Corner registration marks
  const mark = 14; ctx.strokeStyle = 'rgba(0,212,255,0.58)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, mark); ctx.lineTo(0, 0); ctx.lineTo(mark, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W - mark, 0); ctx.lineTo(W, 0); ctx.lineTo(W, mark); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, H - mark); ctx.lineTo(0, H); ctx.lineTo(mark, H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W - mark, H); ctx.lineTo(W, H); ctx.lineTo(W, H - mark); ctx.stroke()

  // Coordinate labels
  ctx.fillStyle = 'rgba(0,212,255,0.52)'
  ctx.font = `${Math.max(9, Math.min(11, W / 90))}px monospace`
  ctx.fillText('14.2481°N  120.9331°E', 4, 12)
  ctx.fillText('14.1886°N  121.0127°E', W - 142, H - 5)
}

const TYPE_LABELS: Readonly<Record<string, string>> = {
  TYPHOON:    'Sentinel-1 SAR · Flood Extent Composite',
  LANDSLIDE:   'Sentinel-2 Optical · Terrain Shift Detection',
  EARTHQUAKE: 'Sentinel-2 / InSAR · Structural Analysis',
  FLOOD:      'Sentinel-1 SAR · Inundation Mapping',
}

export function BeforeAfterSlider({
  disasterName: _disasterName,
  disasterType,
  beforeImageUrl,
  afterImageUrl,
}: BeforeAfterSliderProps) {
  const [sliderX,     setSliderX]     = useState(50)
  const [isDragging,  setIsDragging]  = useState(false)
  const [imgError,    setImgError]    = useState(false)
  // Both real images must finish loading before they overlay the canvas
  const [imagesReady, setImagesReady] = useState(false)
  const loadedCountRef = useRef(0)

  const useRealImages = !imgError && !!beforeImageUrl && !!afterImageUrl

  const containerRef    = useRef<HTMLDivElement>(null)
  const afterCanvasRef  = useRef<HTMLCanvasElement>(null)
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null)
  const gridCanvasRef   = useRef<HTMLCanvasElement>(null)

  // Reset ready-state on disaster switch so canvas is always visible while images reload
  useEffect(() => {
    setImgError(false)
    setImagesReady(false)
    loadedCountRef.current = 0
  }, [beforeImageUrl, afterImageUrl])

  // Canvas always renders — it's the instant base layer; real images fade in on top
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const render = (): void => {
      const W = container.offsetWidth
      const H = container.offsetHeight
      if (W === 0 || H === 0) return

      const afterCanvas  = afterCanvasRef.current
      const beforeCanvas = beforeCanvasRef.current
      const gridCanvas   = gridCanvasRef.current
      if (!afterCanvas || !beforeCanvas || !gridCanvas) return

      afterCanvas.width  = W; afterCanvas.height  = H
      beforeCanvas.width = W; beforeCanvas.height = H
      gridCanvas.width   = W; gridCanvas.height   = H

      const aCtx = afterCanvas.getContext('2d')
      const bCtx = beforeCanvas.getContext('2d')
      const gCtx = gridCanvas.getContext('2d')
      if (!aCtx || !bCtx || !gCtx) return

      renderAfter(aCtx,  W, H, disasterType)
      renderBefore(bCtx, W, H, disasterType)
      drawCoordGrid(gCtx, W, H)
    }

    render()
    const ro = new ResizeObserver(render)
    ro.observe(container)
    return () => ro.disconnect()
  }, [disasterType])

  const updateSlider = useCallback((clientX: number): void => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setSliderX(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent): void => {
    e.preventDefault()
    setIsDragging(true)
    updateSlider(e.clientX)
  }, [updateSlider])

  const onTouchMove = useCallback((e: React.TouchEvent): void => {
    e.preventDefault()
    updateSlider(e.touches[0].clientX)
  }, [updateSlider])

  const onKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowLeft')  setSliderX((prev) => Math.max(0,   prev - 2))
    if (e.key === 'ArrowRight') setSliderX((prev) => Math.min(100, prev + 2))
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const move = (e: MouseEvent): void => updateSlider(e.clientX)
    const up   = (): void => setIsDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup',   up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup',   up)
    }
  }, [isDragging, updateSlider])

  const productLabel = TYPE_LABELS[disasterType] ?? TYPE_LABELS['TYPHOON']
  const handleImgError = useCallback((): void => setImgError(true), [])
  const handleImgLoad  = useCallback((): void => {
    loadedCountRef.current += 1
    if (loadedCountRef.current >= 2) setImagesReady(true)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-canvas]',
        isDragging ? 'cursor-grabbing' : 'cursor-ew-resize',
      )}
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
      onTouchEnd={() => setIsDragging(false)}
      onKeyDown={onKeyDown}
      role="slider"
      tabIndex={0}
      aria-label="Before/after comparison slider — use arrow keys to adjust"
      aria-valuenow={Math.round(sliderX)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* ── AFTER layer — canvas base always present; real image fades in on top ── */}
      <div className="absolute inset-0">
        <canvas ref={afterCanvasRef} className="w-full h-full" />
        {useRealImages && (
          <img
            src={afterImageUrl!}
            alt="Post-disaster satellite imagery"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: imagesReady ? 1 : 0 }}
            onLoad={handleImgLoad}
            onError={handleImgError}
          />
        )}
      </div>

      {/* ── BEFORE layer — canvas base always present; real image fades in on top ── */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}>
        <canvas ref={beforeCanvasRef} className="w-full h-full" />
        {useRealImages && (
          <img
            src={beforeImageUrl!}
            alt="Pre-disaster satellite imagery baseline"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: imagesReady ? 1 : 0 }}
            onLoad={handleImgLoad}
            onError={handleImgError}
          />
        )}
      </div>

      {/* Coordinate grid — shown while images are still loading or unavailable */}
      {!imagesReady && (
        <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      )}

      {/* Satellite imagery loading pill — center top, fades out when ready */}
      {useRealImages && !imagesReady && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase"
            style={{
              background:     'rgba(6,14,28,0.82)',
              border:         '1px solid rgba(0,212,255,0.30)',
              color:          'rgba(0,212,255,0.75)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: '#00d4ff', animation: 'ripple-expand 1.4s ease-out infinite' }}
            />
            Loading imagery…
          </div>
        </div>
      )}

      {/* BEFORE label — top-left */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-widest uppercase"
          style={{
            background:     'rgba(6,14,28,0.78)',
            border:         '1px solid rgba(74,222,128,0.40)',
            color:          '#4ade80',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 4px #4ade80' }} />
          BEFORE · PRE-DISASTER
        </div>
      </div>

      {/* AFTER label — top-right */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-widest uppercase"
          style={{
            background:     'rgba(6,14,28,0.78)',
            border:         '1px solid rgba(248,113,113,0.42)',
            color:          '#f87171',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171', boxShadow: '0 0 4px #f87171' }} />
          AFTER · POST-DISASTER
        </div>
      </div>

      {/* Product label — bottom-right */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
        <span
          className="text-[9px] font-mono px-2 py-0.5 rounded"
          style={{
            background:     'rgba(0,0,0,0.60)',
            color:          'rgba(0,212,255,0.68)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {productLabel}
        </span>
      </div>

      {/* Keyboard hint — bottom-left */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <span
          className="text-[8px] font-mono px-2 py-0.5 rounded"
          style={{
            background:     'rgba(0,0,0,0.55)',
            color:          'rgba(255,255,255,0.28)',
            backdropFilter: 'blur(8px)',
          }}
        >
          ← / → to scrub
        </span>
      </div>

      {/* SIMULATED watermark — shown when using procedural canvas, not real images */}
      {!imagesReady && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span
            className="text-[9px] font-mono font-bold px-3 py-1 rounded-full tracking-widest uppercase"
            style={{
              background: 'rgba(245,158,11,0.12)',
              color: 'rgba(245,158,11,0.70)',
              border: '1px solid rgba(245,158,11,0.25)',
              backdropFilter: 'blur(8px)',
            }}
          >
            SIMULATED · NOT REAL SATELLITE DATA
          </span>
        </div>
      )}

      {/* Slider divider line */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{
          left:      `${sliderX}%`,
          transform: 'translateX(-50%)',
          width:     '1.5px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.55) 8%, rgba(255,255,255,0.55) 92%, transparent 100%)',
          boxShadow:  '0 0 6px rgba(255,255,255,0.20)',
        }}
      >
        {/* Drag handle — lightweight pill */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            width:        '28px',
            height:       '28px',
            borderRadius: '50%',
            background:   'rgba(12, 15, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            border:       '1.5px solid rgba(255,255,255,0.45)',
            boxShadow:    '0 0 8px rgba(0,0,0,0.4)',
          }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M4 1L1 5L4 9M10 1L13 5L10 9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Tick marks — subtler */}
        {([0.2, 0.4, 0.6, 0.8] as const).map((pos) => (
          <div
            key={pos}
            className="absolute left-1/2"
            style={{
              top:       `${pos * 100}%`,
              width:     '6px',
              height:    '1px',
              background: 'rgba(255,255,255,0.25)',
              transform:  'translateX(-50%)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
