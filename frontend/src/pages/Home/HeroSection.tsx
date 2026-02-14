import { useState } from 'react'

interface HeroSectionProps {
  heroVideoUrl: string
}

export default function HeroSection({ heroVideoUrl }: HeroSectionProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  return (
    <section className="relative h-[50vh] min-h-[450px] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] xl:h-screen w-full overflow-hidden bg-dark-950">
      {/* Loading placeholder - shows gradient while video loads */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950/30 transition-opacity duration-700 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Animated gradient shimmer while loading */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Video Error Fallback */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-950/40 to-dark-950" />
      )}

      {/* Video Background - zoomed out on mobile, cover on desktop */}
      {!videoError && (
        <video
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          } object-contain sm:object-cover object-center`}
          style={{
            objectPosition: 'center center',
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => {
            setVideoError(true)
            setVideoLoaded(true)
          }}
        >
          <source src={heroVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Subtle overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950/30 via-transparent to-dark-950/60" />

      {/* Scroll Indicator - Hidden on mobile to save space */}
      <div className="hidden sm:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-white">
          <span className="text-sm font-medium tracking-wider opacity-80">Scroll</span>
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
