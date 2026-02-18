import { useState } from 'react'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'

interface BrandStatementEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string }) => void
  isPending: boolean
}

export default function BrandStatementEditor({ section, open, onClose, onSave, isPending }: BrandStatementEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.brand_statement.label}
      description={SECTION_META.brand_statement.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(section.key, { title, subtitle })}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FormField
          label="Heading"
          required
          tooltip="Large centered heading displayed prominently below the hero video."
          helpText="Keep under 5 words. Example: 'Premium Appliances'"
        >
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Premium Appliances"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-lg font-medium"
          />
        </FormField>

        <FormField
          label="Tagline"
          tooltip="Smaller text displayed below the heading."
          helpText="Example: 'Crafted for Pakistan Since 1990'"
        >
          <textarea
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            rows={2}
            placeholder="Crafted for Pakistan Since 1990"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        {/* Live preview */}
        <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-6 bg-dark-50 dark:bg-dark-900">
          <p className="text-xs text-dark-400 dark:text-dark-500 mb-3 uppercase tracking-wider font-medium">Preview</p>
          <div className="text-center">
            <h3 className="text-xl font-bold text-dark-900 dark:text-white">{title || 'Your Heading Here'}</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{subtitle || 'Your tagline here'}</p>
          </div>
        </div>
      </div>
    </EditorPanel>
  )
}
