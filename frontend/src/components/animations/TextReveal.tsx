import { memo, useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'

interface TextRevealProps {
  children: string
  className?: string
  delay?: number
  duration?: number
  staggerChildren?: number
  once?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerChildren: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.staggerChildren,
      delayChildren: custom.delay
    }
  })
}

const wordVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0
  },
  visible: (custom: { duration: number }) => ({
    y: '0%',
    opacity: 1,
    transition: {
      duration: custom.duration,
      ease: [0.25, 0.4, 0.25, 1]
    }
  })
}

const TextReveal = memo(function TextReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.05,
  once = true,
  as: _Component = 'span' // eslint-disable-line @typescript-eslint/no-unused-vars
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once, margin: '-50px' })
  const words = children.split(' ')

  return (
    <motion.span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={{ staggerChildren, delay }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            variants={wordVariants}
            custom={{ duration }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
})

// Character-by-character reveal
interface CharRevealProps {
  children: string
  className?: string
  delay?: number
  duration?: number
  staggerChildren?: number
  once?: boolean
}

const charVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
    rotateX: -90
  },
  visible: (custom: { duration: number }) => ({
    y: '0%',
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: custom.duration,
      ease: [0.25, 0.4, 0.25, 1]
    }
  })
}

export const CharReveal = memo(function CharReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.4,
  staggerChildren = 0.02,
  once = true
}: CharRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once, margin: '-50px' })
  const chars = children.split('')

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={{ staggerChildren, delay }}
      style={{ perspective: '1000px' }}
    >
      {chars.map((char, i) => (
        <span key={i} className="inline-block overflow-hidden" style={{ perspective: '1000px' }}>
          <motion.span
            className="inline-block"
            variants={charVariants}
            custom={{ duration }}
            style={{ transformOrigin: 'bottom' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
})

// Gradient text reveal with mask
interface GradientRevealProps {
  children: string
  className?: string
  delay?: number
  duration?: number
  once?: boolean
  gradientFrom?: string
  gradientTo?: string
}

export const GradientReveal = memo(function GradientReveal({
  children,
  className = '',
  delay = 0,
  duration = 1,
  once = true,
  gradientFrom = '#f4b42c',
  gradientTo = '#fbbf24'
}: GradientRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once, margin: '-50px' })

  return (
    <motion.span
      ref={ref}
      className={`inline-block relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
        }}
      >
        {children}
      </span>
    </motion.span>
  )
})

export default TextReveal
