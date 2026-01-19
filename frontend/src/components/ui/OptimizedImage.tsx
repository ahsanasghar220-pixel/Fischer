import { useState, useEffect, useRef } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean // Load immediately, don't lazy load
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * Optimized image component with lazy loading and blur-up effect
 * Only loads images when they're near the viewport
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (priority) return // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder - shown while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-dark-100 to-dark-50 dark:from-dark-800 dark:to-dark-900 animate-pulse"
          style={{
            aspectRatio: width && height ? `${width} / ${height}` : undefined,
          }}
        />
      )}

      {/* Actual image - only load when in view or priority */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setIsLoaded(true)}
        onError={onError}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          // GPU acceleration for smooth fade-in
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />
    </div>
  )
}
