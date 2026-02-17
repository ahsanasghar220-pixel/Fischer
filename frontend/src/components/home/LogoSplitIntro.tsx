import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LogoSplitIntroProps {
  onComplete: () => void
  skipOnRepeatVisit?: boolean
}

const letters = ['F', 'I', 'S', 'C', 'H', 'E', 'R']

export default function LogoSplitIntro({ onComplete, skipOnRepeatVisit = true }: LogoSplitIntroProps) {
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'complete'>('initial')
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

    // Elegant, measured animation sequence
    const timers: NodeJS.Timeout[] = []

    // Start reveal animation with slight pause
    timers.push(setTimeout(() => setPhase('reveal'), 100))

    // Hold the reveal, then complete
    timers.push(setTimeout(() => {
      setPhase('complete')
      sessionStorage.setItem('fischer-intro-seen', 'true')
    }, 900))

    // Call onComplete after fade out
    timers.push(setTimeout(() => {
      onComplete()
    }, 1100))

    return () => timers.forEach(t => clearTimeout(t))
  }, [onComplete, skipOnRepeatVisit])

  // Handle skip
  const handleSkip = useCallback(() => {
    sessionStorage.setItem('fischer-intro-seen', 'true')
    setPhase('complete')
    setTimeout(onComplete, 200)
  }, [onComplete])

  // Listen for keypress or click to skip
  useEffect(() => {
    if (!shouldShow) return

    const handleKeyPress = () => handleSkip()
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shouldShow, handleSkip])

  if (!shouldShow) return null

  return (
    <AnimatePresence>
      {phase !== 'complete' && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-dark-950 flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Sleek gradient background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Horizontal line reveal */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ width: 0, x: '-50%' }}
            animate={{
              width: phase === 'reveal' ? '80vw' : 0,
              x: '-50%'
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Letter Animation - Clean reveal */}
          <div className="flex items-center justify-center gap-0.5 md:gap-1">
            {letters.map((letter, i) => (
              <motion.div
                key={i}
                className="relative overflow-hidden"
              >
                {/* Main letter - sleek white */}
                <motion.span
                  className="relative text-5xl md:text-7xl lg:text-8xl font-bold text-white select-none block"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                  initial={{
                    opacity: 0,
                    y: 60,
                    filter: 'blur(10px)',
                  }}
                  animate={{
                    opacity: phase === 'reveal' ? 1 : 0,
                    y: phase === 'reveal' ? 0 : 60,
                    filter: phase === 'reveal' ? 'blur(0px)' : 'blur(10px)',
                  }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {letter}
                </motion.span>

                {/* Subtle shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: phase === 'reveal' ? '200%' : '-100%' }}
                  transition={{
                    duration: 1.2,
                    delay: 0.5 + i * 0.06,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Subtitle - elegant fade */}
          <motion.p
            className="absolute bottom-1/3 text-white/50 text-xs md:text-sm tracking-[0.4em] uppercase font-light"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'reveal' ? 1 : 0,
              y: phase === 'reveal' ? 0 : 10,
            }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            Electronics
          </motion.p>

          {/* Minimal decorative elements - subtle corner accents */}
          <motion.div
            className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-white/30 to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: phase === 'reveal' ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute top-8 left-8 w-px h-16 bg-gradient-to-b from-white/30 to-transparent"
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: phase === 'reveal' ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-16 h-px bg-gradient-to-l from-white/30 to-transparent"
            initial={{ scaleX: 0, originX: 1 }}
            animate={{ scaleX: phase === 'reveal' ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-px h-16 bg-gradient-to-t from-white/30 to-transparent"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: phase === 'reveal' ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Soft ambient glow */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase === 'reveal' ? 1 : 0,
              scale: phase === 'reveal' ? 1 : 0.5,
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Skip hint - minimal */}
          <motion.p
            className="absolute bottom-6 text-white/30 text-xs tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.8 }}
          >
            Press any key to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
