import { Bars3Icon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import SectionPreview from './SectionPreview'
import { SECTION_META } from '../types'
import type { Section } from '../types'

interface SectionCardProps {
  section: Section
  position: number
  totalSections: number
  onToggle: (key: string, enabled: boolean) => void
  onEdit: (section: Section) => void
  onMoveUp: () => void
  onMoveDown: () => void
  isDragging?: boolean
  dragHandleProps?: {
    onDragStart: (e: React.DragEvent) => void
    onDragEnd: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
  }
}

export default function SectionCard({
  section,
  position,
  totalSections,
  onToggle,
  onEdit,
  onMoveUp,
  onMoveDown,
  isDragging,
  dragHandleProps,
}: SectionCardProps) {
  const meta = SECTION_META[section.key]
  const label = meta?.label || section.title || section.key
  const description = meta?.description || section.subtitle || `Configure the ${section.key} section`

  return (
    <div
      className={`group relative bg-white dark:bg-dark-800 rounded-xl border-2 transition-all duration-200 ${
        isDragging
          ? 'border-primary-400 dark:border-primary-500 opacity-50 scale-[0.98]'
          : section.is_enabled
            ? 'border-dark-200 dark:border-dark-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg'
            : 'border-dark-200 dark:border-dark-700 opacity-60'
      }`}
      draggable
      {...dragHandleProps}
    >
      {/* Header with position + drag handle + toggle */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="cursor-grab active:cursor-grabbing p-1 text-dark-300 dark:text-dark-600 hover:text-dark-500 dark:hover:text-dark-400"
            title="Drag to reorder"
          >
            <Bars3Icon className="w-4 h-4" />
          </div>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-dark-100 dark:bg-dark-700 text-xs font-semibold text-dark-500 dark:text-dark-400">
            #{position}
          </span>
          <h3 className="font-semibold text-dark-900 dark:text-white text-sm">{label}</h3>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(section.key, !section.is_enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            section.is_enabled ? 'bg-green-500' : 'bg-dark-300 dark:bg-dark-600'
          }`}
          title={section.is_enabled ? 'Visible on homepage' : 'Hidden from homepage'}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              section.is_enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Preview thumbnail */}
      <div className="px-4 py-2">
        <SectionPreview sectionKey={section.key} />
      </div>

      {/* Description */}
      <div className="px-4 pb-2">
        <p className="text-xs text-dark-500 dark:text-dark-400 line-clamp-2">{description}</p>
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1">
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={position === 1}
            className="p-1.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
            title="Move up"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={position === totalSections}
            className="p-1.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
            title="Move down"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onEdit(section)}
          className="px-4 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          Customize
        </button>
      </div>
    </div>
  )
}
