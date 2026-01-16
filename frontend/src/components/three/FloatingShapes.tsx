import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface ShapeProps {
  position: [number, number, number]
  color: string
  scale?: number
  speed?: number
  rotationIntensity?: number
  floatIntensity?: number
  distort?: number
}

function FloatingShape({
  position,
  color,
  scale = 1,
  speed = 1,
  rotationIntensity = 1,
  floatIntensity = 1,
  distort = 0.3
}: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.2
    meshRef.current.rotation.y += 0.003 * speed
  })

  return (
    <Float
      speed={speed}
      rotationIntensity={rotationIntensity}
      floatIntensity={floatIntensity}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  )
}

function TorusShape({
  position,
  color,
  scale = 1,
  speed = 1
}: Omit<ShapeProps, 'distort' | 'rotationIntensity' | 'floatIntensity'>) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
  })

  return (
    <Float speed={speed * 0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  )
}

function OctahedronShape({
  position,
  color,
  scale = 1,
  speed = 1
}: Omit<ShapeProps, 'distort' | 'rotationIntensity' | 'floatIntensity'>) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.4) * 0.2
  })

  return (
    <Float speed={speed * 0.7} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>
    </Float>
  )
}

function Scene() {
  const shapes = useMemo(
    () => [
      { type: 'icosahedron', position: [-4, 2, -5] as [number, number, number], color: '#f4b42c', scale: 1.2, speed: 0.8 },
      { type: 'torus', position: [4, -1, -4] as [number, number, number], color: '#f4b42c', scale: 0.8, speed: 1.2 },
      { type: 'octahedron', position: [-3, -2, -3] as [number, number, number], color: '#fcd34d', scale: 0.6, speed: 1 },
      { type: 'icosahedron', position: [3, 3, -6] as [number, number, number], color: '#fbbf24', scale: 0.9, speed: 0.6 },
      { type: 'torus', position: [-5, 0, -7] as [number, number, number], color: '#f59e0b', scale: 0.5, speed: 1.4 },
      { type: 'octahedron', position: [5, 1, -5] as [number, number, number], color: '#f4b42c', scale: 0.7, speed: 0.9 },
    ],
    []
  )

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#f4b42c" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />

      {shapes.map((shape, i) => {
        if (shape.type === 'icosahedron') {
          return (
            <FloatingShape
              key={i}
              position={shape.position}
              color={shape.color}
              scale={shape.scale}
              speed={shape.speed}
            />
          )
        }
        if (shape.type === 'torus') {
          return (
            <TorusShape
              key={i}
              position={shape.position}
              color={shape.color}
              scale={shape.scale}
              speed={shape.speed}
            />
          )
        }
        return (
          <OctahedronShape
            key={i}
            position={shape.position}
            color={shape.color}
            scale={shape.scale}
            speed={shape.speed}
          />
        )
      })}
    </>
  )
}

interface FloatingShapesProps {
  className?: string
}

export default function FloatingShapes({ className = '' }: FloatingShapesProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
