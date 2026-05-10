import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { DamageAssessmentDto } from '@/core/types/assessment.types'
import { BarangayDto } from '@/core/types/barangay.types'
import { damageLevelToColor } from '@/shared/utils/damage-colors'
import type { DamageLevel } from '@/core/types/assessment.types'

/* Silang, Cavite center */
const CENTER: [number, number] = [14.2183, 120.9729]
const ZOOM = 12

/* ── Map tile styles ──────────────────────────────────────────── */
const MAP_STYLES = [
  { id: 'dark',      label: 'Dark',      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'satellite', label: 'Satellite',  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id: 'topo',      label: 'Topo',       url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  { id: 'streets',   label: 'Streets',    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' },
  { id: 'dark-mat',  label: 'Dark Matter', url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png' },
] as const

type MapStyleId = typeof MAP_STYLES[number]['id']

const DAMAGE_LABEL: Record<string, string> = {
  UNDAMAGED: 'No Damage',
  MINOR:     'Minor Damage',
  MAJOR:     'Major Damage',
  DESTROYED: 'Major Damage', // collapsed to MAJOR for display via displayLevel()
}

/* Dashboard collapses DESTROYED into MAJOR for display only — type system stays 4-tier */
const displayLevel = (lvl: DamageLevel): DamageLevel => (lvl === 'DESTROYED' ? 'MAJOR' : lvl)

/* ── Unique ID for SVG gradient defs (avoids ID collision across 64 pins) */
let pinUid = 0

/* ── Creative 3D-style SVG pin factory ────────────────────────── */
function createPinIcon(
  color: string,
  damageLevel: DamageLevel | null,
  damagePercent: number,
): L.DivIcon {
  const uid = ++pinUid
  const hasData = damageLevel !== null

  /* Size scales with severity */
  const SIZE = hasData ? 44 + Math.round((damagePercent / 100) * 12) : 28
  const CX = SIZE / 2
  const CY = SIZE / 2
  const R = SIZE / 2 - 4

  /* Lighter shade for 3D highlight */
  const lightColor = color + 'cc'

  /* Each damage level gets a unique pin shape */
  const shapeMap: Record<DamageLevel, () => string> = {
    /* UNDAMAGED — shield / checkmark motif */
    UNDAMAGED: () => `
      <path d="${shieldPath(CX, CY, R)}" fill="url(#g${uid})" stroke="${color}" stroke-width="1.5"/>
      <path d="${shieldPath(CX, CY, R * 0.7)}" fill="none" stroke="${color}" stroke-width="0.6" opacity="0.3"/>
      <polyline points="${CX - R * 0.25},${CY} ${CX - R * 0.05},${CY + R * 0.2} ${CX + R * 0.3},${CY - R * 0.2}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    /* MINOR — diamond with caution dot */
    MINOR: () => `
      <rect x="${CX - R * 0.7}" y="${CY - R * 0.7}" width="${R * 1.4}" height="${R * 1.4}" rx="3" transform="rotate(45 ${CX} ${CY})" fill="url(#g${uid})" stroke="${color}" stroke-width="1.5"/>
      <circle cx="${CX}" cy="${CY - R * 0.1}" r="${R * 0.15}" fill="${color}"/>
      <rect x="${CX - 1}" y="${CY + R * 0.05}" width="2" height="${R * 0.3}" rx="1" fill="${color}"/>
    `,
    /* MAJOR — hexagon with warning triangle */
    MAJOR: () => `
      <polygon points="${hexPoints(CX, CY, R)}" fill="url(#g${uid})" stroke="${color}" stroke-width="1.8"/>
      <polygon points="${hexPoints(CX, CY, R * 0.6)}" fill="none" stroke="${color}" stroke-width="0.6" opacity="0.25"/>
      <polygon points="${CX},${CY - R * 0.32} ${CX - R * 0.25},${CY + R * 0.18} ${CX + R * 0.25},${CY + R * 0.18}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="${CX}" cy="${CY + R * 0.08}" r="1.5" fill="${color}"/>
      <rect x="${CX - 1}" y="${CY - R * 0.18}" width="2" height="${R * 0.2}" rx="1" fill="${color}"/>
    `,
    /* DESTROYED — kept for type-completeness; collapsed to MAJOR for display via displayLevel() */
    DESTROYED: () => `
      <polygon points="${burstPoints(CX, CY, R, R * 0.6, 8)}" fill="url(#g${uid})" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="${burstPoints(CX, CY, R * 0.5, R * 0.35, 8)}" fill="none" stroke="${color}" stroke-width="0.6" opacity="0.3"/>
      <line x1="${CX - R * 0.2}" y1="${CY - R * 0.2}" x2="${CX + R * 0.2}" y2="${CY + R * 0.2}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="${CX + R * 0.2}" y1="${CY - R * 0.2}" x2="${CX - R * 0.2}" y2="${CY + R * 0.2}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    `,
  }

  /* Pulse rings for MAJOR/DESTROYED */
  const isHighSeverity = damageLevel === 'DESTROYED' || damageLevel === 'MAJOR'
  const pulseRings = isHighSeverity ? `
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${color}" stroke-width="1" opacity="0.4">
      <animate attributeName="r" values="${R};${R + 12};${R}" dur="2.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.2">
      <animate attributeName="r" values="${R};${R + 18};${R}" dur="2.2s" repeatCount="indefinite" begin="0.7s"/>
      <animate attributeName="opacity" values="0.2;0;0.2" dur="2.2s" repeatCount="indefinite" begin="0.7s"/>
    </circle>
  ` : ''

  /* Ground shadow (3D effect) */
  const shadow = hasData ? `
    <ellipse cx="${CX}" cy="${CY + R + 3}" rx="${R * 0.6}" ry="2.5" fill="${color}" opacity="0.15">
      ${isHighSeverity ? `<animate attributeName="rx" values="${R * 0.6};${R * 0.75};${R * 0.6}" dur="2.2s" repeatCount="indefinite"/>` : ''}
    </ellipse>
  ` : ''

  /* No-data pin — simple translucent dot */
  const noDataSvg = `
    <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${CX}" cy="${CY}" r="${R * 0.5}" fill="${color}20" stroke="${color}" stroke-width="0.8" stroke-dasharray="2 2"/>
      <circle cx="${CX}" cy="${CY}" r="2" fill="${color}" opacity="0.5"/>
    </svg>
  `

  if (!hasData || !damageLevel) {
    return L.divIcon({
      html: noDataSvg,
      className: '',
      iconSize: [SIZE, SIZE],
      iconAnchor: [CX, CY],
      popupAnchor: [0, -CY],
    })
  }

  const totalSize = SIZE + 24
  const offset = 12
  const svgCX = CX + offset
  const svgCY = CY + offset

  const svg = `
    <svg width="${totalSize}" height="${totalSize + 8}" viewBox="${-offset} ${-offset} ${totalSize} ${totalSize + 8}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g${uid}" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="${lightColor}" stop-opacity="0.25"/>
          <stop offset="50%" stop-color="${color}" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.04"/>
        </radialGradient>
        <filter id="glow${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${shadow}
      ${pulseRings}
      <g filter="url(#glow${uid})">
        ${shapeMap[damageLevel]()}
      </g>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [totalSize, totalSize + 8],
    iconAnchor: [totalSize / 2, totalSize / 2],
    popupAnchor: [0, -(totalSize / 2)],
  })
}

/* ── Shape generators ─────────────────────────────────────────── */

/** Shield path (rounded top, pointed bottom) */
function shieldPath(cx: number, cy: number, r: number): string {
  const top = cy - r
  const bot = cy + r * 0.85
  const left = cx - r * 0.75
  const right = cx + r * 0.75
  return `M${cx},${top} Q${right + r * 0.15},${top} ${right},${cy - r * 0.1} Q${right - r * 0.05},${cy + r * 0.3} ${cx},${bot} Q${left + r * 0.05},${cy + r * 0.3} ${left},${cy - r * 0.1} Q${left - r * 0.15},${top} ${cx},${top}Z`
}

/** Regular hexagon points */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

/** Starburst / explosion points (alternating inner/outer radii) */
function burstPoints(cx: number, cy: number, outerR: number, innerR: number, spikes: number): string {
  const points: string[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return points.join(' ')
}

/* ── No-data pin (small gray dashed circle) ───────────────────── */
const NO_DATA_ICON = createPinIcon('#4a5568', null, 0)

/* ── Map recenter helper ──────────────────────────────────────── */
function MapRecenter({ lat, lng, zoom }: { readonly lat: number; readonly lng: number; readonly zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], zoom) }, [lat, lng, zoom, map])
  return null
}

