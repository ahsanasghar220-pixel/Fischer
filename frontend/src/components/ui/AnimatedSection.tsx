import { useRef, useState, useEffect, ReactNode, CSSProperties } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  /** Animation type when entering viewport */
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade' | 'scale' | 'slide-up' | 'blur-up'
  /** Delay before animation starts (ms) */
  delay?: number
  /** Animation duration (ms) - default is now 1000ms for smoother feel */
  duration?: number
  /** Threshold for intersection observer (0-1) */
  threshold?: number
  /** Whether to animate out when leaving viewport */
  animateOut?: boolean
  /** Whether to only animate once */
  once?: boolean
  /** Lazy load children - only render when in view */
  lazy?: boolean
  /** Distance to translate from (px) */
  distance?: number
  /** Custom style overrides */
  style?: CSSProperties
  /** ID for the section */
  id?: string
  /** Easing function - smooth, bouncy, or custom cubic-bezier */
  easing?: 'smooth' | 'bouncy' | 'gentle' | string
}

export default function AnimatedSection({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 1000, // Slower, smoother default
  threshold = 0.1, // Trigger earlier for smoother experience
  animateOut = true,
  once = false,
  lazy = false,
  distance = 80, // More travel distance for elegant feel
  style,
  id,
  easing = 'gentle', // Default to gentle easing
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [shouldRender, setShouldRender] = useState(!lazy)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting

        // Handle lazy loading
        if (lazy && inView && !shouldRender) {
          setShouldRender(true)
        }

        // Handle visibility
        if (once && hasAnimated) {
          // If once mode and already animated, keep visible
          setIsVisible(true)
        } else if (animateOut) {
          // Animate in and out
          setIsVisible(inView)
          if (inView) setHasAnimated(true)
        } else {
          // Only animate in
          if (inView) {
            setIsVisible(true)
            setHasAnimated(true)
          }
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px', // Trigger slightly before entering viewport
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, animateOut, once, hasAnimated, lazy, shouldRender])

  // Get easing curve based on preset or custom value
  const getEasing = (): string => {
    switch (easing) {
      case 'smooth':
        return 'cubic-bezier(0.22, 1, 0.36, 1)' // Smooth decelerate
      case 'bouncy':
        return 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Slight overshoot
      case 'gentle':
        return 'cubic-bezier(0.25, 0.1, 0.25, 1)' // Very smooth, slow ease
      default:
        return easing // Custom cubic-bezier string
    }
  }

  // Calculate transform based on animation type
  const getInitialTransform = (): string => {
    switch (animation) {
      case 'fade-up':
      case 'blur-up':
        return `translateY(${distance}px)`
      case 'fade-down':
        return `translateY(-${distance}px)`
      case 'fade-left':
        return `translateX(${distance}px)`
      case 'fade-right':
        return `translateX(-${distance}px)`
      case 'scale':
        return 'scale(0.85)'
      case 'slide-up':
        return `translateY(${distance}px)`
      case 'fade':
      default:
        return 'translateY(0)'
    }
  }

  const getFinalTransform = (): string => {
    switch (animation) {
      case 'scale':
        return 'scale(1)'
      default:
        return 'translateY(0) translateX(0)'
    }
  }

  // Get initial filter (for blur effect)
  const getInitialFilter = (): string => {
    if (animation === 'blur-up') {
      return 'blur(10px)'
    }
    return 'blur(0px)'
  }

  const easingCurve = getEasing()

  const animationStyles: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? getFinalTransform() : getInitialTransform(),
    filter: isVisible ? 'blur(0px)' : getInitialFilter(),
    transition: `
      opacity ${duration}ms ${easingCurve} ${delay}ms,
      transform ${duration}ms ${easingCurve} ${delay}ms,
      filter ${duration}ms ${easingCurve} ${delay}ms
    `.trim(),
    willChange: 'opacity, transform, filter',
    ...style,
  }

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={animationStyles}
    >
      {shouldRender ? children : null}
    </div>
  )
}

// Staggered children animation wrapper
interface StaggeredChildrenProps {
  children: ReactNode[]
  className?: string
  childClassName?: string
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade' | 'scale' | 'blur-up'
  staggerDelay?: number
  duration?: number
  threshold?: number
  once?: boolean
  distance?: number
  easing?: 'smooth' | 'bouncy' | 'gentle' | string
}

export function StaggeredChildren({
  children,
  className = '',
  childClassName = '',
  animation = 'fade-up',
  staggerDelay = 120, // Slightly longer stagger for elegance
  duration = 800, // Slower, smoother
  threshold = 0.05,
  once = true,
  distance = 50,
  easing = 'gentle',
}: StaggeredChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '50px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, once])

  const getEasing = (): string => {
    switch (easing) {
      case 'smooth':
        return 'cubic-bezier(0.22, 1, 0.36, 1)'
      case 'bouncy':
        return 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      case 'gentle':
        return 'cubic-bezier(0.25, 0.1, 0.25, 1)'
      default:
        return easing
    }
  }

  const getTransform = (visible: boolean): string => {
    if (visible) return 'translateY(0) translateX(0) scale(1)'
    switch (animation) {
      case 'fade-up':
      case 'blur-up':
        return `translateY(${distance}px)`
      case 'fade-down':
        return `translateY(-${distance}px)`
      case 'fade-left':
        return `translateX(${distance}px)`
      case 'fade-right':
        return `translateX(-${distance}px)`
      case 'scale':
        return 'scale(0.85)'
      default:
        return 'translateY(0)'
    }
  }

  const getFilter = (visible: boolean): string => {
    if (animation === 'blur-up') {
      return visible ? 'blur(0px)' : 'blur(8px)'
    }
    return 'blur(0px)'
  }

  const easingCurve = getEasing()

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={childClassName}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: getTransform(isVisible),
            filter: getFilter(isVisible),
            transition: `
              opacity ${duration}ms ${easingCurve} ${index * staggerDelay}ms,
              transform ${duration}ms ${easingCurve} ${index * staggerDelay}ms,
              filter ${duration}ms ${easingCurve} ${index * staggerDelay}ms
            `.trim(),
            willChange: 'opacity, transform, filter',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Parallax section component
interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  speed?: number // -1 to 1, negative = slower, positive = faster
  style?: CSSProperties
}

export function ParallaxSection({
  children,
  className = '',
  speed = 0.5,
  style,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const elementCenter = rect.top + rect.height / 2
      const viewportCenter = windowHeight / 2
      const distance = elementCenter - viewportCenter
      setOffset(distance * speed * 0.1)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        transition: 'transform 0.1s linear',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
