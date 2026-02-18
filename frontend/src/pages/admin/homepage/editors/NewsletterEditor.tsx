import { useState } from 'react'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'

interface NewsletterEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string; settings?: Record<string, any> }) => void
  isPending: boolean
}

export default function NewsletterEditor({ section, open, onClose, onSave, isPending }: NewsletterEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [placeholder, setPlaceholder] = useState(section.settings?.placeholder || 'Enter your email address')
  const [buttonText, setButtonText] = useState(section.settings?.button_text || 'Subscribe')
  const [disclaimer, setDisclaimer] = useState(section.settings?.disclaimer || 'No spam, unsubscribe anytime.')

  const handleSave = () => {
    onSave(section.key, {
      title,
      subtitle,
      settings: {
        ...section.settings,
        placeholder,
        button_text: buttonText,
        disclaimer,
      },
    })
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.newsletter.label}
      description={SECTION_META.newsletter.editorDescription}
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
            onClick={handleSave}
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
          tooltip="Main heading displayed in the newsletter section."
          helpText="Example: 'Get Exclusive Offers'"
        >
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Get Exclusive Offers"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        <FormField
          label="Subtitle"
          tooltip="Supporting text below the heading that encourages visitors to subscribe."
        >
          <textarea
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            rows={3}
            placeholder="Subscribe to get exclusive offers, new product announcements, and tips for your home appliances."
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Input Placeholder"
            tooltip="Placeholder text shown inside the email input field."
          >
            <input
              type="text"
              value={placeholder}
              onChange={e => setPlaceholder(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </FormField>

          <FormField
            label="Button Text"
            tooltip="Label on the subscribe button."
          >
            <input
              type="text"
              value={buttonText}
              onChange={e => setButtonText(e.target.value)}
              placeholder="Subscribe"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </FormField>
        </div>

        <FormField
          label="Disclaimer Text"
          tooltip="Small text below the form reassuring visitors about privacy."
          helpText="Example: 'No spam, unsubscribe anytime.'"
        >
          <input
            type="text"
            value={disclaimer}
            onChange={e => setDisclaimer(e.target.value)}
            placeholder="No spam, unsubscribe anytime."
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        {/* Live preview */}
        <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-6 bg-dark-50 dark:bg-dark-900">
          <p className="text-xs text-dark-400 dark:text-dark-500 mb-4 uppercase tracking-wider font-medium">Preview</p>
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-dark-900 dark:text-white">{title || 'Get Exclusive Offers'}</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 max-w-sm mx-auto">
              {subtitle || 'Subscribe to get exclusive offers and new product announcements.'}
            </p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                readOnly
                placeholder={placeholder || 'Enter your email address'}
                className="flex-1 px-3 py-2 text-sm border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-400 dark:text-dark-500 cursor-not-allowed"
              />
              <button
                type="button"
                disabled
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg opacity-80 cursor-not-allowed"
              >
                {buttonText || 'Subscribe'}
              </button>
            </div>
            {disclaimer && (
              <p className="text-xs text-dark-400 dark:text-dark-500">{disclaimer}</p>
            )}
          </div>
        </div>
      </div>
    </EditorPanel>
  )
}
