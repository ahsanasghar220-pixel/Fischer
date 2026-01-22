import { memo, ReactNode, useRef } from 'react'
import { motion, useInView, useScroll, useTransform, useSpring, Variants, MotionValue } from 'framer-motion'

// ============================================
// ANIMATION TYPES
// ============================================
type AnimationType =
  | 'fadeUp'
  | 'fadeDown'
  | 'fadeLeft'
  | 'fadeRight'
  | 'scale'
  | 'scaleUp'
  | 'blur'
  | 'slideUp'
  | 'slideDown'
  | 'flip'
  | 'rotate'
  | 'bounce'
  | 'elastic'
  | 'glide'
  | 'zoom'
  | 'reveal'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  animation?: AnimationType
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
}

// Smooth premium animations
const animations: Record<AnimationType, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  },
  fadeDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 }
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  },
  fadeRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' }
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  },
  slideDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 }
  },
  flip: {
    hidden: { opacity: 0, rotateX: -15, transformPerspective: 1000 },
    visible: { opacity: 1, rotateX: 0, transformPerspective: 1000 }
  },
  rotate: {
    hidden: { opacity: 0, rotate: -3, scale: 0.98 },
    visible: { opacity: 1, rotate: 0, scale: 1 }
  },
  bounce: {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 }
  },
  elastic: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  },
  glide: {
    hidden: { opacity: 0, x: -40, rotate: -2 },
    visible: { opacity: 1, x: 0, rotate: 0 }
  },
  zoom: {
    hidden: { opacity: 0, scale: 1.05, filter: 'blur(5px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)' }
  },
  reveal: {
    hidden: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
    visible: { opacity: 1, clipPath: 'inset(0% 0 0 0)' }
  }
}

// Premium easing curves
const easings = {
  smooth: [0.25, 0.1, 0.25, 1],
  smoothOut: [0, 0, 0.2, 1],
  smoothIn: [0.4, 0, 1, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
  bounce: [0.68, -0.55, 0.265, 1.55],
  expo: [0.16, 1, 0.3, 1]
}

const ScrollReveal = memo(function ScrollReveal({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.1
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={animations[animation]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
})

// ============================================
// STAGGER CONTAINER - For grid animations
// ============================================
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
  once?: boolean
  amount?: number
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerDelay: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delay
    }
  })
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

export const StaggerContainer = memo(function StaggerContainer({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.08,
  once = true,
  amount = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      custom={{ staggerDelay, delay }}
    >
      {children}
    </motion.div>
  )
})

export const StaggerItem = memo(function StaggerItem({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
})

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
        [isHorizontal ? 'x' : 'y']: transforms[direction]
      }}
    >
      {children}
    </motion.div>
  )
})

// ============================================
// MAGNETIC - Interactive hover effect
// ============================================
interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

export const Magnetic = memo(function Magnetic({
  children,
  className = '',
  strength = 0.3
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0, 0)'
  }

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
})

// ============================================
// TEXT REVEAL - Character by character
// ============================================
interface TextRevealProps {
  children: string
  className?: string
  delay?: number
  staggerDelay?: number
  once?: boolean
}

export const TextReveal = memo(function TextReveal({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  once = false
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: 0.5 })
  const words = children.split(' ')

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 50, rotateX: -90 },
                visible: { opacity: 1, y: 0, rotateX: 0 }
              }}
              transition={{
                duration: 0.5,
                delay: delay + (wordIndex * word.length + charIndex) * staggerDelay,
                ease: easings.expo
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  )
})

// ============================================
// WORD REVEAL - Word by word animation
// ============================================
interface WordRevealProps {
  children: string
  className?: string
  delay?: number
  staggerDelay?: number
  once?: boolean
}

export const WordReveal = memo(function WordReveal({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.06,
  once = true
}: WordRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: 0.1, margin: "50px 0px 0px 0px" })
  const words = children.split(' ')

  return (
    <motion.span
      ref={ref}
      className={`inline ${className}`}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={{ display: 'inline' }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]" style={{ verticalAlign: 'top' }}>
          <motion.span
            className="inline-block"
            style={{ display: 'inline-block' }}
            variants={{
              hidden: { y: '100%', opacity: 0 },
              visible: { y: '0%', opacity: 1 }
            }}
            transition={{
              duration: 0.5,
              delay: delay + i * staggerDelay,
              ease: easings.expo
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
})

// ============================================
// FADE MASK - Gradient reveal effect
// ============================================
interface FadeMaskProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  once?: boolean
}

export const FadeMask = memo(function FadeMask({
  children,
  className = '',
  direction = 'up',
  once = true
}: FadeMaskProps) {
  const clipPaths: Record<string, { hidden: string; visible: string }> = {
    up: { hidden: 'inset(100% 0 0 0)', visible: 'inset(0% 0 0 0)' },
    down: { hidden: 'inset(0 0 100% 0)', visible: 'inset(0 0 0% 0)' },
    left: { hidden: 'inset(0 100% 0 0)', visible: 'inset(0 0% 0 0)' },
    right: { hidden: 'inset(0 0 0 100%)', visible: 'inset(0 0 0 0%)' }
  }

  return (
    <motion.div
      className={className}
      initial={{ clipPath: clipPaths[direction].hidden, opacity: 0 }}
      whileInView={{ clipPath: clipPaths[direction].visible, opacity: 1 }}
      viewport={{ once, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
})

// ============================================
// COUNTER - Animated number counter
// ============================================
interface CounterProps {
  from?: number
  to: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
  once?: boolean
}

export const Counter = memo(function Counter({
  from = 0,
  to,
  duration = 2,
  className = '',
  suffix = '',
  prefix = '',
  once = true
}: CounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: 0.5 })

  const count = useSpring(from, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000
  })

  if (isInView) {
    count.set(to)
  } else if (!once) {
    count.set(from)
  }

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      <motion.span>{count}</motion.span>
      {suffix}
    </motion.span>
  )
})

// ============================================
// SPLIT TEXT - Split and animate
// ============================================
interface SplitTextProps {
  children: string
  className?: string
  delay?: number
  once?: boolean
  type?: 'chars' | 'words' | 'lines'
}

export const SplitText = memo(function SplitText({
  children,
  className = '',
  delay = 0,
  once = false,
  type = 'words'
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: 0.5 })

  const elements = type === 'chars'
    ? children.split('')
    : type === 'words'
      ? children.split(' ')
      : children.split('\n')

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {elements.map((element, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className={`inline-block ${type === 'words' ? 'mr-[0.25em]' : ''}`}
            variants={{
              hidden: { y: '120%', rotate: 10, opacity: 0 },
              visible: { y: '0%', rotate: 0, opacity: 1 }
            }}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.05,
              ease: easings.expo
            }}
          >
            {element}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
})

// ============================================
// HOVER CARD - 3D tilt on hover
// ============================================
interface HoverCardProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export const HoverCard = memo(function HoverCard({
  children,
  className = '',
  intensity = 10
}: HoverCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -intensity
    const rotateY = ((x - centerX) / centerX) * intensity

    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  return (
    <div
      ref={ref}
      className={`transition-transform duration-500 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
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
  color = '#722F37',
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

export default ScrollReveal
