/**
 * Performance monitoring utilities
 */

// Track page load performance
export function trackPageLoad() {
  if (typeof window === 'undefined' || !window.performance) return

  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart

        if (process.env.NODE_ENV === 'development') {
          localStorage.setItem('last-page-load-time', pageLoadTime.toString())
        }
      })
    }
  })
}

// Preload critical resources
export function preloadCriticalResources() {
  // Preload logos needed for header
  const logoDark = new Image()
  logoDark.src = '/images/logo/Fischer-electronics-logo-black.svg'
  const logoLight = new Image()
  logoLight.src = '/images/logo/Fischer-electronics-logo-white.svg'
}
