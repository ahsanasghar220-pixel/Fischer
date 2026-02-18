import { useEffect } from 'react'
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface EditorPanelProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  sectionKey?: string
}

export default function EditorPanel({ open, onClose, title, description, children, footer, sectionKey }: EditorPanelProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  // Build homepage section URL
  const siteUrl = window.location.origin.replace(/:\d+$/, '')
  const homepageUrl = siteUrl.includes('localhost') ? 'http://localhost:5173' : siteUrl

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-white dark:bg-dark-800 shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-dark-200 dark:border-dark-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">{title}</h2>
            <div className="flex items-center gap-2">
              {sectionKey && (
                <a
                  href={homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-dark-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 border border-dark-200 dark:border-dark-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  View on website
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          {description && (
            <p className="mt-2 text-sm text-dark-500 dark:text-dark-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30 rounded-lg px-3 py-2">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-dark-200 dark:border-dark-700 px-6 py-4 bg-dark-50 dark:bg-dark-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
