/**
 * Animation configuration for optimal performance
 * Uses CSS animations for initial load, progressive enhancement with JS
 */

// Detect if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Check if device is low-end (simple heuristic)
export const isLowEndDevice = () => {
  // Check for fewer than 4 CPU cores as a simple heuristic
  const cores = navigator.hardwareConcurrency || 4
  return cores < 4
}

// Animation performance budget
export const ANIMATION_CONFIG = {
  // Disable heavy animations on low-end devices
  enableHeavyAnimations: !isLowEndDevice() && !prefersReducedMotion(),

  // Stagger delays for sequential animations (ms)
  staggerDelay: 50,

  // Standard durations for consistency
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Easing functions
  easings: {
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Intersection Observer settings for scroll animations
  scrollObserver: {
    threshold: 0.1,
    rootMargin: '50px', // Start animating 50px before element enters viewport
  },
}

// Framer Motion variants for consistent animations
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// Stagger container for sequential animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// GPU-accelerated transform properties only
export const gpuAcceleratedProps = ['transform', 'opacity', 'filter']

// Will-change management for better performance
export class WillChangeManager {
  private static activeElements = new Set<HTMLElement>()

  static add(element: HTMLElement, properties: string[]) {
    element.style.willChange = properties.join(', ')
    this.activeElements.add(element)

    // Auto-cleanup after 1 second of no animation
    setTimeout(() => {
      this.remove(element)
    }, 1000)
  }

  static remove(element: HTMLElement) {
    element.style.willChange = 'auto'
    this.activeElements.delete(element)
  }

  static cleanup() {
    this.activeElements.forEach((element) => {
      element.style.willChange = 'auto'
    })
    this.activeElements.clear()
  }
}
