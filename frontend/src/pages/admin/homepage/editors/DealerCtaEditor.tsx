import { useState } from 'react'
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'

interface Benefit {
  title: string
  description: string
  icon: string
}

interface DealerCtaEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string; settings: Record<string, any> }) => void
  isPending: boolean
}

export default function DealerCtaEditor({ section, open, onClose, onSave, isPending }: DealerCtaEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [badgeText, setBadgeText] = useState(section.settings?.badge_text || '')
  const [buttonText, setButtonText] = useState(section.settings?.button_text || '')
  const [buttonLink, setButtonLink] = useState(section.settings?.button_link || '')
  const [secondaryButtonText, setSecondaryButtonText] = useState(section.settings?.secondary_button_text || '')
  const [secondaryButtonLink, setSecondaryButtonLink] = useState(section.settings?.secondary_button_link || '')
  const [benefits, setBenefits] = useState<Benefit[]>(section.settings?.benefits || [])

  const handleSave = () => {
    onSave(section.key, {
      title,
      subtitle,
      settings: {
        ...section.settings,
        badge_text: badgeText,
        button_text: buttonText,
        button_link: buttonLink,
        secondary_button_text: secondaryButtonText,
        secondary_button_link: secondaryButtonLink,
        benefits,
      },
    })
  }

  const updateBenefit = (index: number, field: keyof Benefit, value: string) => {
    const updated = [...benefits]
    updated[index] = { ...updated[index], [field]: value }
    setBenefits(updated)
  }

  const moveBenefit = (from: number, to: number) => {
    if (to < 0 || to >= benefits.length) return
    const updated = [...benefits]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setBenefits(updated)
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.dealer_cta.label}
      description={SECTION_META.dealer_cta.editorDescription}
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
        <FormField label="Badge Text" tooltip="Small label shown above the main heading." helpText="Example: 'Partnership Opportunity'">
          <input type="text" value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="Partnership Opportunity" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Title" tooltip="The main heading of the dealer CTA section." helpText="Example: 'Become a Fischer Dealer'">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Become a Fischer Dealer" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Subtitle" tooltip="Supporting text below the heading.">
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} placeholder="Join our growing network of authorized dealers across Pakistan" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Primary Button Text" tooltip="Text on the main action button.">
            <input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="Apply Now" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>
          <FormField label="Primary Button Link" tooltip="Where the button navigates to.">
            <input type="text" value={buttonLink} onChange={e => setButtonLink(e.target.value)} placeholder="/become-dealer" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Secondary Button Text" tooltip="Text on the secondary action button.">
            <input type="text" value={secondaryButtonText} onChange={e => setSecondaryButtonText(e.target.value)} placeholder="Contact Sales" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>
          <FormField label="Secondary Button Link" tooltip="Where the secondary button navigates to.">
            <input type="text" value={secondaryButtonLink} onChange={e => setSecondaryButtonLink(e.target.value)} placeholder="/contact" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>
        </div>

        {/* Benefits CRUD */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <div className="flex items-center justify-between mb-3">
            <FormField label="Benefits Cards" tooltip="Cards highlighting the benefits of becoming a dealer. Each card has an icon, title, and description.">
              <span />
            </FormField>
            <button
              type="button"
              onClick={() => setBenefits([...benefits, { title: '', description: '', icon: '' }])}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <PlusIcon className="w-4 h-4" /> Add Benefit
            </button>
          </div>

          <div className="space-y-3">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-dark-500 dark:text-dark-400">Benefit #{idx + 1}</span>
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button type="button" onClick={() => moveBenefit(idx, idx - 1)} className="p-1 text-dark-400 hover:text-dark-600"><ChevronUpIcon className="w-3.5 h-3.5" /></button>
                    )}
                    {idx < benefits.length - 1 && (
                      <button type="button" onClick={() => moveBenefit(idx, idx + 1)} className="p-1 text-dark-400 hover:text-dark-600"><ChevronDownIcon className="w-3.5 h-3.5" /></button>
                    )}
                    <button type="button" onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))} className="p-1 text-red-500 hover:text-red-600"><TrashIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-[60px_1fr] gap-3">
                  <div>
                    <label className="block text-xs text-dark-500 dark:text-dark-400 mb-1">Icon</label>
                    <input type="text" value={benefit.icon} onChange={e => updateBenefit(idx, 'icon', e.target.value)} placeholder="🏪" className="w-full px-2 py-1.5 text-center text-lg border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700" />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-500 dark:text-dark-400 mb-1">Title</label>
                    <input type="text" value={benefit.title} onChange={e => updateBenefit(idx, 'title', e.target.value)} placeholder="Exclusive Territory" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-dark-500 dark:text-dark-400 mb-1">Description</label>
                  <input type="text" value={benefit.description} onChange={e => updateBenefit(idx, 'description', e.target.value)} placeholder="Get exclusive rights to sell in your area" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                </div>
              </div>
            ))}
            {benefits.length === 0 && (
              <p className="text-center py-6 text-sm text-dark-400 dark:text-dark-500 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
                No benefits added yet. Click "Add Benefit" to create one.
              </p>
            )}
          </div>
        </div>
      </div>
    </EditorPanel>
  )
}
