import { useState, useEffect } from 'react'

/**
 * Performance hook that manages animation timing
 * Defers non-critical animations until after initial page load
 */
export function usePerformance() {
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
  const [areAnimationsReady, setAreAnimationsReady] = useState(false)

  useEffect(() => {
    // Mark initial load as complete when DOM is ready
    const handleLoad = () => {
      setIsInitialLoadComplete(true)

      // Defer animations until browser is idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          setAreAnimationsReady(true)
        }, { timeout: 500 })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => setAreAnimationsReady(true), 100)
      }
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  return {
    isInitialLoadComplete,
    areAnimationsReady,
    shouldAnimate: areAnimationsReady,
  }
}

/**
 * Hook for viewport-based animation triggering
 * Only animates elements that are in view
 */
export function useInViewAnimation(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  const ref = (element: HTMLElement | null) => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsInView(true)
          setHasAnimated(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }

  return { ref, isInView, hasAnimated }
}

/**
 * Resource preloading hints for performance
 */
export function addResourceHints() {
  // Preconnect to external domains (add yours here)
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]

  preconnectDomains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}