/* ── Popup content component ──────────────────────────────────── */
function PinPopupContent({
  barangay,
  assessment,
  damageColor,
  damageLabel,
}: {
  readonly barangay: BarangayDto
  readonly assessment: DamageAssessmentDto | undefined
  readonly damageColor: string
  readonly damageLabel: string
}) {
  return (
    <div style={{ width: 260, fontFamily: "'Inter', sans-serif", color: '#eef2ff' }}>
      {/* Colored top accent bar */}
      <div style={{ height: 3, borderRadius: '12px 12px 0 0', background: `linear-gradient(90deg, transparent, ${damageColor}, transparent)` }} />

      <div style={{ padding: '14px 16px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#eef2ff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {barangay.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              background: `${damageColor}18`, border: `1px solid ${damageColor}35`, color: damageColor,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: damageColor, display: 'inline-block' }} />
              {damageLabel}
            </span>
            <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
              {barangay.riskLevel}
            </span>
          </div>
        </div>

        {assessment ? (
          <>
            {/* Damage progress bar — full width, prominent */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Damage Level</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: damageColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {assessment.damagePercent.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#1c2540', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${assessment.damagePercent}%`,
                  background: `linear-gradient(90deg, ${damageColor}cc, ${damageColor})`,
                  boxShadow: `0 0 8px ${damageColor}50`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Stats grid — 2x2, bigger numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Structures', value: `${assessment.structuresAffected}`, sub: `/ ${assessment.structuresAssessed}`, color: '#eef2ff' },
                { label: 'Population', value: assessment.populationAffected.toLocaleString(), sub: '', color: '#eef2ff' },
                { label: 'AI Confidence', value: `${(assessment.aiConfidence * 100).toFixed(0)}%`, sub: '', color: '#22c55e' },
                { label: 'Coordinates', value: `${barangay.latitude.toFixed(3)}°`, sub: `${barangay.longitude.toFixed(3)}°`, color: '#64748b' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
                    {stat.value}
                    {stat.sub && <span style={{ fontSize: 10, fontWeight: 400, color: '#4b5670', marginLeft: 2 }}>{stat.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            padding: '12px', borderRadius: 8, textAlign: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#4b5670', fontSize: 12,
          }}>
            No assessment data available
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main map component ───────────────────────────────────────── */
interface SilangMapProps {
  readonly barangays: ReadonlyArray<BarangayDto>
  readonly assessments: ReadonlyArray<DamageAssessmentDto>
  readonly isLoading: boolean
}

export function SilangMap({ barangays, assessments, isLoading }: SilangMapProps) {
  const [mapStyle, setMapStyle] = useState<MapStyleId>('dark')
  const activeStyle = MAP_STYLES.find((s) => s.id === mapStyle) ?? MAP_STYLES[0]
  const assessmentMap = new Map(assessments.map((a) => [a.barangayId, a]))

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[--color-surface] flex items-center justify-center rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[--color-accent] border-t-transparent animate-spin" />
          <p className="text-[--color-text-muted] font-mono text-xs">Loading satellite data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
    <MapContainer
      center={CENTER}
      zoom={ZOOM}
      className={`w-full h-full rounded-lg ${mapStyle === 'dark' || mapStyle === 'dark-mat' ? 'map-dark' : ''}`}
      style={{ background: '#0a0e1a' }}
      zoomControl={true}
      scrollWheelZoom={true}
      doubleClickZoom={false}
      dragging={true}
      touchZoom={true}
      inertia={true}
      keyboard={true}
    >
      <MapRecenter lat={CENTER[0]} lng={CENTER[1]} zoom={ZOOM} />

      <TileLayer
        key={activeStyle.id}
        url={activeStyle.url}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />

      {barangays.map((b) => {
        const assessment = assessmentMap.get(b.id)
        const effectiveLevel = assessment ? displayLevel(assessment.damageLevel) : null
        const damageColor = effectiveLevel ? damageLevelToColor(effectiveLevel) : '#4a5568'
        const damageLabel = effectiveLevel ? (DAMAGE_LABEL[effectiveLevel] ?? effectiveLevel) : 'No Data'

        const icon = assessment
          ? createPinIcon(damageColor, effectiveLevel, assessment.damagePercent)
          : NO_DATA_ICON

        return (
          <Marker
            key={b.id}
            position={[b.latitude, b.longitude]}
            icon={icon}
          >
            <Popup>
              <PinPopupContent
                barangay={b}
                assessment={assessment}
                damageColor={damageColor}
                damageLabel={damageLabel}
              />
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>

      {/* ── Map style switcher ── */}
      <div
        className="absolute bottom-4 right-4 z-[500] flex gap-1 rounded-lg p-1"
        style={{
          background: 'rgba(12, 15, 26, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)',
        }}
      >
        {MAP_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setMapStyle(style.id)}
            className="px-2.5 py-1.5 rounded-md text-[10px] font-mono font-medium transition-all duration-150"
            style={{
              background: mapStyle === style.id ? 'rgba(0,212,255,0.12)' : 'transparent',
              color: mapStyle === style.id ? '#00d4ff' : 'var(--color-text-muted)',
              border: mapStyle === style.id ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
            }}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  )
}
