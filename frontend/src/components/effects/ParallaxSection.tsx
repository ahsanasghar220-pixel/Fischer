import { memo, ReactNode, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'

// ============================================
// PARALLAX - Smooth scroll-based movement
// ============================================
interface ParallaxProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const Parallax = memo(function Parallax({
  children,
  className = '',
  speed = 0.5,
  direction = 'up'
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }

  const transforms: Record<string, MotionValue<number>> = {
    up: useSpring(useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]), springConfig),
    down: useSpring(useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]), springConfig),
    left: useSpring(useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]), springConfig),
    right: useSpring(useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]), springConfig)
  }

  const isHorizontal = direction === 'left' || direction === 'right'

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        [isHorizontal ? 'x' : 'y']: transforms[direction]
      }}
    >
      {children}
    </motion.div>
  )
})

// ============================================
// SCROLL PROGRESS - Page scroll indicator
// ============================================
interface ScrollProgressProps {
  className?: string
  color?: string
  height?: number
}

export const ScrollProgress = memo(function ScrollProgress({
  className = '',
  color = '#951212',
  height = 3
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-[100] origin-left ${className}`}
      style={{
        scaleX,
        height,
        background: `linear-gradient(90deg, ${color}, #fbbf24)`
      }}
    />
  )
})
