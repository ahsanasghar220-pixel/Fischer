import { useState, useRef, useEffect } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface HelpTooltipProps {
  text: string
}

export default function HelpTooltip({ text }: HelpTooltipProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!show) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [show])

  // Adjust tooltip position to stay in viewport
  useEffect(() => {
    if (!show || !tooltipRef.current) return
    const rect = tooltipRef.current.getBoundingClientRect()
    if (rect.right > window.innerWidth - 8) {
      tooltipRef.current.style.left = 'auto'
      tooltipRef.current.style.right = '0'
    }
    if (rect.left < 8) {
      tooltipRef.current.style.left = '0'
      tooltipRef.current.style.right = 'auto'
    }
  }, [show])

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="p-0.5 text-dark-400 hover:text-dark-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors"
        aria-label="Help"
      >
        <InformationCircleIcon className="w-4 h-4" />
      </button>
      {show && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[280px] px-3 py-2 text-xs text-white bg-dark-800 dark:bg-dark-900 rounded-lg shadow-lg border border-dark-700"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-dark-800 dark:bg-dark-900 rotate-45 border-r border-b border-dark-700" />
          </div>
        </div>
      )}
    </div>
  )
}
