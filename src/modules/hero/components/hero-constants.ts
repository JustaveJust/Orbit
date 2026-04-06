import { Satellite, Zap, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ── Shared constants for hero page ─────────────────────────────── */

export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id:       i,
  x:        Math.random() * 100,
  y:        Math.random() * 100,
  size:     0.5 + Math.random() * 2.2,
  duration: 10 + Math.random() * 16,
  delay:    Math.random() * 12,
  opacity:  0.08 + Math.random() * 0.22,
  dx1:      (Math.random() - 0.5) * 22,
  dy1:      -(Math.random() * 18 + 5),
  dx2:      (Math.random() - 0.5) * 18,
  dy2:      -(Math.random() * 12 + 3),
  color:    i % 9 === 0 ? '#7c3aed' : i % 5 === 0 ? '#22c55e' : '#00d4ff',
}))

export const HERO_STATS = [
  { value: '4',     label: 'Hazard Types', color: '#00d4ff' },
  { value: 'AI',    label: 'Deep Learning', color: '#7c3aed' },
  { value: 'GIS',   label: 'Web Platform',  color: '#22c55e' },
  { value: 'SAR',   label: 'Sentinel-1/2',  color: '#f59e0b' },
] as const

export interface PipelineStep {
  readonly step: string
  readonly icon: LucideIcon
  readonly title: string
  readonly color: string
  readonly desc: string
}

export const PIPELINE_STEPS: readonly PipelineStep[] = [
  {
    step:  '01',
    icon:  Satellite,
    title: 'Satellite Acquisition',
    color: '#00d4ff',
    desc:  'Pre/post-disaster Sentinel-1 SAR and Sentinel-2 optical imagery from Copernicus Open Access Hub.',
  },
  {
    step:  '02',
    icon:  Zap,
    title: 'AI Deep Learning',
    color: '#7c3aed',
    desc:  'CNN/U-Net architectures trained on the xBD dataset for building-level damage segmentation.',
  },
  {
    step:  '03',
    icon:  BarChart3,
    title: 'Damage Reporting',
    color: '#22c55e',
    desc:  'Web-based GIS dashboards with damage maps, severity overlays, and downloadable reports for LGUs.',
  },
] as const

export interface DisasterType {
  readonly label: string
  readonly color: string
  readonly icon: LucideIcon
  readonly count: string
}

export const DISASTER_COVERAGE: readonly DisasterType[] = [
  { label: 'TYPHOON',    color: '#7c3aed', icon: Satellite, count: 'Wind & rain' },
  { label: 'FLOOD',      color: '#0284c7', icon: Satellite,  count: 'Inundation' },
  { label: 'EARTHQUAKE', color: '#b45309', icon: BarChart3,  count: 'Structural'  },
  { label: 'LANDSLIDE',  color: '#78716c', icon: Zap,       count: 'Terrain shift' },
] as const

export const ORBITS = [
  { rx: 178, ry: 59, angle: -20, speed: 8,  dotSize: 3, color: '#00d4ff', opacity: 0.8 },
  { rx: 222, ry: 80, angle:  15, speed: 12, dotSize: 2, color: '#7c3aed', opacity: 0.6 },
  { rx: 146, ry: 51, angle:  42, speed:  6, dotSize: 2, color: '#22c55e', opacity: 0.5 },
] as const
