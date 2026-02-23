import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// Thin top progress bar — non-intrusive, feels instant
function TopBar() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    // Quick ramp to 85%, then complete after transition
    const t1 = setTimeout(() => setWidth(85), 50)
    const t2 = setTimeout(() => setWidth(100), 280)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-primary-500 origin-left pointer-events-none"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: width / 100 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    />
  )
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setIsNavigating(true)
    const t = setTimeout(() => setIsNavigating(false), 320)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <>
      <AnimatePresence>
        {isNavigating && <TopBar key={location.pathname} />}
      </AnimatePresence>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </>
  )
}
