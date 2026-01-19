import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

interface FullWidthBannerProps {
  title?: string
  subtitle?: string
  description?: string
  image: string
  imageAlt?: string
  ctaText?: string
  ctaLink?: string
  textPosition?: 'left' | 'center' | 'right'
  overlay?: boolean
  height?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function FullWidthBanner({
  title,
  subtitle,
  description,
  image,
  imageAlt = 'Banner',
  ctaText,
  ctaLink,
  textPosition = 'center',
  overlay = true,
  height = 'lg',
}: FullWidthBannerProps) {
  const heightClasses = {
    sm: 'h-[300px] md:h-[400px]',
    md: 'h-[400px] md:h-[500px]',
    lg: 'h-[500px] md:h-[600px]',
    xl: 'h-[600px] md:h-[700px]',
  }

  const positionClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }

  return (
    <div className={`relative w-full ${heightClasses[height]} overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/70 via-dark-900/50 to-dark-900/70" />
      )}

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`h-full flex flex-col justify-center ${positionClasses[textPosition]} space-y-6`}>
          {subtitle && (
            <p className="text-primary-400 text-sm md:text-base font-semibold tracking-wider uppercase">
              {subtitle}
            </p>
          )}

          {title && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl">
              {title}
            </h1>
          )}

          {description && (
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              {description}
            </p>
          )}

          {ctaText && ctaLink && (
            <div className="pt-4">
              <Link
                to={ctaLink}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-400
                         text-dark-900 font-bold rounded-xl transition-all duration-300
                         hover:scale-105 hover:shadow-xl hover:shadow-primary-500/50"
              >
                {ctaText}
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
