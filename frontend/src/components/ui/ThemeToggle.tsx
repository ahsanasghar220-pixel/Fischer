import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useRef, useEffect } from 'react'

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'dropdown'
  className?: string
}

export default function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300
                   bg-dark-200 dark:bg-dark-700 ${className}`}
        aria-label="Toggle theme"
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-all duration-300
                     flex items-center justify-center
                     ${resolvedTheme === 'dark' ? 'translate-x-7 bg-primary-500' : 'translate-x-0 bg-white shadow-md'}`}
        >
          {resolvedTheme === 'dark' ? (
            <MoonIcon className="w-3 h-3 text-dark-900" />
          ) : (
            <SunIcon className="w-3 h-3 text-primary-600" />
          )}
        </span>
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-dark-100 dark:bg-dark-800
                     hover:bg-dark-200 dark:hover:bg-dark-700
                     text-dark-600 dark:text-dark-300
                     transition-all duration-200"
          aria-label="Theme options"
        >
          {resolvedTheme === 'dark' ? (
            <MoonIcon className="w-5 h-5" />
          ) : (
            <SunIcon className="w-5 h-5" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-40 py-1
                         bg-white dark:bg-dark-800 rounded-xl shadow-xl
                         border border-dark-100 dark:border-dark-700
                         animate-fade-in-down z-50">
            <button
              onClick={() => { setTheme('light'); setIsOpen(false) }}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3
                        hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors
                        ${theme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-dark-700 dark:text-dark-200'}`}
            >
              <SunIcon className="w-4 h-4" />
              Light
              {theme === 'light' && <span className="ml-auto text-primary-500">✓</span>}
            </button>
            <button
              onClick={() => { setTheme('dark'); setIsOpen(false) }}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3
                        hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors
                        ${theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-dark-700 dark:text-dark-200'}`}
            >
              <MoonIcon className="w-4 h-4" />
              Dark
              {theme === 'dark' && <span className="ml-auto text-primary-500">✓</span>}
            </button>
            <button
              onClick={() => { setTheme('system'); setIsOpen(false) }}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3
                        hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors
                        ${theme === 'system' ? 'text-primary-600 dark:text-primary-400' : 'text-dark-700 dark:text-dark-200'}`}
            >
              <ComputerDesktopIcon className="w-4 h-4" />
              System
              {theme === 'system' && <span className="ml-auto text-primary-500">✓</span>}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Default button variant
  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl transition-all duration-300
                 bg-dark-100 dark:bg-dark-800
                 hover:bg-dark-200 dark:hover:bg-dark-700
                 hover:scale-110 active:scale-95
                 text-dark-600 dark:text-dark-300 ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <SunIcon
          className={`w-5 h-5 absolute inset-0 transition-all duration-300
                     ${resolvedTheme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
        />
        <MoonIcon
          className={`w-5 h-5 absolute inset-0 transition-all duration-300
                     ${resolvedTheme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        />
      </div>
    </button>
  )
}
