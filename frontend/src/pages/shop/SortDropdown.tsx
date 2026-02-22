import { ChevronDownIcon } from '@heroicons/react/24/outline'

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'bestseller', label: 'Bestsellers' },
]

interface SortDropdownProps {
  sort: string
  onChange: (value: string) => void
}

export default function SortDropdown({ sort, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-dark-500 dark:text-dark-400 hidden sm:inline">Sort by:</span>
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent pr-8 py-2 text-sm font-medium text-dark-900 dark:text-white cursor-pointer focus:outline-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-dark-800">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400" />
      </div>
    </div>
  )
}
