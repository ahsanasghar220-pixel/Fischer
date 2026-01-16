import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  useTexture,
  RoundedBox,
  MeshReflectorMaterial,
  Html,
  useProgress,
} from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Loading component
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-dark-300 text-sm">{Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

// 3D Product Model using box as placeholder
interface ProductModelProps {
  imageUrl: string
  autoRotate?: boolean
}

function ProductModel({ imageUrl, autoRotate = true }: ProductModelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Load product texture
  const texture = useTexture(imageUrl || '/images/products/water-cooler-100ltr.png')
  texture.colorSpace = THREE.SRGBColorSpace

  useFrame((state) => {
    if (meshRef.current && autoRotate && !hovered) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Product display stand */}
        <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.5, 0.1, 64]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Product image on a curved plane */}
        <mesh
          ref={meshRef}
          position={[0, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.05 : 1}
        >
          <planeGeometry args={[2.5, 3]} />
          <meshStandardMaterial
            map={texture}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Glow ring */}
        <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.4, 64]} />
          <meshBasicMaterial color="#f4b42c" transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

// Premium 3D box product representation
function ProductBox({ color = '#f4b42c' }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <RoundedBox
        ref={meshRef}
        args={[1.5, 2.2, 1]}
        radius={0.1}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          envMapIntensity={1}
        />
      </RoundedBox>

      {/* Bottom glow */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </Float>
  )
}

// Scene setup
interface SceneProps {
  imageUrl?: string
  showBox?: boolean
}

function Scene({ imageUrl, showBox = false }: SceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f4b42c" />

      {/* Environment */}
      <Environment preset="city" />

      {/* Product */}
      {showBox ? (
        <ProductBox />
      ) : imageUrl ? (
        <ProductModel imageUrl={imageUrl} />
      ) : (
        <ProductBox />
      )}

      {/* Floor reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0a"
          metalness={0.5}
          mirror={0}
        />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
      />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

// Main component
interface ProductViewer3DProps {
  imageUrl?: string
  className?: string
  showBox?: boolean
  onInteract?: () => void
}

export default function ProductViewer3D({
  imageUrl,
  className = '',
  showBox = false,
  onInteract,
}: ProductViewer3DProps) {
  const [, setIsLoaded] = useState(false)

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900/60 backdrop-blur-sm border border-white/10">
        <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="text-xs text-dark-300">Drag to rotate</span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        onCreated={() => setIsLoaded(true)}
        onPointerDown={onInteract}
        className="cursor-grab active:cursor-grabbing"
      >
        <Suspense fallback={<Loader />}>
          <Scene imageUrl={imageUrl} showBox={showBox} />
        </Suspense>
      </Canvas>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark-950 to-transparent pointer-events-none" />
    </motion.div>
  )
}

// Simpler version for product cards with 3D tilt effect
export function ProductCard3D({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateX((y - centerY) / 20)
    setRotateY((centerX - x) / 20)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative preserve-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </motion.div>
  )
}
