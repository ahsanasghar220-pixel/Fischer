import { useState, useEffect } from 'react'
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section, HomepageData } from '../types'
import { SECTION_META } from '../types'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface CategoriesEditorProps {
  section: Section
  data: HomepageData
  open: boolean
  onClose: () => void
  onSaveSection: (key: string, data: { title: string; subtitle: string; settings: Record<string, any> }) => void
  onSaveCategories: (categoryIds: number[]) => void
  isSectionPending: boolean
  isCategoriesPending: boolean
}

export default function CategoriesEditor({ section, data, open, onClose, onSaveSection, onSaveCategories, isSectionPending, isCategoriesPending }: CategoriesEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [selected, setSelected] = useState<number[]>([])
  const [categoryVideos, setCategoryVideos] = useState<Record<string, string>>(section.settings?.category_videos || {})

  useEffect(() => {
    setSelected(data?.homepage_categories?.map(hc => hc.category_id) || [])
  }, [data?.homepage_categories])

  const allCategories = data?.all_categories || []

  const toggleCategory = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const moveCategory = (from: number, to: number) => {
    if (to < 0 || to >= selected.length) return
    const updated = [...selected]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setSelected(updated)
  }

  const handleVideoUpload = async (file: File, slug: string) => {
    const fd = new FormData()
    fd.append('video', file)
    fd.append('type', 'category')
    try {
      const response = await api.post('/api/admin/homepage/upload-video', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
      })
      setCategoryVideos(prev => ({ ...prev, [slug]: response.data.data.path }))
      toast.success('Video uploaded')
    } catch {
      toast.error('Upload failed')
    }
  }

  const handleSaveAll = () => {
    onSaveSection(section.key, { title, subtitle, settings: { ...section.settings, category_videos: categoryVideos } })
    onSaveCategories(selected)
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.categories.label}
      description={SECTION_META.categories.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={handleSaveAll} disabled={isSectionPending || isCategoriesPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {(isSectionPending || isCategoriesPending) && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FormField label="Section Title" tooltip="Heading displayed above the categories browser.">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Shop by Category" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Subtitle" tooltip="Supporting text below the heading.">
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} placeholder="Browse our product categories" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        {/* Two-panel category selector */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">Select Categories</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Available */}
            <div>
              <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-2">Available ({allCategories.length})</p>
              <div className="border border-dark-200 dark:border-dark-700 rounded-lg max-h-64 overflow-y-auto">
                {allCategories.map(cat => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-3 p-2.5 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-700 border-b border-dark-100 dark:border-dark-700 last:border-b-0 ${
                      selected.includes(cat.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <input type="checkbox" checked={selected.includes(cat.id)} onChange={() => toggleCategory(cat.id)} className="w-4 h-4 rounded text-primary-600" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-dark-900 dark:text-white">{cat.name}</span>
                      <span className="text-xs text-dark-500 dark:text-dark-400 ml-1.5">({cat.products_count})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Selected (ordered) */}
            <div>
              <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-2">Selected in order ({selected.length})</p>
              <div className="border border-dark-200 dark:border-dark-700 rounded-lg">
                {selected.length > 0 ? selected.map((catId, idx) => {
                  const cat = allCategories.find(c => c.id === catId)
                  return cat ? (
                    <div key={catId} className="flex items-center gap-2 p-2.5 border-b border-dark-100 dark:border-dark-700 last:border-b-0">
                      <span className="w-5 h-5 flex items-center justify-center bg-dark-100 dark:bg-dark-700 rounded text-xs font-medium text-dark-500">{idx + 1}</span>
                      <span className="flex-1 text-sm font-medium text-dark-900 dark:text-white truncate">{cat.name}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => moveCategory(idx, idx - 1)} disabled={idx === 0} className="p-0.5 text-dark-400 hover:text-dark-600 disabled:opacity-30"><ChevronUpIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => moveCategory(idx, idx + 1)} disabled={idx === selected.length - 1} className="p-0.5 text-dark-400 hover:text-dark-600 disabled:opacity-30"><ChevronDownIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleCategory(catId)} className="p-0.5 text-dark-400 hover:text-red-600"><XMarkIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ) : null
                }) : (
                  <p className="p-4 text-center text-sm text-dark-400">No categories selected</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Videos */}
        {selected.length > 0 && (
          <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
            <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-1">Category Preview Videos</h3>
            <p className="text-xs text-dark-500 dark:text-dark-400 mb-3">Assign a preview video to each selected category. Shown when a visitor hovers over the category.</p>
            <div className="space-y-3">
              {selected.map(catId => {
                const cat = allCategories.find(c => c.id === catId)
                if (!cat) return null
                const videoUrl = categoryVideos[cat.slug] || ''
                return (
                  <div key={catId} className="p-3 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50">
                    <p className="text-sm font-medium text-dark-900 dark:text-white mb-2">{cat.name}</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={e => setCategoryVideos(prev => ({ ...prev, [cat.slug]: e.target.value }))}
                        placeholder={`/videos/categories/${cat.slug}.mp4`}
                        className="flex-1 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm"
                      />
                      <label className="px-3 py-1.5 text-sm bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 rounded-lg cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-600">
                        Upload
                        <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f, cat.slug); e.target.value = '' }} />
                      </label>
                    </div>
                    {videoUrl && (
                      <video src={videoUrl} controls className="mt-2 w-full max-h-24 rounded border border-dark-200 dark:border-dark-600" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </EditorPanel>
  )
}
