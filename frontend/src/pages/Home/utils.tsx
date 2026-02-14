import { useRef, useState, useEffect } from 'react'
import {
  StarIcon,
  CheckCircleIcon,
  CubeIcon,
  FireIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PhoneIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

// Icon mapping for features
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  StarIcon,
  CheckCircleIcon,
  CubeIcon,
  FireIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PhoneIcon,
  BoltIcon,
  SparklesIcon,
}

// Color mapping for features
export const colorMap: Record<string, { gradient: string; bg: string; text: string }> = {
  blue: { gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-500/10', text: '#3b82f6' },
  emerald: { gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10', text: '#10b981' },
  purple: { gradient: 'from-purple-500 to-pink-400', bg: 'bg-purple-500/10', text: '#a855f7' },
  orange: { gradient: 'from-orange-500 to-red-400', bg: 'bg-orange-500/10', text: '#f97316' },
  primary: { gradient: 'from-primary-500 to-primary-400', bg: 'bg-primary-500/10', text: '#951212' },
  red: { gradient: 'from-primary-500 to-primary-600', bg: 'bg-primary-500/10', text: '#951212' },
  green: { gradient: 'from-green-500 to-emerald-400', bg: 'bg-green-500/10', text: '#22c55e' },
  cyan: { gradient: 'from-cyan-500 to-blue-400', bg: 'bg-cyan-500/10', text: '#06b6d4' },
}

export function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [displayValue, setDisplayValue] = useState('0')

  // Use Intersection Observer instead of framer-motion
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return

    // Extract numeric value - handle formats like "35+", "500K+", "1M+"
    const numericValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    const hasPlus = value.includes('+')
    const hasK = value.toUpperCase().includes('K')
    const hasM = value.toUpperCase().includes('M')

    // If numeric value is 0, just show the original value immediately
    if (numericValue === 0) {
      setDisplayValue(value)
      return
    }

    const duration = 2000
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function for smooth deceleration
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)

      // Use Math.round and ensure we hit the final value
      const currentValue = progress >= 1 ? numericValue : Math.round(easeOutExpo * numericValue)

      let formatted = currentValue.toString()
      if (hasK) formatted = currentValue + 'K'
      if (hasM) formatted = currentValue + 'M'
      if (hasPlus) formatted += '+'

      setDisplayValue(formatted)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        // Ensure final value is set correctly
        let finalFormatted = numericValue.toString()
        if (hasK) finalFormatted = numericValue + 'K'
        if (hasM) finalFormatted = numericValue + 'M'
        if (hasPlus) finalFormatted += '+'
        setDisplayValue(finalFormatted)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, value])

  return <span ref={ref}>{displayValue}{suffix}</span>
}
