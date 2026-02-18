import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'

interface AboutEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string; settings: Record<string, any> }) => void
  isPending: boolean
}

export default function AboutEditor({ section, open, onClose, onSave, isPending }: AboutEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [badgeText, setBadgeText] = useState(section.settings?.badge_text || '')
  const [content, setContent] = useState(section.settings?.content || '')
  const [image, setImage] = useState(section.settings?.image || '')
  const [fallbackImage, setFallbackImage] = useState(section.settings?.fallback_image || '')
  const [buttonText, setButtonText] = useState(section.settings?.button_text || '')
  const [buttonLink, setButtonLink] = useState(section.settings?.button_link || '')
  const [features, setFeatures] = useState<string[]>(section.settings?.features || [])

  const handleSave = () => {
    onSave(section.key, {
      title,
      subtitle,
      settings: {
        ...section.settings,
        badge_text: badgeText,
        content,
        image,
        fallback_image: fallbackImage,
        button_text: buttonText,
        button_link: buttonLink,
        features,
      },
    })
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.about.label}
      description={SECTION_META.about.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {isPending && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FormField label="Badge Text" tooltip="Small label shown above the heading." helpText="Example: 'About Fischer'">
          <input type="text" value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="About Fischer" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Title" tooltip="The main heading of the about section.">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Our Story" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Subtitle" tooltip="Supporting text below the heading.">
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} placeholder="A brief subtitle" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Content" tooltip="The main body text of the about section." helpText="Write 2-3 paragraphs about your company story.">
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Tell your company story here..." className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Image URL" tooltip="Main image for the about section. Recommended: square or landscape format." helpText="Example: /images/about-factory.webp">
            <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="/images/about-factory.webp" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
          </FormField>
          <FormField label="Fallback Image" tooltip="Shown if the main image fails to load.">
            <input type="text" value={fallbackImage} onChange={e => setFallbackImage(e.target.value)} placeholder="/images/about-fischer.webp" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
          </FormField>
        </div>

        {/* Image preview */}
        {image && (
          <div className="border border-dark-200 dark:border-dark-600 rounded-lg overflow-hidden">
            <img src={image} alt="About section" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Button Text" tooltip="Text on the call-to-action button.">
            <input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="Learn More About Us" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>
          <FormField label="Button Link" tooltip="Where the button navigates to.">
            <input type="text" value={buttonLink} onChange={e => setButtonLink(e.target.value)} placeholder="/about" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>
        </div>

        {/* Feature bullet points */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <div className="flex items-center justify-between mb-3">
            <FormField label="Feature Bullet Points" tooltip="Short phrases highlighting key company features. These appear as a checklist next to the about text.">
              <span />
            </FormField>
            <button
              type="button"
              onClick={() => setFeatures([...features, ''])}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <PlusIcon className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={e => {
                    const updated = [...features]
                    updated[idx] = e.target.value
                    setFeatures(updated)
                  }}
                  placeholder="e.g., ISO 9001:2015 Certified"
                  className="flex-1 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm"
                />
                <button type="button" onClick={() => setFeatures(features.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:text-red-600">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {features.length === 0 && (
              <p className="text-center py-4 text-sm text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
                No features added yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </EditorPanel>
  )
}
