import { memo, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// ============================================
// PAGE TRANSITION - Smooth page transitions
// ============================================
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export const PageTransition = memo(function PageTransition({
  children,
  className = '',
}: PageTransitionProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
})

// ============================================
// SECTION WRAPPER - Animate sections on scroll
// ============================================
interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  delay?: number
  animation?: 'fadeUp' | 'fadeIn' | 'slideUp' | 'scale' | 'blur'
}

const sectionAnimations = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
}

export const Section = memo(function Section({
  children,
  className = '',
  id,
  delay = 0,
  animation = 'fadeUp',
}: SectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionAnimations[animation]}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.section>
  )
})

// ============================================
// ANIMATED BUTTON - Interactive button with hover effects
// ============================================
interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'outline'
}

export const AnimatedButton = memo(function AnimatedButton({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
}: AnimatedButtonProps) {
  const baseStyles = 'relative overflow-hidden rounded-lg font-medium transition-colors'
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-dark-100 text-dark-900 hover:bg-dark-200 dark:bg-dark-700 dark:text-white dark:hover:bg-dark-600',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.span
        className="absolute inset-0 bg-white/20"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
})

// ============================================
// ANIMATED CARD - Card with hover lift effect
// ============================================
interface AnimatedCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  delay?: number
}

export const AnimatedCard = memo(function AnimatedCard({
  children,
  className = '',
  onClick,
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  )
})

// ============================================
// ANIMATED IMAGE - Image with reveal effect
// ============================================
interface AnimatedImageProps {
  src: string
  alt: string
  className?: string
  delay?: number
  effect?: 'fade' | 'reveal' | 'zoom' | 'blur'
}

const imageAnimations = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  reveal: {
    hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
    visible: { clipPath: 'inset(0% 0 0 0)', opacity: 1 },
  },
  zoom: {
    hidden: { scale: 1.2, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  blur: {
    hidden: { filter: 'blur(20px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1 },
  },
}

export const AnimatedImage = memo(function AnimatedImage({
  src,
  alt,
  className = '',
  delay = 0,
  effect = 'fade',
}: AnimatedImageProps) {
  return (
    <motion.div className="overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={imageAnimations[effect]}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
    </motion.div>
  )
})

// ============================================
// ANIMATED LIST - Staggered list animation
// ============================================
interface AnimatedListProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
  staggerDelay?: number
}

export const AnimatedList = memo(function AnimatedList({
  children,
  className = '',
  itemClassName = '',
  staggerDelay = 0.08,
}: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
})

// ============================================
// HOVER SCALE - Simple hover scale effect
// ============================================
interface HoverScaleProps {
  children: ReactNode
  className?: string
  scale?: number
}

export const HoverScale = memo(function HoverScale({
  children,
  className = '',
  scale = 1.05,
}: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  )
})

// ============================================
// FLOATING ELEMENT - Continuous float animation
// ============================================
interface FloatingElementProps {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
}

export const FloatingElement = memo(function FloatingElement({
  children,
  className = '',
  duration = 4,
  distance = 10,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
})

// ============================================
// PULSE ELEMENT - Pulsing animation
// ============================================
interface PulseElementProps {
  children: ReactNode
  className?: string
  scale?: number
  duration?: number
}

export const PulseElement = memo(function PulseElement({
  children,
  className = '',
  scale = 1.05,
  duration = 2,
}: PulseElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
})

export default PageTransition
