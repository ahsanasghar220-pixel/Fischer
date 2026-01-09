import { useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Context for smooth scroll utilities
interface SmoothScrollContextValue {
  scrollTo: (target: number | string | HTMLElement, options?: { offset?: number; behavior?: 'smooth' | 'instant' }) => void
  scrollToTop: (behavior?: 'smooth' | 'instant') => void
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null)

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const location = useLocation()
  const isScrolling = useRef(false)

  // Apply smooth scroll CSS to html element
  useEffect(() => {
    // Enable CSS smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'

    // Additional performance optimizations
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.documentElement.style.scrollBehavior = ''
      document.documentElement.style.overscrollBehavior = ''
    }
  }, [])

  // Smooth easing function for custom scroll animations
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }

  // Custom smooth scroll with easing for programmatic scrolls
  const smoothScrollTo = useCallback((targetY: number, duration: number = 800) => {
    if (isScrolling.current) return

    isScrolling.current = true
    const startY = window.scrollY
    const difference = targetY - startY
    const startTime = performance.now()

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)

      window.scrollTo(0, startY + difference * eased)

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        isScrolling.current = false
      }
    }

    requestAnimationFrame(animateScroll)
  }, [])

  const scrollTo = useCallback((
    target: number | string | HTMLElement,
    options?: { offset?: number; behavior?: 'smooth' | 'instant' }
  ) => {
    const offset = options?.offset || 0
    const behavior = options?.behavior || 'smooth'

    let targetPosition = 0

    if (typeof target === 'number') {
      targetPosition = target
    } else if (typeof target === 'string') {
      const element = document.querySelector(target)
      if (element) {
        targetPosition = element.getBoundingClientRect().top + window.scrollY
      }
    } else if (target instanceof HTMLElement) {
      targetPosition = target.getBoundingClientRect().top + window.scrollY
    }

    const finalPosition = Math.max(0, targetPosition + offset)

    if (behavior === 'instant') {
      window.scrollTo(0, finalPosition)
    } else {
      smoothScrollTo(finalPosition)
    }
  }, [smoothScrollTo])

  const scrollToTop = useCallback((behavior: 'smooth' | 'instant' = 'smooth') => {
    if (behavior === 'instant') {
      window.scrollTo(0, 0)
    } else {
      smoothScrollTo(0, 600)
    }
  }, [smoothScrollTo])

  // Reset scroll on navigation (handled by ScrollToTop component)
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, scrollToTop }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
