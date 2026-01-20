import { motion, useMotionValue } from 'framer-motion'
import { useState } from 'react'

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
  const [hoveredClient, setHoveredClient] = useState<number | null>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Only show clients with logos
  const clientsWithLogos = clients.filter(c => c.logo)

  if (clientsWithLogos.length === 0) return null

  const durations = { slow: 40, medium: 30, fast: 20 }
  const duration = durations[speed]

  // Calculate animation distance based on number of clients
  const itemWidth = 160 // w-40 = 10rem = 160px
  const gap = 64 // gap-16 = 4rem = 64px
  const totalWidth = clientsWithLogos.length * (itemWidth + gap)

  // Duplicate clients for seamless loop
  const duplicatedClients = [...clientsWithLogos, ...clientsWithLogos]

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-dark-900 border-y border-gray-200 dark:border-dark-800 overflow-hidden relative">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(244,180,44,0.1) 0%, transparent 70%)'
        }}
        animate={{
          background: [
            'radial-gradient(circle at 30% 50%, rgba(244,180,44,0.1) 0%, transparent 70%)',
            'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)',
            'radial-gradient(circle at 30% 50%, rgba(244,180,44,0.1) 0%, transparent 70%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto mb-8 relative z-10">
        <motion.p
          className="text-center text-gray-500 dark:text-dark-400 text-sm uppercase tracking-wider font-medium"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Trusted by Leading Organizations
        </motion.p>
      </div>

      {/* Infinite Marquee with wave effect */}
      <div
        className="relative"
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className="flex gap-16 items-center"
          animate={{ x: [0, -totalWidth] }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {duplicatedClients.map((client, i) => {
            const isHovered = hoveredClient === i

            return (
              <motion.div
                key={`${client.id}-${i}`}
                className="flex-shrink-0 w-40 h-16 flex items-center justify-center perspective-1000"
                onMouseEnter={() => setHoveredClient(i)}
                onMouseLeave={() => setHoveredClient(null)}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                {client.logo && (
                  <motion.div
                    className="relative w-full h-full"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Card flip effect */}
                    <motion.div
                      className="relative w-full h-full"
                      animate={{
                        rotateY: isHovered ? 180 : 0,
                      }}
                      transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front side */}
                      <motion.div
                        className="absolute inset-0 backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <motion.img
                          src={client.logo}
                          alt={client.name}
                          className="w-full h-full object-contain transition-all duration-300 cursor-pointer"
                          style={{
                            filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
                            opacity: isHovered ? 1 : 0.6
                          }}
                          whileHover={{
                            scale: 1.1,
                            rotateZ: [0, -2, 2, 0],
                            filter: 'drop-shadow(0 8px 16px rgba(244,180,44,0.3))'
                          }}
                          title={client.name}
                        />

                        {/* Glow effect on hover */}
                        {isHovered && (
                          <motion.div
                            className="absolute inset-0 rounded-lg"
                            style={{
                              background: 'radial-gradient(circle, rgba(244,180,44,0.2) 0%, transparent 70%)',
                              filter: 'blur(20px)'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </motion.div>

                      {/* Back side */}
                      <motion.div
                        className="absolute inset-0 backface-hidden flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <p className="text-white font-semibold text-sm text-center px-2">
                          {client.name}
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Enhanced fade edges with glow */}
        <motion.div
          className="absolute inset-y-0 left-0 w-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(249,250,251,1), rgba(249,250,251,0.8), transparent)'
          }}
          animate={{
            background: [
              'linear-gradient(to right, rgba(249,250,251,1), rgba(249,250,251,0.8), transparent)',
              'linear-gradient(to right, rgba(249,250,251,1), rgba(244,180,44,0.05), transparent)',
              'linear-gradient(to right, rgba(249,250,251,1), rgba(249,250,251,0.8), transparent)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-y-0 right-0 w-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(249,250,251,1), rgba(249,250,251,0.8), transparent)'
          }}
          animate={{
            background: [
              'linear-gradient(to left, rgba(249,250,251,1), rgba(249,250,251,0.8), transparent)',
              'linear-gradient(to left, rgba(249,250,251,1), rgba(244,180,44,0.05), transparent)',
              'linear-gradient(to left, rgba(249,250,251,1), rgba(249,250,251,0.8), transparent)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />

        {/* Spotlight effect that follows cursor */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle 150px at ${mouseX.get()}px ${mouseY.get()}px, rgba(244,180,44,0.15), transparent 80%)`
          }}
        />
      </div>
    </section>
  )
}
