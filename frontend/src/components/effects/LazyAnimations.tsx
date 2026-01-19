import { lazy, Suspense } from 'react'

// Lazy load framer-motion components to reduce initial bundle size
const LazyHoverCard = lazy(() =>
  import('./ScrollReveal').then((mod) => ({ default: mod.HoverCard }))
)

// Wrapper with fallback
export function HoverCard({
  children,
  intensity = 5,
  className = '',
}: {
  children: React.ReactNode
  intensity?: number
  className?: string
}) {
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <LazyHoverCard intensity={intensity} className={className}>
        {children}
      </LazyHoverCard>
    </Suspense>
  )
}
