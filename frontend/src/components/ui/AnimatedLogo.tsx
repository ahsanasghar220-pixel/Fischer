import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedLogoProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  loading?: 'eager' | 'lazy'
  decoding?: 'async' | 'auto' | 'sync'
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

export default function AnimatedLogo({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'eager',
  decoding = 'async',
  onError,
}: AnimatedLogoProps) {
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Check if animation has already played in this session
    const animated = sessionStorage.getItem('logo-animated')
    if (animated) {
      setHasAnimated(true)
    }
  }, [])

  const handleAnimationComplete = () => {
    setHasAnimated(true)
    sessionStorage.setItem('logo-animated', 'true')
  }

  // If already animated, show logo without animation
  if (hasAnimated) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        className={className}
        onError={onError}
        {...({ fetchpriority: loading === 'eager' ? 'high' : undefined } as any)}
      />
    )
  }

  return (
    <div className="relative overflow-hidden" style={{ width: 'auto', height: 'auto' }}>
      {/* Left half of logo */}
      <motion.div
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
        }}
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2,
        }}
        onAnimationComplete={handleAnimationComplete}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          className={className}
          onError={onError}
          {...({ fetchpriority: loading === 'eager' ? 'high' : undefined } as any)}
        />
      </motion.div>

      {/* Right half of logo */}
      <motion.div
        className="relative"
        style={{
          clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
        }}
        initial={{ x: 120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2,
        }}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          className={className}
          {...({ fetchpriority: loading === 'eager' ? 'high' : undefined } as any)}
        />
      </motion.div>
    </div>
  )
}
