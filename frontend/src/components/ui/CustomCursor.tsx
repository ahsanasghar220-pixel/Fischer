import { useEffect, useState, useRef, memo } from 'react'

interface CustomCursorProps {
  enabled?: boolean
}

const CustomCursor = memo(function CustomCursor({ enabled = true }: CustomCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    // Don't enable on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    // Hide default cursor
    document.body.style.cursor = 'none'

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    // Handle hover states for interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]')
      setIsHovering(!!isInteractive)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousemove', handleElementHover)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousemove', handleElementHover)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [enabled])

  // Apply smooth following effect using CSS transform
  useEffect(() => {
    if (!cursorRef.current || !cursorDotRef.current) return

    cursorRef.current.style.transform = `translate(${position.x - 20}px, ${position.y - 20}px)`
    cursorDotRef.current.style.transform = `translate(${position.x - 4}px, ${position.y - 4}px)`
  }, [position])

  if (!enabled) return null

  // Don't render on touch devices
  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <>
      {/* Outer ring cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div
          className={`w-full h-full rounded-full border-2 transition-all duration-300 ${
            isHovering
              ? 'scale-150 border-primary-500/50 bg-primary-500/10'
              : isClicking
              ? 'scale-75 border-primary-500 bg-primary-500/20'
              : 'border-dark-400/50 dark:border-dark-300/50'
          }`}
        />
      </div>

      {/* Inner dot cursor */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-2 h-2 pointer-events-none z-[9999] transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-150 ${
            isHovering
              ? 'scale-0'
              : isClicking
              ? 'scale-150 bg-primary-500'
              : 'bg-primary-500'
          }`}
        />
      </div>

      {/* Hide default cursor on interactive elements */}
      <style>{`
        a, button, [role="button"], input, textarea, select, label, [data-cursor-hover] {
          cursor: none !important;
        }
      `}</style>
    </>
  )
})

export default CustomCursor
