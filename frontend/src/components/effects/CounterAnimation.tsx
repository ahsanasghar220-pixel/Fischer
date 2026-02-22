import { memo, useRef } from 'react'
import { motion, useInView, useSpring } from 'framer-motion'

// Premium easing curves
const easings = {
  expo: [0.16, 1, 0.3, 1] as const
}

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
// FADE MASK - Gradient reveal effect
// ============================================
interface FadeMaskProps {
  children: React.ReactNode
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
