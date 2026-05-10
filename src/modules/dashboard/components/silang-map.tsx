import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet'
import { DamageAssessmentDto } from '@/core/types/assessment.types'
import { BarangayDto } from '@/core/types/barangay.types'
import { damageLevelToColor } from '@/shared/utils/damage-colors'
import type { DamageLevel } from '@/core/types/assessment.types'

/* Silang, Cavite center */
const CENTER: [number, number] = [14.2183, 120.9729]
const ZOOM = 12

/* ── Map tile styles (Streets default — most readable for non-technical viewers) */
const MAP_STYLES = [
  { id: 'streets',   label: 'Streets',   url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' },
  { id: 'satellite', label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
] as const

type MapStyleId = typeof MAP_STYLES[number]['id']

const DAMAGE_LABEL: Record<string, string> = {
  UNDAMAGED: 'No Damage',
  MINOR:     'Minor Damage',
  MAJOR:     'Major Damage',
  DESTROYED: 'Destroyed', // kept for type-completeness; collapsed to MAJOR for display
}

/* Dashboard collapses DESTROYED into MAJOR for display only — type system stays 4-tier */
const displayLevel = (lvl: DamageLevel): DamageLevel => (lvl === 'DESTROYED' ? 'MAJOR' : lvl)

/* ── Map recenter helper (auto-pan on disaster change) */
function MapRecenter({ lat, lng, zoom }: { readonly lat: number; readonly lng: number; readonly zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], zoom) }, [lat, lng, zoom, map])
  return null
}

/* ── Recenter button — top-right floating control */
function RecenterButton() {
  const map = useMap()
  return (
    <button
      type="button"
      onClick={() => map.setView(CENTER, ZOOM)}
      className="leaflet-control-recenter"
      aria-label="Recenter map on Silang"
      title="Recenter map on Silang"
    >
      <span aria-hidden="true">⌖</span>
      <span>Recenter</span>
    </button>
  )
}

/* ── Popup content (simplified — bigger fonts, solid bar, same data) */
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
    <div style={{ width: 280, fontFamily: "'Inter', sans-serif", color: '#eef2ff' }}>
      {/* Colored top accent bar */}
      <div style={{ height: 3, borderRadius: '12px 12px 0 0', background: damageColor }} />

      <div style={{ padding: '14px 16px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#eef2ff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {barangay.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              background: `${damageColor}18`, border: `1px solid ${damageColor}35`, color: damageColor,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: damageColor, display: 'inline-block' }} />
              {damageLabel}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
              {barangay.riskLevel}
            </span>
          </div>
        </div>

        {assessment ? (
          <>
            {/* Damage progress bar — solid, bigger */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Damage Level</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: damageColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {assessment.damagePercent.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: '#1c2540', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${assessment.damagePercent}%`,
                  background: damageColor,
                }} />
              </div>
            </div>

            {/* Stats grid — 2x2, bigger numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Structures',    value: `${assessment.structuresAffected}`,                  sub: `/ ${assessment.structuresAssessed}`, color: '#eef2ff' },
                { label: 'Population',    value: assessment.populationAffected.toLocaleString(),      sub: '',                                   color: '#eef2ff' },
                { label: 'AI Confidence', value: `${(assessment.aiConfidence * 100).toFixed(0)}%`,    sub: '',                                   color: '#22c55e' },
                { label: 'Coordinates',   value: `${barangay.latitude.toFixed(3)}°`,                  sub: `${barangay.longitude.toFixed(3)}°`,  color: '#94a3b8' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
                    {stat.value}
                    {stat.sub && <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b', marginLeft: 3 }}>{stat.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            padding: '14px', borderRadius: 8, textAlign: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#94a3b8', fontSize: 13,
          }}>
            No assessment data available
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main map component ────────────────────────────────────────── */
interface SilangMapProps {
  readonly barangays: ReadonlyArray<BarangayDto>
  readonly assessments: ReadonlyArray<DamageAssessmentDto>
  readonly isLoading: boolean
}

export function SilangMap({ barangays, assessments, isLoading }: SilangMapProps) {
  const [mapStyle, setMapStyle] = useState<MapStyleId>('streets')
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
        className="w-full h-full rounded-lg"
        style={{ background: '#0a0e1a' }}
        zoomControl={true}
        scrollWheelZoom={true}
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
          const hasData = !!assessment
          const effectiveLevel = assessment ? displayLevel(assessment.damageLevel) : null
          const damageColor = effectiveLevel ? damageLevelToColor(effectiveLevel) : '#4a5568'
          const damageLabel = effectiveLevel ? (DAMAGE_LABEL[effectiveLevel] ?? effectiveLevel) : 'No Data'
          const radius = hasData ? 14 + Math.round((assessment.damagePercent / 100) * 8) : 10

          return (
            <CircleMarker
              key={b.id}
              center={[b.latitude, b.longitude]}
              radius={radius}
              pathOptions={{
                color:       damageColor,
                fillColor:   damageColor,
                fillOpacity: 0.85,
                weight:      2,
                dashArray:   hasData ? undefined : '4 3',
              }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1} sticky>
                <strong>{b.name}</strong>
                <span style={{ marginLeft: 6, color: damageColor }}>· {damageLabel}</span>
              </Tooltip>
              <Popup>
                <PinPopupContent
                  barangay={b}
                  assessment={assessment}
                  damageColor={damageColor}
                  damageLabel={damageLabel}
                />
              </Popup>
            </CircleMarker>
          )
        })}

        <RecenterButton />
      </MapContainer>

      {/* ── Map style switcher (Streets / Satellite) ── */}
      <div
        className="absolute bottom-4 right-4 z-[500] flex gap-1 rounded-lg p-1"
        style={{
          background: 'rgba(12, 15, 26, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)',
        }}
      >
        {MAP_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setMapStyle(style.id)}
            className="px-3.5 py-2 rounded-md text-xs font-medium transition-all duration-150"
            style={{
              background: mapStyle === style.id ? 'rgba(0,212,255,0.14)' : 'transparent',
              color:      mapStyle === style.id ? '#00d4ff' : 'var(--color-text-secondary)',
              border:     mapStyle === style.id ? '1px solid rgba(0,212,255,0.30)' : '1px solid transparent',
            }}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  )
}
