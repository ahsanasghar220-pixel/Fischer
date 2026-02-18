import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Stat, HomepageData } from '../types'
import { SECTION_META, iconOptions } from '../types'

interface StatsEditorProps {
  data: HomepageData
  open: boolean
  onClose: () => void
  onSave: (stats: Stat[]) => void
  isPending: boolean
}

export default function StatsEditor({ data, open, onClose, onSave, isPending }: StatsEditorProps) {
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    if (data?.stats) setStats(data.stats)
  }, [data?.stats])

  const updateStat = (index: number, field: keyof Stat, value: any) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [field]: value }
    setStats(updated)
  }

  const addStat = () => {
    setStats([...stats, { label: '', value: '', icon: 'star', sort_order: stats.length, is_visible: true }])
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.stats.label}
      description={SECTION_META.stats.editorDescription}
      sectionKey="stats"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={() => onSave(stats)} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {isPending && <LoadingSpinner size="sm" />}
            Save Stats
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-500 dark:text-dark-400">{stats.length} stat{stats.length !== 1 ? 's' : ''} configured</p>
          <button
            onClick={addStat}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" /> Add Stat
          </button>
        </div>

        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-dark-500 dark:text-dark-400">Stat #{index + 1}</span>
                <button onClick={() => setStats(stats.filter((_, i) => i !== index))} className="p-1 text-red-500 hover:text-red-600">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Value" tooltip="The number to display. Can include suffixes like '+' or 'K'." helpText="Examples: '35+', '500K+', '98%'">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => updateStat(index, 'value', e.target.value)}
                    placeholder="35+"
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-bold text-lg"
                  />
                </FormField>
                <FormField label="Label" tooltip="Description text below the number." helpText="Example: 'Years Experience'">
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => updateStat(index, 'label', e.target.value)}
                    placeholder="Years Experience"
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </FormField>
              </div>

              <FormField label="Icon" tooltip="Choose an icon that represents this stat.">
                <select
                  value={stat.icon}
                  onChange={e => updateStat(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </FormField>
            </div>
          ))}

          {stats.length === 0 && (
            <p className="text-center py-8 text-sm text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
              No stats configured. Click "Add Stat" to create one.
            </p>
          )}
        </div>
      </div>
    </EditorPanel>
  )
}
