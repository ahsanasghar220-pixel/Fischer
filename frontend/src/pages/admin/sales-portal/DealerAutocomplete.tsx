import { useState, useRef, useEffect } from 'react'
import api from '@/lib/api'

export interface DealerSuggestion {
  name: string
  city: string
}

interface DealerAutocompleteProps {
  value: string
  onChange: (name: string) => void
  onSelectDealer: (dealer: DealerSuggestion) => void
  placeholder?: string
  inputClassName: string
}

export default function DealerAutocomplete({
  value,
  onChange,
  onSelectDealer,
  placeholder = 'Enter dealer / shop name',
  inputClassName,
}: DealerAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<DealerSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/production/dealers?q=${encodeURIComponent(q)}`)
        setSuggestions(res.data.data || [])
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 250)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    onChange(v)
    fetchSuggestions(v)
  }

  const handleFocus = () => {
    fetchSuggestions(value)
  }

  const handleSelect = (dealer: DealerSuggestion) => {
    onSelectDealer(dealer)
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((d, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(d)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</span>
                {d.city && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">{d.city}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
