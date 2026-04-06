import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'

/* ── Wireframe globe with Philippines highlight ───────────────── */

const GLOBE_RADIUS = 1.6
const GRID_SEGMENTS = 24

/** Lat/lon of Silang, Cavite in radians */
const SILANG_LAT = (14.2183 / 180) * Math.PI
const SILANG_LON = (120.9729 / 180) * Math.PI

/** Convert lat/lon to 3D position on sphere */
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon),
  )
}

function WireframeGlobe(): JSX.Element {
  const globeRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!globeRef.current) return
    globeRef.current.rotation.y += delta * 0.06
  })

  /* Philippines approximate outline points (simplified) */
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
    <group ref={globeRef} rotation={[0.1, -SILANG_LON + 0.3, 0]}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, GRID_SEGMENTS, GRID_SEGMENTS]} />
        <meshStandardMaterial
          color="#00d4ff"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Solid dark inner sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.99, 32, 32]} />
        <meshStandardMaterial color="#0c0f1a" />
      </mesh>

      {/* Latitude lines with accent */}
      {[-30, -15, 0, 15, 30, 45, 60].map((lat) => (
        <mesh key={`lat-${lat}`} rotation={[0, 0, 0]} position={[0, GLOBE_RADIUS * Math.sin(lat * Math.PI / 180), 0]}>
          <ringGeometry args={[
            GLOBE_RADIUS * Math.cos(lat * Math.PI / 180) - 0.002,
            GLOBE_RADIUS * Math.cos(lat * Math.PI / 180) + 0.002,
            64,
          ]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={lat === 15 ? 0.15 : 0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Philippines highlight line */}
      <Line points={phPoints} color="#00d4ff" transparent opacity={0.5} lineWidth={1.5} />

      {/* Silang marker — pulsing dot */}
      <Float speed={2} floatIntensity={0.05}>
        <mesh position={silangPos}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      </Float>

      {/* Silang glow ring */}
      <mesh position={silangPos} rotation={[silangPos.x > 0 ? -0.2 : 0.2, 0.3, 0]}>
        <ringGeometry args={[0.06, 0.08, 24]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Hazard type indicator pins */}
      {[
        { lat: 14.8, lon: 120.5, color: '#7c3aed' },  // Typhoon
        { lat: 13.8, lon: 121.2, color: '#0284c7' },  // Flood
        { lat: 14.5, lon: 121.5, color: '#b45309' },  // Earthquake
        { lat: 14.0, lon: 120.8, color: '#78716c' },  // Landslide
      ].map((pin, pinIndex) => {
        const pinPos = latLonToVec3(pin.lat * Math.PI / 180, pin.lon * Math.PI / 180, GLOBE_RADIUS * 1.015)
        return (
          <mesh key={pinIndex} position={pinPos}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial
              color={pin.color}
              emissive={pin.color}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/* ── Exported scene ───────────────────────────────────────────── */
export function GlobeScene(): JSX.Element {
  return (
    <div className="w-full h-[320px] lg:h-[380px]">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <directionalLight position={[5, 3, 5]} intensity={0.6} color="#eef2ff" />
          <pointLight position={[-3, -2, 4]} intensity={0.3} color="#00d4ff" distance={10} />

          <WireframeGlobe />
        </Suspense>
      </Canvas>
    </div>
  )
}
