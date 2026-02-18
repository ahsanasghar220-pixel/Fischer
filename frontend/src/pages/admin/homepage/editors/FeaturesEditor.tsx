import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Feature, HomepageData } from '../types'
import { SECTION_META, iconOptions, colorOptions } from '../types'

interface FeaturesEditorProps {
  data: HomepageData
  open: boolean
  onClose: () => void
  onSave: (features: Feature[]) => void
  isPending: boolean
}

export default function FeaturesEditor({ data, open, onClose, onSave, isPending }: FeaturesEditorProps) {
  const [features, setFeatures] = useState<Feature[]>([])

  useEffect(() => {
    if (data?.features) setFeatures(data.features)
  }, [data?.features])

  const updateFeature = (index: number, field: keyof Feature, value: any) => {
    const updated = [...features]
    updated[index] = { ...updated[index], [field]: value }
    setFeatures(updated)
  }

  const addFeature = () => {
    setFeatures([...features, { title: '', description: '', icon: 'star', color: 'blue', sort_order: features.length, is_visible: true }])
  }

  const colorPreview: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', orange: 'bg-orange-500',
    red: 'bg-red-500', yellow: 'bg-yellow-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500',
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.features.label}
      description={SECTION_META.features.editorDescription}
      sectionKey="features"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={() => onSave(features)} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {isPending && <LoadingSpinner size="sm" />}
            Save Features
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-500 dark:text-dark-400">{features.length} feature{features.length !== 1 ? 's' : ''} configured</p>
          <button onClick={addFeature} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <PlusIcon className="w-4 h-4" /> Add Feature
          </button>
        </div>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${colorPreview[feature.color] || 'bg-dark-400'}`} />
                  <span className="text-xs font-medium text-dark-500 dark:text-dark-400">Feature #{index + 1}</span>
                </div>
                <button onClick={() => setFeatures(features.filter((_, i) => i !== index))} className="p-1 text-red-500 hover:text-red-600">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <FormField label="Title" tooltip="Short name for this feature." helpText="Example: 'Free Delivery in Lahore'">
                <input
                  type="text"
                  value={feature.title}
                  onChange={e => updateFeature(index, 'title', e.target.value)}
                  placeholder="Free Delivery in Lahore"
                  className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-medium"
                />
              </FormField>

              <FormField label="Description" tooltip="Brief explanation of this feature.">
                <input
                  type="text"
                  value={feature.description}
                  onChange={e => updateFeature(index, 'description', e.target.value)}
                  placeholder="We deliver all orders within Lahore free of charge"
                  className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Icon" tooltip="Visual icon for this feature card.">
                  <select
                    value={feature.icon}
                    onChange={e => updateFeature(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  >
                    {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </FormField>
                <FormField label="Color Theme" tooltip="Background color theme for the icon circle.">
                  <select
                    value={feature.color}
                    onChange={e => updateFeature(index, 'color', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  >
                    {colorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </FormField>
              </div>
            </div>
          ))}

          {features.length === 0 && (
            <p className="text-center py-8 text-sm text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
              No features configured. Click "Add Feature" to create one.
            </p>
          )}
        </div>
      </div>
    </EditorPanel>
  )
}
