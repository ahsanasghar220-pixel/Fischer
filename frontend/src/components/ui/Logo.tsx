import { useEffect, useState } from 'react'

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto'
  className?: string
  width?: number
  height?: number
}

export default function Logo({
  variant = 'auto',
  className = '',
  width,
  height
}: LogoProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Determine which logo to show
  // light logo = yellow + white text (for dark backgrounds)
  // dark logo = yellow + black text (for light backgrounds)
  const showLightVersion = variant === 'light' || (variant === 'auto' && isDarkMode)
  const logoSrc = showLightVersion ? '/images/logo-light.png' : '/images/logo-dark.png'

  return (
    <img
      src={logoSrc}
      alt="Fischer Electronics"
      className={className}
      width={width}
      height={height}
    />
  )
}
