import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// Loading indicator component
function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-dark-950/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo spinner */}
        <motion.div
          className="relative w-20 h-20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/30"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          />

          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />

          {/* Logo/Icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-amber-500"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="text-sm font-medium text-dark-600 dark:text-dark-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Loading...
        </motion.p>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Page transition wrapper
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip transition on first render (initial page load)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Show loader when location changes
    setIsLoading(true)

    // Hide loader after short delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <PageLoader key="loader" />}
      </AnimatePresence>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
        {children}
      </motion.div>
    </>
  )
}

// Alternative: Sliding page transition
export function SlidingPageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [prevLocation, setPrevLocation] = useState(location.pathname)

  useEffect(() => {
    if (location.pathname !== prevLocation) {
      setIsLoading(true)
      setPrevLocation(location.pathname)

      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [location.pathname, prevLocation])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <PageLoader key="loader" />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

// Progress bar transition
export function ProgressBarTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 50)

    // Complete after page loads
    const completeTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimer)
    }
  }, [location.pathname])

  return (
    <>
      {/* Progress bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-primary-500 via-amber-500 to-primary-500"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: progress / 100 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  )
}
