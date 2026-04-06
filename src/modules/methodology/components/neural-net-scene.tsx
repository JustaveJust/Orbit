import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import type { Group, BufferAttribute } from 'three'
import * as THREE from 'three'

/**
 * 3D Neural network / brain mesh visualization.
 * Procedural: nodes as spheres, connections as lines.
 * Fits the "deep learning methodology" theme.
 */

const NODE_COUNT = 40
const CONNECTION_PROBABILITY = 0.08
const SPREAD = 2.5

function NeuralNetwork(): JSX.Element {
  const groupRef = useRef<Group>(null)

  /* Generate random node positions in 3 layers (input → hidden → output) */
  const { positions, connections } = useMemo(() => {
    const pos: THREE.Vector3[] = []
    const conn: [number, number][] = []

    for (let i = 0; i < NODE_COUNT; i++) {
      const layer = i < 12 ? -1 : i < 28 ? 0 : 1
      pos.push(new THREE.Vector3(
        layer * SPREAD + (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * SPREAD,
        (Math.random() - 0.5) * SPREAD * 0.6,
      ))
    }

    /* Connect nodes between adjacent layers */
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dist = pos[i].distanceTo(pos[j])
        if (dist < SPREAD * 1.2 && Math.random() < CONNECTION_PROBABILITY * (3 / dist)) {
          conn.push([i, j])
        }
      }
    }

    return { positions: pos, connections: conn }
  }, [])

  /* Line geometry for connections */
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const linePositions = new Float32Array(connections.length * 6)
    connections.forEach(([a, b], idx) => {
      linePositions[idx * 6 + 0] = positions[a].x
      linePositions[idx * 6 + 1] = positions[a].y
      linePositions[idx * 6 + 2] = positions[a].z
      linePositions[idx * 6 + 3] = positions[b].x
      linePositions[idx * 6 + 4] = positions[b].y
      linePositions[idx * 6 + 5] = positions[b].z
    })
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    return geo
  }, [positions, connections])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.08
    groupRef.current.rotation.x += delta * 0.02
  })

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Connection lines */}
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial color="#00d4ff" transparent opacity={0.08} />
        </lineSegments>

        {/* Nodes */}
        {positions.map((pos, nodeIndex) => {
          const layer = nodeIndex < 12 ? 0 : nodeIndex < 28 ? 1 : 2
          const colors = ['#7c3aed', '#00d4ff', '#22c55e']
          const nodeColor = colors[layer]
          const isActive = nodeIndex % 5 === 0

          return (
            <mesh key={nodeIndex} position={pos}>
              <sphereGeometry args={[isActive ? 0.07 : 0.04, 8, 8]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isActive ? 2.5 : 0.8}
                toneMapped={false}
              />
            </mesh>
          )
        })}

        {/* Outer glow sphere */}
        <mesh>
          <sphereGeometry args={[SPREAD * 0.9, 16, 16]} />
          <meshStandardMaterial
            color="#00d4ff"
            wireframe
            transparent
            opacity={0.03}
          />
        </mesh>
      </group>
    </Float>
  )
}

export function NeuralNetScene(): JSX.Element {
  return (
    <div className="w-full h-[200px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <pointLight position={[3, 3, 3]} intensity={0.4} color="#eef2ff" />
          <pointLight position={[-2, -1, 2]} intensity={0.2} color="#00d4ff" />
          <NeuralNetwork />
        </Suspense>
      </Canvas>
    </div>
  )
}
