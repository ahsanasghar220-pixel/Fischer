import { useState } from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'

interface BundlesEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string }) => void
  isPending: boolean
}

export default function BundlesEditor({ section, open, onClose, onSave, isPending }: BundlesEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.bundles.label}
      description={SECTION_META.bundles.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={() => onSave(section.key, { title, subtitle })} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {isPending && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FormField label="Section Title" tooltip="The heading for the bundles section on the homepage.">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Bundle Deals" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Subtitle" tooltip="Supporting text below the heading.">
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} placeholder="Save more with our curated product bundles" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        {/* Info panel */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Managing Bundle Products</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            The actual bundle products are managed from the dedicated Bundles management page.
            You can create, edit, and delete bundles there.
          </p>
          <a
            href="/admin/bundles"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            Go to Bundles Management
          </a>
        </div>
      </div>
    </EditorPanel>
  )
}
