import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LogoSplitIntroProps {
  onComplete: () => void
  skipOnRepeatVisit?: boolean
}

const letters = ['F', 'I', 'S', 'C', 'H', 'E', 'R']

export default function LogoSplitIntro({ onComplete, skipOnRepeatVisit = true }: LogoSplitIntroProps) {
  const [phase, setPhase] = useState<'initial' | 'split' | 'reassemble' | 'complete'>('initial')
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    // Check if user has seen the intro before
    if (skipOnRepeatVisit) {
      const hasSeenIntro = sessionStorage.getItem('fischer-intro-seen')
      if (hasSeenIntro) {
        setShouldShow(false)
        onComplete()
        return
      }
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setShouldShow(false)
      onComplete()
      return
    }

    // Animation sequence
    const timers: NodeJS.Timeout[] = []

    // Start split animation
    timers.push(setTimeout(() => setPhase('split'), 300))

    // Start reassemble
    timers.push(setTimeout(() => setPhase('reassemble'), 1200))

    // Complete and fade out
    timers.push(setTimeout(() => {
      setPhase('complete')
      sessionStorage.setItem('fischer-intro-seen', 'true')
    }, 2200))

    // Call onComplete after fade out
    timers.push(setTimeout(() => {
      onComplete()
    }, 2800))

    return () => timers.forEach(t => clearTimeout(t))
  }, [onComplete, skipOnRepeatVisit])

  // Handle skip
  const handleSkip = () => {
    sessionStorage.setItem('fischer-intro-seen', 'true')
    setPhase('complete')
    setTimeout(onComplete, 300)
  }

  // Listen for keypress or click to skip
  useEffect(() => {
    if (!shouldShow) return

    const handleKeyPress = () => handleSkip()
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shouldShow])

  if (!shouldShow) return null

  return (
    <AnimatePresence>
      {phase !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-dark-950 flex items-center justify-center cursor-pointer"
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Letter Animation with 3D effects */}
          <div className="flex items-center justify-center gap-1 md:gap-2 perspective-1000">
            {letters.map((letter, i) => (
              <motion.div key={i} className="relative">
                {/* 3D Shadow layers */}
                <motion.span
                  className="absolute text-5xl md:text-7xl lg:text-8xl font-bold text-primary-600/20 select-none"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    transform: 'translateZ(-10px)',
                    filter: 'blur(2px)'
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                  animate={{
                    opacity: phase === 'split' ? 0.3 : 0,
                    scale: 1,
                    x: phase === 'split' ? (i - 3) * (window.innerWidth > 768 ? 60 : 30) + 5 : 5,
                    y: phase === 'split' ? Math.sin(i * 0.8) * 40 + 5 : 5,
                    rotate: phase === 'split' ? (i - 3) * 12 : 0,
                  }}
                  transition={{
                    duration: phase === 'initial' ? 0.4 : 0.6,
                    delay: phase === 'initial' ? i * 0.08 : 0,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  {letter}
                </motion.span>

                {/* Main letter with glow */}
                <motion.span
                  className="relative text-5xl md:text-7xl lg:text-8xl font-bold text-primary-500 select-none"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: '0 0 20px rgba(244,180,44,0.5), 0 0 40px rgba(244,180,44,0.3)',
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                    rotateY: -180,
                  }}
                  animate={{
                    opacity: 1,
                    scale: phase === 'split' ? [1, 1.2, 1] : 1,
                    x: phase === 'split' ? (i - 3) * (window.innerWidth > 768 ? 60 : 30) : 0,
                    y: phase === 'split' ? Math.sin(i * 0.8) * 40 : 0,
                    rotate: phase === 'split' ? (i - 3) * 12 : 0,
                    rotateY: 0,
                    textShadow: phase === 'split'
                      ? '0 0 30px rgba(244,180,44,0.8), 0 0 60px rgba(244,180,44,0.5), 0 0 90px rgba(244,180,44,0.3)'
                      : '0 0 20px rgba(244,180,44,0.5), 0 0 40px rgba(244,180,44,0.3)',
                  }}
                  transition={{
                    duration: phase === 'initial' ? 0.4 : 0.6,
                    delay: phase === 'initial' ? i * 0.08 : 0,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  {letter}
                </motion.span>

                {/* Particle burst on split */}
                {phase === 'split' && (
                  <>
                    {[...Array(8)].map((_, j) => (
                      <motion.div
                        key={j}
                        className="absolute w-1 h-1 bg-primary-400 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: Math.cos((j / 8) * Math.PI * 2) * 50,
                          y: Math.sin((j / 8) * Math.PI * 2) * 50,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.05,
                          ease: 'easeOut'
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            className="absolute bottom-1/3 text-dark-400 text-sm md:text-base tracking-[0.3em] uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase === 'reassemble' ? 1 : 0,
              y: phase === 'reassemble' ? 0 : 20,
            }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Electronics
          </motion.p>

          {/* Skip hint */}
          <motion.p
            className="absolute bottom-8 text-dark-600 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
          >
            Click or press any key to skip
          </motion.p>

          {/* Enhanced Decorative elements */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'split' ? 0.2 : 0 }}
          >
            {/* Radial lines with glow */}
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-px h-[200vh] origin-center"
                style={{
                  rotate: `${i * 15}deg`,
                  background: `linear-gradient(to bottom, transparent, rgba(244,180,44,${0.3 - i * 0.01}), transparent)`,
                  boxShadow: '0 0 10px rgba(244,180,44,0.5)'
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: phase === 'split' ? 1 : 0,
                  opacity: phase === 'split' ? 1 : 0
                }}
                transition={{ duration: 0.5, delay: i * 0.01 }}
              />
            ))}

            {/* Light rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute top-1/2 left-1/2 w-2 h-[150vh] origin-center"
                style={{
                  rotate: `${i * 45}deg`,
                  background: 'linear-gradient(to bottom, transparent, rgba(244,180,44,0.2), transparent)',
                  filter: 'blur(10px)'
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: phase === 'split' ? [0, 1, 0] : 0,
                  opacity: phase === 'split' ? [0, 0.5, 0] : 0,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.3 + i * 0.05,
                  repeat: phase === 'split' ? Infinity : 0,
                  repeatDelay: 1
                }}
              />
            ))}
          </motion.div>

          {/* Multiple glow layers for depth */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(244,180,44,0.4) 0%, rgba(244,180,44,0.2) 40%, transparent 70%)',
            }}
            animate={{
              scale: phase === 'split' ? [1, 1.8, 1] : 1,
              opacity: phase === 'split' ? [0.4, 0.7, 0.4] : 0.2,
            }}
            transition={{ duration: 1.5, repeat: phase === 'split' ? Infinity : 0 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 60%)',
            }}
            animate={{
              scale: phase === 'split' ? [1, 1.5, 1] : 1,
              opacity: phase === 'split' ? [0.3, 0.5, 0.3] : 0.1,
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: phase === 'split' ? Infinity : 0 }}
          />

          {/* Screen shake effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={phase === 'split' ? {
              x: [0, -2, 2, -2, 2, 0],
              y: [0, 2, -2, 2, -2, 0],
            } : {}}
            transition={{
              duration: 0.4,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              repeat: phase === 'split' ? 2 : 0
            }}
          />

          {/* Floating particles */}
          {phase === 'split' && [...Array(30)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 3 === 0 ? '#f4b42c' : i % 3 === 1 ? '#3b82f6' : '#10b981'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -100],
                x: [0, (Math.random() - 0.5) * 100]
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 2
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
