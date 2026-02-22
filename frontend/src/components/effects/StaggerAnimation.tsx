import { memo, ReactNode } from 'react'
import { motion, Variants } from 'framer-motion'

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
