/**
 * Performance monitoring utilities
 * Track and optimize page load and animation performance
 */

// Track page load performance
export function trackPageLoad() {
  if (typeof window === 'undefined' || !window.performance) return

  window.addEventListener('load', () => {
    // Use requestIdleCallback to avoid blocking
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart
        const timeToInteractive = perfData.domInteractive - perfData.navigationStart

        // Log performance metrics (you can send these to analytics)
        console.log('Page Performance:', {
          pageLoadTime: `${pageLoadTime}ms`,
          domContentLoaded: `${domContentLoaded}ms`,
          timeToInteractive: `${timeToInteractive}ms`,
          isUnder500ms: pageLoadTime < 500,
        })

        // Mark in localStorage for debugging
        if (process.env.NODE_ENV === 'development') {
          localStorage.setItem('last-page-load-time', pageLoadTime.toString())
        }
      })
    }
  })
}

// FPS monitor for animation performance
export class FPSMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60
  private rafId: number | null = null

  start() {
    const measure = () => {
      this.frameCount++
      const currentTime = performance.now()
      const elapsed = currentTime - this.lastTime

      if (elapsed >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / elapsed)
        this.frameCount = 0
        this.lastTime = currentTime

        // Warn if FPS drops below 30
        if (this.fps < 30 && process.env.NODE_ENV === 'development') {
          console.warn(`Low FPS detected: ${this.fps}fps`)
        }
      }

      this.rafId = requestAnimationFrame(measure)
    }

    this.rafId = requestAnimationFrame(measure)
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  getFPS() {
    return this.fps
  }
}

// Detect if animation would cause jank
export function shouldReduceAnimations() {
  // Check for user preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true
  }

  // Check for low battery
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      if (battery.level < 0.2) {
        return true
      }
    })
  }

  // Check for low-end device
  const cores = navigator.hardwareConcurrency || 4
  if (cores < 4) {
    return true
  }

  return false
}

// Optimize images on-the-fly
export function getOptimizedImageSrc(src: string, _width?: number, _quality: number = 80) {
  // If using a CDN that supports image optimization, append query params
  // Example: Cloudinary, imgix, etc.
  // For now, return the original src
  // _width and _quality are reserved for future CDN integration
  return src
}

// Preload critical resources
export function preloadCriticalResources() {
  // Preload hero image
  const heroImage = new Image()
  heroImage.src = '/images/products/water-cooler-100ltr.png'

  // Preload logo
  const logo = new Image()
  logo.src = '/images/logo.png'

  // Preload critical fonts (if self-hosted)
  // const font = new FontFace('Poppins', 'url(/fonts/poppins.woff2)')
  // font.load().then(() => document.fonts.add(font))
}

// Clean up animations when component unmounts
export function cleanupAnimation(element: HTMLElement) {
  element.style.willChange = 'auto'
  element.style.transform = ''
}

// Batch DOM reads and writes to avoid layout thrashing
export class DOMBatcher {
  private readCallbacks: Array<() => void> = []
  private writeCallbacks: Array<() => void> = []
  private rafId: number | null = null

  read(callback: () => void) {
    this.readCallbacks.push(callback)
    this.schedule()
  }

  write(callback: () => void) {
    this.writeCallbacks.push(callback)
    this.schedule()
  }

  private schedule() {
    if (this.rafId) return

    this.rafId = requestAnimationFrame(() => {
      // Execute all reads first
      this.readCallbacks.forEach((cb) => cb())
      this.readCallbacks = []

      // Then execute all writes
      this.writeCallbacks.forEach((cb) => cb())
      this.writeCallbacks = []

      this.rafId = null
    })
  }
}

export const domBatcher = new DOMBatcher()
