import { useState } from 'react'
import { PlusIcon, TrashIcon, PencilIcon, PhotoIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Banner, HomepageData } from '../types'
import { SECTION_META } from '../types'

interface BannerCarouselEditorProps {
  data: HomepageData
  open: boolean
  onClose: () => void
  onCreateBanner: (banner: Partial<Banner>) => void
  onUpdateBanner: (id: number, data: Partial<Banner>) => void
  onDeleteBanner: (id: number) => void
  isCreatePending: boolean
  isUpdatePending: boolean
}

const emptyBanner: Partial<Banner> = {
  title: '', subtitle: '', image: '', button_text: 'Shop Now', button_link: '/shop', position: 'hero', is_active: true, sort_order: 0,
}

export default function BannerCarouselEditor({ data, open, onClose, onCreateBanner, onUpdateBanner, onDeleteBanner, isCreatePending, isUpdatePending }: BannerCarouselEditorProps) {
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState<Partial<Banner>>(emptyBanner)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Banner | null>(null)

  const banners = data?.banners || []

  const openForm = (banner?: Banner) => {
    if (banner) {
      setEditing(banner)
      setForm(banner)
    } else {
      setEditing(null)
      setForm({ ...emptyBanner, sort_order: banners.length + 1 })
    }
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (editing?.id) {
      onUpdateBanner(editing.id, form)
    } else {
      onCreateBanner(form)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = () => {
    if (deleteConfirm?.id) {
      onDeleteBanner(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.banner_carousel.label}
      description={SECTION_META.banner_carousel.editorDescription}
      sectionKey="banner_carousel"
    >
      {showForm ? (
        /* Banner Form */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-dark-900 dark:text-white">{editing ? 'Edit Banner' : 'Add New Banner'}</h3>
            <button onClick={() => setShowForm(false)} className="text-sm text-dark-500 hover:text-dark-700 dark:hover:text-dark-300">Back to list</button>
          </div>

          <FormField label="Title" tooltip="Banner heading text. Appears over the banner image.">
            <input type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>

          <FormField label="Subtitle" tooltip="Supporting text below the title.">
            <input type="text" value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Up to 50% off selected items" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>

          <FormField label="Image URL" required tooltip="Full-width banner image. Recommended: 1920x600px, WebP format." helpText="Use a high-quality landscape image for best results.">
            <input type="text" value={form.image || ''} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="/images/banners/summer-sale.webp" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>

          {form.image && (
            <div className="border border-dark-200 dark:border-dark-600 rounded-lg overflow-hidden">
              <img src={form.image} alt="Banner preview" className="w-full h-32 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Button Text" tooltip="Call-to-action button text.">
              <input type="text" value={form.button_text || ''} onChange={e => setForm({ ...form, button_text: e.target.value })} placeholder="Shop Now" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
            </FormField>
            <FormField label="Button Link" tooltip="Where clicking the button navigates to.">
              <input type="text" value={form.button_link || ''} onChange={e => setForm({ ...form, button_link: e.target.value })} placeholder="/shop" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort Order" tooltip="Lower numbers appear first in the carousel.">
              <input type="number" value={form.sort_order || 0} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
            </FormField>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active ?? true} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
                <span className="text-sm text-dark-700 dark:text-dark-300">Active (visible)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300">Cancel</button>
            <button onClick={handleSubmit} disabled={isCreatePending || isUpdatePending} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {(isCreatePending || isUpdatePending) && <LoadingSpinner size="sm" />}
              {editing ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </div>
      ) : (
        /* Banner List */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dark-500 dark:text-dark-400">{banners.length} banner{banners.length !== 1 ? 's' : ''}</p>
            <button onClick={() => openForm()} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <PlusIcon className="w-4 h-4" /> Add Banner
            </button>
          </div>

          {banners.length > 0 ? (
            <div className="space-y-3">
              {banners.map(banner => (
                <div key={banner.id} className="flex gap-4 p-3 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50">
                  <div className="w-32 h-20 flex-shrink-0 bg-dark-200 dark:bg-dark-700 rounded-lg overflow-hidden">
                    {banner.image ? (
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><PhotoIcon className="w-8 h-8 text-dark-400" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-dark-900 dark:text-white text-sm truncate">{banner.title || 'Untitled'}</h4>
                        <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{banner.subtitle || 'No subtitle'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${banner.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-dark-100 dark:bg-dark-700 text-dark-500'}`}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <button onClick={() => openForm(banner)} className="p-1.5 text-dark-400 hover:text-primary-600 rounded"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(banner)} className="p-1.5 text-dark-400 hover:text-red-600 rounded"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-dark-500 dark:text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
              <PhotoIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No banners yet. Add your first banner.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Banner"
        message={`Are you sure you want to delete "${deleteConfirm?.title || 'this banner'}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </EditorPanel>
  )
}
