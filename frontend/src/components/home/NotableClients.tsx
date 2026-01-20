import { useRef, useState } from 'react'

interface Client {
  id: number
  name: string
  logo: string | null
  website: string | null
}

interface NotableClientsProps {
  clients: Client[]
  speed?: 'slow' | 'medium' | 'fast'
}

export default function NotableClients({ clients, speed = 'medium' }: NotableClientsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Only show clients with logos
  const clientsWithLogos = clients.filter(c => c.logo)

  if (clientsWithLogos.length === 0) return null

  const durations = { slow: 50, medium: 35, fast: 20 }
  const duration = durations[speed]

  // Duplicate for seamless loop
  const duplicatedClients = [...clientsWithLogos, ...clientsWithLogos, ...clientsWithLogos]

  return (
    <section className="py-16 bg-white dark:bg-dark-900 overflow-hidden relative">
      {/* Subtle top/bottom borders */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dark-200 dark:via-dark-700 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-dark-200 dark:via-dark-700 to-transparent" />

      {/* Section Header */}
      <div className="container mx-auto mb-12 text-center">
        <p className="text-dark-400 dark:text-dark-500 text-sm uppercase tracking-[0.2em] font-medium">
          Trusted by Leading Organizations
        </p>
      </div>

      {/* Logo Strip */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Scrolling Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-16 md:gap-24"
          style={{
            animation: `scroll ${duration}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {duplicatedClients.map((client, i) => (
            <div
              key={`${client.id}-${i}`}
              className="flex-shrink-0 group"
            >
              {client.logo && (
                <div className="relative px-6 py-4">
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="h-10 md:h-12 w-auto object-contain
                             opacity-40 grayscale
                             group-hover:opacity-100 group-hover:grayscale-0
                             transition-all duration-500 ease-out"
                    title={client.name}
                  />

                  {/* Hover tooltip */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2
                                opacity-0 group-hover:opacity-100
                                transition-all duration-300 pointer-events-none">
                    <span className="text-xs font-medium text-dark-500 dark:text-dark-400 whitespace-nowrap">
                      {client.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fade edges - Light mode */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent pointer-events-none dark:hidden" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent pointer-events-none dark:hidden" />

        {/* Fade edges - Dark mode */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-dark-900 to-transparent pointer-events-none hidden dark:block" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-dark-900 to-transparent pointer-events-none hidden dark:block" />
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  )
}
