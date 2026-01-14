import { useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'

// Context for smooth scroll utilities
interface SmoothScrollContextValue {
  scrollTo: (target: number | string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => void
  scrollToTop: (immediate?: boolean) => void
  lenis: Lenis | null
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
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    // Add Lenis CSS class to html
    document.documentElement.classList.add('lenis', 'lenis-smooth')

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      lenis.destroy()
      lenisRef.current = null
      document.documentElement.classList.remove('lenis', 'lenis-smooth')
    }
  }, [])

  // Scroll to function using Lenis
  const scrollTo = useCallback((
    target: number | string | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => {
    const lenis = lenisRef.current
    if (!lenis) return

    const offset = options?.offset ?? 0
    const duration = options?.duration ?? 1.2
    const immediate = options?.immediate ?? false

    lenis.scrollTo(target, {
      offset,
      duration: immediate ? 0 : duration,
      immediate,
    })
  }, [])

  // Scroll to top function
  const scrollToTop = useCallback((immediate: boolean = false) => {
    const lenis = lenisRef.current
    if (!lenis) return

    lenis.scrollTo(0, {
      duration: immediate ? 0 : 0.8,
      immediate,
    })
  }, [])

  // Reset scroll on navigation
  useEffect(() => {
    const lenis = lenisRef.current
    if (lenis) {
      // Immediate scroll to top on route change
      lenis.scrollTo(0, { immediate: true })
    }
  }, [location.pathname])

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, scrollToTop, lenis: lenisRef.current }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
