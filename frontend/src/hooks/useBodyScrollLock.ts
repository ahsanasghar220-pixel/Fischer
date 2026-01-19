import { useEffect } from 'react'

/**
 * Locks body scroll when a modal/sidebar is open
 * Handles multiple overlays correctly (e.g., cart drawer + search modal)
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    // Store original styles
    const originalStyle = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    }

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Lock scroll
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // Only restore if no other modals are open
      // Check for Headless UI Dialog backdrop
      const hasOpenModals = document.querySelector('[role="dialog"]') !== null

      if (!hasOpenModals) {
        document.body.style.overflow = originalStyle.overflow
        document.body.style.paddingRight = originalStyle.paddingRight
      }
    }
  }, [isLocked])
}
