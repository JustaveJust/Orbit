import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import type { Group, Mesh } from 'three'

/* ── Procedural low-poly satellite ────────────────────────────── */
function SatelliteModel(): JSX.Element {
  const groupRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.15
    groupRef.current.rotation.x += delta * 0.05
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef} scale={0.7}>
        {/* Main body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.8]} />
          <meshStandardMaterial
            color="#101524"
            metalness={0.8}
            roughness={0.3}
            emissive="#00d4ff"
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Solar panel left */}
        <group position={[-1.2, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.04, 0.7]} />
            <meshStandardMaterial
              color="#0a2a5c"
              metalness={0.6}
              roughness={0.2}
              emissive="#00d4ff"
              emissiveIntensity={0.12}
            />
          </mesh>
          {/* Panel grid lines */}
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[1.18, 0.005, 0.68]} />
            <meshStandardMaterial
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={0.3}
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>

        {/* Solar panel right */}
        <group position={[1.2, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.04, 0.7]} />
            <meshStandardMaterial
              color="#0a2a5c"
              metalness={0.6}
              roughness={0.2}
              emissive="#00d4ff"
              emissiveIntensity={0.12}
            />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[1.18, 0.005, 0.68]} />
            <meshStandardMaterial
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={0.3}
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>

        {/* Panel struts */}
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[0.4, 0.06, 0.06]} />
          <meshStandardMaterial color="#1c2540" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.4, 0.06, 0.06]} />
          <meshStandardMaterial color="#1c2540" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Antenna dish */}
        <mesh position={[0, 0.35, 0.2]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.12, 0.06, 8]} />
          <meshStandardMaterial
            color="#161d30"
            metalness={0.7}
            roughness={0.3}
            emissive="#7c3aed"
            emissiveIntensity={0.1}
          />
        </mesh>

        {/* Antenna rod */}
        <mesh position={[0, 0.42, 0.2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 6]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
        </mesh>

        {/* Signal indicator light */}
        <mesh position={[0, -0.28, 0.35]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  )
}

/* ── Orbit ring particles ─────────────────────────────────────── */
function OrbitRings(): JSX.Element {
  const ringRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!ringRef.current) return
    ringRef.current.rotation.z += delta * 0.08
  })

  return (
    <group ref={ringRef}>
      {[1.8, 2.4, 3.0].map((radius, ringIndex) => (
        <mesh key={ringIndex} rotation={[Math.PI / 2 + ringIndex * 0.15, ringIndex * 0.3, 0]}>
          <torusGeometry args={[radius, 0.003, 8, 80]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.15 - ringIndex * 0.03}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ── Floating debris / data particles ─────────────────────────── */
function DataParticles(): JSX.Element {
  const meshRef = useRef<Mesh>(null)
  const positions = useMemo(() => {
    const pos: [number, number, number][] = []
    for (let i = 0; i < 30; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 2 + Math.random() * 2
      pos.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ])
    }
    return pos
  }, [])

  return (
    <group>
      {positions.map((pos, particleIndex) => (
        <Float
          key={particleIndex}
          speed={0.5 + Math.random()}
          floatIntensity={0.3}
          rotationIntensity={0.1}
        >
          <mesh position={pos}>
            <boxGeometry args={[0.03, 0.03, 0.03]} />
            <meshStandardMaterial
              color={particleIndex % 3 === 0 ? '#7c3aed' : '#00d4ff'}
              emissive={particleIndex % 3 === 0 ? '#7c3aed' : '#00d4ff'}
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

/* ── Exported scene ───────────────────────────────────────────── */
export function SatelliteScene(): JSX.Element {
  return (
    <div className="absolute inset-0 z-[3] pointer-events-none hidden md:block">
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} color="#eef2ff" />
          <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#00d4ff" />
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#00d4ff" distance={8} />

          <SatelliteModel />
          <OrbitRings />
          <DataParticles />
        </Suspense>
      </Canvas>
    </div>
  )
}
