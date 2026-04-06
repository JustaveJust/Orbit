import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Group } from 'three'
import * as THREE from 'three'

const GLOBE_RADIUS = 1.6
const GRID_SEGMENTS = 24
/* Camera is zoomed in closer + globe rotated so Philippines fills ~40% of view */

const SILANG_LAT = (14.2183 / 180) * Math.PI
const SILANG_LON = (120.9729 / 180) * Math.PI

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon),
  )
}

const HAZARD_PINS = [
  { lat: 17.5, lon: 120.0, color: '#7c3aed', label: 'Typhoon',    desc: 'Wind & rain damage' },
  { lat: 11.0, lon: 123.5, color: '#0284c7', label: 'Flood',       desc: 'Inundation zones' },
  { lat: 7.0,  lon: 126.5, color: '#b45309', label: 'Earthquake',  desc: 'Structural damage' },
  { lat: 13.0, lon: 118.5, color: '#78716c', label: 'Landslide',   desc: 'Terrain shift' },
] as const

/* ── Interactive pin ──────────────────────────────────────────── */
function HazardPin({ lat, lon, color, label, desc }: typeof HAZARD_PINS[number]): JSX.Element {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const pinPos = useMemo(() => latLonToVec3(lat * Math.PI / 180, lon * Math.PI / 180, GLOBE_RADIUS * 1.005), [lat, lon])
  const stalkEnd = useMemo(() => latLonToVec3(lat * Math.PI / 180, lon * Math.PI / 180, GLOBE_RADIUS * 1.06), [lat, lon])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const target = hovered ? 1.6 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 1 - Math.pow(0.001, delta))
  })

  /* Build a simple line geometry manually to avoid drei Line issues */
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array([
      pinPos.x, pinPos.y, pinPos.z,
      stalkEnd.x, stalkEnd.y, stalkEnd.z,
    ])
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [pinPos, stalkEnd])

  return (
    <group>
      {/* Stalk line */}
      {useMemo(() => {
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 })
        const lineObj = new THREE.LineSegments(lineGeo, mat)
        return <primitive object={lineObj} />
      }, [lineGeo, color])}

      {/* Pin base dot on surface */}
      <mesh position={pinPos}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>

      {/* Pin head sphere */}
      <mesh
        ref={meshRef}
        position={stalkEnd}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshStandardMaterial
          color={color} emissive={color}
          emissiveIntensity={hovered ? 4 : 2}
          toneMapped={false}
        />
      </mesh>

      {/* HTML tooltip on hover */}
      {hovered && (
        <Html position={stalkEnd} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(12,15,26,0.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${color}50`,
              borderRadius: 8,
              padding: '6px 10px',
              whiteSpace: 'nowrap',
              transform: 'translateY(-30px)',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
              {label}
            </div>
            <div style={{ fontSize: 8, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>
              {desc}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

/* ── Atmosphere glow ──────────────────────────────────────────── */
function AtmosphereGlow(): JSX.Element {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 1.12, 32, 32]} />
      <meshStandardMaterial
        color="#00d4ff"
        transparent
        opacity={0.035}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

/* ── Manual OrbitControls (avoids drei version crash) ─────────── */
function GlobeControls({ onDragStart, onDragEnd }: { readonly onDragStart: () => void; readonly onDragEnd: () => void }): null {
  const { camera, gl } = useThree()
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enableZoom = true
    controls.enablePan = false
    controls.minDistance = 2.2
    controls.maxDistance = 5.5
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.addEventListener('start', onDragStart)
    controls.addEventListener('end', onDragEnd)

    const animate = (): void => { controls.update(); requestAnimationFrame(animate) }
    const frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      controls.removeEventListener('start', onDragStart)
      controls.removeEventListener('end', onDragEnd)
      controls.dispose()
    }
  }, [camera, gl, onDragStart, onDragEnd])
  return null
}

/* ── Globe with interaction ───────────────────────────────────── */
function WireframeGlobe(): JSX.Element {
  const globeRef = useRef<Group>(null)
  const [isDragging, setIsDragging] = useState(false)

  useFrame((_, delta) => {
    if (!globeRef.current || isDragging) return
    globeRef.current.rotation.y += delta * 0.06
  })

  const phPoints = useMemo((): [number, number, number][] => {
    const coords = [
      [18.5, 120.5], [17.0, 121.5], [16.0, 120.8], [15.0, 121.2],
      [14.5, 121.0], [14.0, 120.5], [13.5, 121.5],
      [11.5, 123.0], [10.5, 124.0],
      [8.0, 126.0], [7.0, 125.0], [6.5, 126.5],
    ] as const
    return coords.map(([lat, lon]) => {
      const v = latLonToVec3(lat * Math.PI / 180, lon * Math.PI / 180, GLOBE_RADIUS * 1.002)
      return [v.x, v.y, v.z]
    })
  }, [])

  const silangPos = useMemo(() => latLonToVec3(SILANG_LAT, SILANG_LON, GLOBE_RADIUS * 1.01), [])

  return (
    <>
      <group ref={globeRef} rotation={[0.05, -SILANG_LON + 0.15, 0]}>
        {/* Wireframe sphere */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, GRID_SEGMENTS, GRID_SEGMENTS]} />
          <meshStandardMaterial color="#00d4ff" wireframe transparent opacity={0.06} />
        </mesh>

        {/* Inner dark sphere */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS * 0.99, 32, 32]} />
          <meshStandardMaterial color="#0c0f1a" />
        </mesh>

        {/* Latitude lines */}
        {[-30, -15, 0, 15, 30, 45, 60].map((lat) => (
          <mesh key={`lat-${lat}`} position={[0, GLOBE_RADIUS * Math.sin(lat * Math.PI / 180), 0]}>
            <ringGeometry args={[
              GLOBE_RADIUS * Math.cos(lat * Math.PI / 180) - 0.002,
              GLOBE_RADIUS * Math.cos(lat * Math.PI / 180) + 0.002, 64,
            ]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={lat === 15 ? 0.15 : 0.04} side={THREE.DoubleSide} />
          </mesh>
        ))}

        {/* Philippines outline */}
        {useMemo(() => {
          const geo = new THREE.BufferGeometry()
          const flat = new Float32Array(phPoints.flat())
          geo.setAttribute('position', new THREE.BufferAttribute(flat, 3))
          const mat = new THREE.LineBasicMaterial({ color: '#00d4ff', transparent: true, opacity: 0.5 })
          const lineObj = new THREE.Line(geo, mat)
          return <primitive object={lineObj} />
        }, [phPoints])}

        {/* Silang marker */}
        <Float speed={2} floatIntensity={0.02}>
          <mesh position={silangPos}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3} toneMapped={false} />
          </mesh>
        </Float>

        {/* Silang glow halo */}
        <mesh position={silangPos}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.5}
            transparent opacity={0.15} toneMapped={false}
          />
        </mesh>

        {/* Silang label */}
        <Html position={[silangPos.x, silangPos.y + 0.08, silangPos.z]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontSize: 7, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            color: '#00d4ff', textShadow: '0 0 6px rgba(0,212,255,0.5)',
            whiteSpace: 'nowrap', letterSpacing: '0.1em',
          }}>
            SILANG
          </div>
        </Html>

        {/* Hazard pins */}
        {HAZARD_PINS.map((pin) => (
          <HazardPin key={pin.label} {...pin} />
        ))}

        <AtmosphereGlow />
      </group>

      <GlobeControls onDragStart={() => setIsDragging(true)} onDragEnd={() => setIsDragging(false)} />
    </>
  )
}

/* ── Exported scene ───────────────────────────────────────────── */
export function GlobeScene(): JSX.Element {
  return (
    <div className="w-full h-[320px] lg:h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.3, 2.8], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.12} />
          <directionalLight position={[5, 3, 5]} intensity={0.6} color="#eef2ff" />
          <pointLight position={[-3, -2, 4]} intensity={0.3} color="#00d4ff" distance={10} />

          <WireframeGlobe />
        </Suspense>
      </Canvas>
    </div>
  )
}
