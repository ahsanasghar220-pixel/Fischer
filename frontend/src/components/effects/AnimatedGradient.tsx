import { memo, useEffect, useRef } from 'react'

interface GradientStop {
  color: string
  position: { x: number; y: number }
}

interface AnimatedGradientProps {
  className?: string
  colors?: string[]
  speed?: number
}

const AnimatedGradient = memo(function AnimatedGradient({
  className = '',
  colors = ['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460', '#f4b42c'],
  speed = 0.0005
}: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const stopsRef = useRef<GradientStop[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize gradient stops with random positions
    stopsRef.current = colors.map((color) => ({
      color,
      position: {
        x: Math.random(),
        y: Math.random()
      }
    }))

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Animation loop
    let time = 0
    const animate = () => {
      time += speed

      // Update positions with smooth sine wave motion
      stopsRef.current.forEach((stop, i) => {
        stop.position.x = 0.5 + 0.4 * Math.sin(time + i * 1.5)
        stop.position.y = 0.5 + 0.4 * Math.cos(time * 0.8 + i * 1.2)
      })

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw radial gradients for each color stop
      stopsRef.current.forEach((stop) => {
        const x = stop.position.x * canvas.width
        const y = stop.position.y * canvas.height
        const radius = Math.max(canvas.width, canvas.height) * 0.6

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, stop.color + '80') // 50% opacity
        gradient.addColorStop(0.5, stop.color + '40') // 25% opacity
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [colors, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ mixBlendMode: 'normal' }}
    />
  )
})

export default AnimatedGradient
