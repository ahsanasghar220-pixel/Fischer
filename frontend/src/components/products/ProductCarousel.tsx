import { useRef, useEffect, useState, useCallback, memo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface ProductCarouselProps {
  children: React.ReactNode[]
  /** Scroll speed in pixels per second (default 80) */
  speed?: number
  /** Gap between cards in pixels */
  gap?: number
  /** Direction of auto-scroll */
  direction?: 'left' | 'right'
  /** CSS class for fade edge gradient. Override to match section bg. */
  fadeClass?: string
  /** Fixed card width in pixels. Overrides responsive column calculation. */
  fixedCardWidth?: number
}

/**
 * Smooth continuous marquee carousel for product cards.
 *
 * - Scrolls continuously at a constant speed (like logo strips)
 * - Pauses on hover / touch
 * - Left/right arrow buttons appear on hover to nudge manually (smooth animated)
 * - Duplicates children for seamless infinite loop
 * - Responsive: 4 on xl, 3 on lg, 2 on md, 1.3 on sm
 */
const ProductCarousel = memo(function ProductCarousel({
  children,
  speed = 80,
  gap = 24,
  direction = 'left',
  fadeClass,
  fixedCardWidth,
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const offsetRef = useRef(0)
  const lastTimeRef = useRef(0)
  const isPausedRef = useRef(false)
  const nudgeRemainingRef = useRef(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const totalItems = children.length

  // Calculate card width based on container
  const recalculate = useCallback(() => {
    if (fixedCardWidth) {
      setCardWidth(fixedCardWidth)
      return
    }
    if (!containerRef.current) return
    const w = containerRef.current.offsetWidth
    let cols = 4
    if (w < 640) cols = 1.3
    else if (w < 768) cols = 2
    else if (w < 1024) cols = 3
    else cols = 4
    const totalGap = gap * (Math.floor(cols) - (cols % 1 === 0 ? 1 : 0))
    setCardWidth((w - totalGap) / cols)
  }, [gap, fixedCardWidth])

  useEffect(() => {
    recalculate()
    const observer = new ResizeObserver(recalculate)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [recalculate])

  // Width of one full set of cards
  const singleSetWidth = totalItems * (cardWidth + gap)

  // Animation loop — pure rAF for buttery smoothness
  useEffect(() => {
    if (!cardWidth || totalItems === 0) return

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const delta = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time

      // Regular auto-scroll
      if (!isPausedRef.current && delta < 0.1) {
        const move = speed * delta
        if (direction === 'left') {
          offsetRef.current -= move
        } else {
          offsetRef.current += move
        }
      }

      // Smooth nudge consumption — fast exponential ease-out
      if (nudgeRemainingRef.current !== 0) {
        // Higher factor = snappier feel (~150ms at 60fps)
        const factor = 1 - Math.pow(0.001, delta)
        const consume = nudgeRemainingRef.current * factor
        offsetRef.current += consume
        nudgeRemainingRef.current -= consume

        // Snap when negligible
        if (Math.abs(nudgeRemainingRef.current) < 0.5) {
          offsetRef.current += nudgeRemainingRef.current
          nudgeRemainingRef.current = 0
        }
      }

      // Wrap-around for seamless loop
      while (offsetRef.current <= -singleSetWidth) offsetRef.current += singleSetWidth
      while (offsetRef.current > 0) offsetRef.current -= singleSetWidth

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    if (direction === 'right') {
      offsetRef.current = -singleSetWidth
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [cardWidth, totalItems, speed, direction, singleSetWidth])

  // Sync pause state
  useEffect(() => {
    isPausedRef.current = isHovered
  }, [isHovered])

  // Arrow nudge — enqueue smooth animated shift by one card width
  const nudge = useCallback(
    (dir: 'left' | 'right') => {
      const step = cardWidth + gap
      if (dir === 'left') {
        nudgeRemainingRef.current += step
      } else {
        nudgeRemainingRef.current -= step
      }
    },
    [cardWidth, gap]
  )

  if (totalItems === 0) return null

  const renderCards = (keyPrefix: string) =>
    children.map((child, i) => (
      <div
        key={`${keyPrefix}-${i}`}
        className="flex-shrink-0"
        style={{ width: cardWidth || undefined, marginRight: gap }}
      >
        {child}
      </div>
    ))

  return (
    <div
      ref={containerRef}
      className="relative group/carousel overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Fade edges */}
      {fadeClass !== undefined && (
        <>
          <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r to-transparent ${fadeClass}`} />
          <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l to-transparent ${fadeClass}`} />
        </>
      )}

      {/* Left arrow */}
      <button
        onClick={() => nudge('left')}
        className="absolute left-3 top-1/2 -translate-y-1/2
                   z-20 w-10 h-10 rounded-full
                   bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm shadow-lg
                   border border-dark-200/50 dark:border-dark-600/50
                   flex items-center justify-center
                   text-dark-700 dark:text-dark-200
                   opacity-0 group-hover/carousel:opacity-100
                   hover:bg-primary-50 dark:hover:bg-primary-900/40
                   hover:border-primary-300 dark:hover:border-primary-600
                   hover:text-primary-600 dark:hover:text-primary-400
                   hover:scale-110 active:scale-95
                   transition-all duration-200
                   focus:outline-none"
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => nudge('right')}
        className="absolute right-3 top-1/2 -translate-y-1/2
                   z-20 w-10 h-10 rounded-full
                   bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm shadow-lg
                   border border-dark-200/50 dark:border-dark-600/50
                   flex items-center justify-center
                   text-dark-700 dark:text-dark-200
                   opacity-0 group-hover/carousel:opacity-100
                   hover:bg-primary-50 dark:hover:bg-primary-900/40
                   hover:border-primary-300 dark:hover:border-primary-600
                   hover:text-primary-600 dark:hover:text-primary-400
                   hover:scale-110 active:scale-95
                   transition-all duration-200
                   focus:outline-none"
        aria-label="Scroll right"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* Track — two copies for seamless loop */}
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ width: singleSetWidth * 2 }}
      >
        {renderCards('a')}
        {renderCards('b')}
      </div>
    </div>
  )
})

export default ProductCarousel
