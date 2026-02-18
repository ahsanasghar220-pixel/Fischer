import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, PhotoIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { NotableClient, HomepageData } from '../types'
import { SECTION_META } from '../types'

interface NotableClientsEditorProps {
  data: HomepageData
  open: boolean
  onClose: () => void
  onSave: (clients: NotableClient[]) => void
  onUploadLogo: (file: File) => Promise<{ path: string }>
  isPending: boolean
}

export default function NotableClientsEditor({ data, open, onClose, onSave, onUploadLogo, isPending }: NotableClientsEditorProps) {
  const [clients, setClients] = useState<NotableClient[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  useEffect(() => {
    if (data?.notable_clients) setClients(data.notable_clients)
  }, [data?.notable_clients])

  const updateClient = (index: number, field: keyof NotableClient, value: any) => {
    const updated = [...clients]
    updated[index] = { ...updated[index], [field]: value }
    setClients(updated)
  }

  const moveClient = (from: number, to: number) => {
    if (to < 0 || to >= clients.length) return
    const updated = [...clients]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    updated.forEach((c, i) => { c.sort_order = i })
    setClients(updated)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingIdx(index)
    try {
      const result = await onUploadLogo(file)
      updateClient(index, 'logo', result.path)
    } finally {
      setUploadingIdx(null)
    }
  }

  const handleDelete = () => {
    if (deleteConfirm !== null) {
      setClients(clients.filter((_, i) => i !== deleteConfirm))
      setDeleteConfirm(null)
    }
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.notable_clients.label}
      description={SECTION_META.notable_clients.editorDescription}
      sectionKey="notable_clients"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={() => onSave(clients)} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {isPending && <LoadingSpinner size="sm" />}
            Save Clients
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-500 dark:text-dark-400">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setClients([...clients, { name: '', logo: '', website: '', sort_order: clients.length, is_visible: true }])}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" /> Add Client
          </button>
        </div>

        {clients.length > 0 ? (
          <div className="space-y-3">
            {clients.map((client, index) => (
              <div key={index} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50 space-y-3">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-24 h-16 bg-white dark:bg-dark-700 rounded-lg border border-dark-200 dark:border-dark-600 flex items-center justify-center overflow-hidden relative group flex-shrink-0">
                    {client.logo ? (
                      <img src={client.logo} alt={client.name || 'Logo'} className="max-w-full max-h-full object-contain p-2" />
                    ) : (
                      <PhotoIcon className="w-8 h-8 text-dark-300 dark:text-dark-500" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className={`px-2 py-1 bg-white rounded text-xs font-medium cursor-pointer ${uploadingIdx === index ? 'opacity-50' : 'hover:bg-dark-100'}`}>
                        {uploadingIdx === index ? '...' : 'Upload'}
                        <input type="file" className="hidden" accept="image/*" disabled={uploadingIdx === index} onChange={e => handleLogoUpload(e, index)} />
                      </label>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-2">
                    <FormField label="Client Name" tooltip="Name of the client or company.">
                      <input type="text" value={client.name} onChange={e => updateClient(index, 'name', e.target.value)} placeholder="Company Name" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                    </FormField>
                    <FormField label="Website URL" tooltip="Optional link to client's website.">
                      <input type="text" value={client.website || ''} onChange={e => updateClient(index, 'website', e.target.value)} placeholder="https://example.com" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                    </FormField>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-dark-200 dark:border-dark-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={client.is_visible} onChange={e => updateClient(index, 'is_visible', e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
                    <span className="text-xs text-dark-600 dark:text-dark-400">Visible on homepage</span>
                  </label>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => moveClient(index, index - 1)} disabled={index === 0} className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"><ChevronUpIcon className="w-4 h-4" /></button>
                    <button onClick={() => moveClient(index, index + 1)} disabled={index === clients.length - 1} className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"><ChevronDownIcon className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm(index)} className="p-1 text-red-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-dark-500 dark:text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
            <PhotoIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notable clients added yet.</p>
            <p className="text-xs mt-1">Upload client logos to display them on the homepage.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Remove Client"
        message={`Are you sure you want to remove "${deleteConfirm !== null ? clients[deleteConfirm]?.name || 'this client' : ''}"? Remember to save after removing.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </EditorPanel>
  )
}
