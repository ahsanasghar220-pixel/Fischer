import { useState } from 'react'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Testimonial, HomepageData } from '../types'
import { SECTION_META } from '../types'

interface TestimonialsEditorProps {
  data: HomepageData
  open: boolean
  onClose: () => void
  onCreateTestimonial: (t: Partial<Testimonial>) => void
  onUpdateTestimonial: (id: number, data: Partial<Testimonial>) => void
  onDeleteTestimonial: (id: number) => void
  isCreatePending: boolean
  isUpdatePending: boolean
}

const emptyTestimonial: Partial<Testimonial> = {
  name: '', role: '', content: '', image: '', rating: 5, is_visible: true,
}

export default function TestimonialsEditor({ data, open, onClose, onCreateTestimonial, onUpdateTestimonial, onDeleteTestimonial, isCreatePending, isUpdatePending }: TestimonialsEditorProps) {
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<Partial<Testimonial>>(emptyTestimonial)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Testimonial | null>(null)

  const testimonials = data?.testimonials || []

  const openForm = (t?: Testimonial) => {
    if (t) {
      setEditing(t)
      setForm(t)
    } else {
      setEditing(null)
      setForm(emptyTestimonial)
    }
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (editing?.id) {
      onUpdateTestimonial(editing.id, form)
    } else {
      onCreateTestimonial(form)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = () => {
    if (deleteConfirm?.id) {
      onDeleteTestimonial(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.testimonials.label}
      description={SECTION_META.testimonials.editorDescription}
      sectionKey="testimonials"
    >
      {showForm ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-dark-900 dark:text-white">{editing ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
            <button onClick={() => setShowForm(false)} className="text-sm text-dark-500 hover:text-dark-700 dark:hover:text-dark-300">Back to list</button>
          </div>

          <FormField label="Customer Name" required tooltip="Full name of the customer.">
            <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ahmed Khan" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>

          <FormField label="Role / Title" tooltip="Customer's role or location." helpText="Example: 'Homeowner, Lahore'">
            <input type="text" value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Homeowner, Lahore" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>

          <FormField label="Review Content" required tooltip="The customer's review text." helpText="Keep it 1-3 sentences for best display.">
            <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Share the customer's experience with your products..." className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>

          <FormField label="Photo URL" tooltip="Customer's profile photo. Square format recommended." helpText="Leave empty to show initials instead.">
            <input type="text" value={form.image || ''} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/avatar.webp" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
          </FormField>

          {form.image && (
            <div className="flex items-center gap-3">
              <img src={form.image} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-dark-200 dark:border-dark-600" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="text-xs text-dark-400">Photo preview</span>
            </div>
          )}

          <FormField label="Star Rating" tooltip="Customer satisfaction rating from 1-5 stars.">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className={`text-2xl transition-colors ${n <= (form.rating || 5) ? 'text-yellow-400' : 'text-dark-300 dark:text-dark-600'}`}
                >
                  &#9733;
                </button>
              ))}
              <span className="text-sm text-dark-500 ml-2">{form.rating || 5} star{(form.rating || 5) !== 1 ? 's' : ''}</span>
            </div>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300">Cancel</button>
            <button onClick={handleSubmit} disabled={isCreatePending || isUpdatePending} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {(isCreatePending || isUpdatePending) && <LoadingSpinner size="sm" />}
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dark-500 dark:text-dark-400">{testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}</p>
            <button onClick={() => openForm()} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <PlusIcon className="w-4 h-4" /> Add Testimonial
            </button>
          </div>

          {testimonials.length > 0 ? (
            <div className="space-y-3">
              {testimonials.map(t => (
                <div key={t.id} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark-200 dark:bg-dark-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {t.image ? (
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-dark-500 dark:text-dark-400 font-bold text-sm">{t.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-dark-900 dark:text-white text-sm">{t.name}</h4>
                          <p className="text-xs text-dark-500 dark:text-dark-400">{t.role}</p>
                        </div>
                        <div className="flex text-yellow-400 text-xs">
                          {[...Array(5)].map((_, i) => <span key={i}>{i < t.rating ? '\u2605' : '\u2606'}</span>)}
                        </div>
                      </div>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mt-1 line-clamp-2">"{t.content}"</p>
                      <div className="flex items-center gap-1 mt-2">
                        <button onClick={() => openForm(t)} className="p-1.5 text-dark-400 hover:text-primary-600 rounded"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(t)} className="p-1.5 text-dark-400 hover:text-red-600 rounded"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-sm text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
              No testimonials yet. Add your first customer review.
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </EditorPanel>
  )
}
