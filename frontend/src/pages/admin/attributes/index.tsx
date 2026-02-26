import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface AttributeValue {
  id: number
  value: string
  color_code?: string | null
  sort_order?: number
}

interface Attribute {
  id: number
  name: string
  type: 'button' | 'color' | 'select' | 'text' | 'size'
  values: AttributeValue[]
}

type AttrForm = { name: string; type: Attribute['type'] }
type ValueForm = { value: string; color_code: string }

const emptyAttrForm = (): AttrForm => ({ name: '', type: 'button' })
const emptyValueForm = (): ValueForm => ({ value: '', color_code: '#000000' })

const TYPE_LABELS: Record<Attribute['type'], string> = {
  button: 'Button',
  color: 'Color',
  select: 'Dropdown',
  text: 'Text',
  size: 'Size',
}

export default function AdminAttributes() {
  const queryClient = useQueryClient()

  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(null)

  // Attr CRUD state
  const [addingAttr, setAddingAttr] = useState(false)
  const [attrForm, setAttrForm] = useState<AttrForm>(emptyAttrForm())
  const [editingAttrId, setEditingAttrId] = useState<number | null>(null)
  const [editAttrForm, setEditAttrForm] = useState<AttrForm>(emptyAttrForm())

  // Value CRUD state
  const [addingValue, setAddingValue] = useState(false)
  const [valueForm, setValueForm] = useState<ValueForm>(emptyValueForm())
  const [editingValueId, setEditingValueId] = useState<number | null>(null)
  const [editValueForm, setEditValueForm] = useState<ValueForm>(emptyValueForm())

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: attributes = [], isLoading } = useQuery<Attribute[]>({
    queryKey: ['admin-attributes'],
    queryFn: async () => {
      const res = await api.get('/api/admin/attributes')
      return res.data.data
    },
  })

  const selectedAttr = attributes.find(a => a.id === selectedAttrId) ?? null

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-attributes'] })

  // ── Attribute mutations ──────────────────────────────────────────────────
  const createAttr = useMutation({
    mutationFn: (form: AttrForm) => api.post('/api/admin/attributes', form),
    onSuccess: (res) => {
      invalidate()
      setAddingAttr(false)
      setAttrForm(emptyAttrForm())
      setSelectedAttrId(res.data.data.id)
      toast.success('Attribute created')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create'),
  })

  const updateAttr = useMutation({
    mutationFn: ({ id, form }: { id: number; form: AttrForm }) =>
      api.put(`/api/admin/attributes/${id}`, form),
    onSuccess: () => {
      invalidate()
      setEditingAttrId(null)
      toast.success('Attribute updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
  })

  const deleteAttr = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/attributes/${id}`),
    onSuccess: (_, id) => {
      invalidate()
      if (selectedAttrId === id) setSelectedAttrId(null)
      toast.success('Attribute deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  // ── Value mutations ──────────────────────────────────────────────────────
  const createValue = useMutation({
    mutationFn: (form: ValueForm) =>
      api.post(`/api/admin/attributes/${selectedAttrId}/values`, {
        value: form.value,
        color_code: selectedAttr?.type === 'color' ? form.color_code : null,
      }),
    onSuccess: () => {
      invalidate()
      setAddingValue(false)
      setValueForm(emptyValueForm())
      toast.success('Value added')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add value'),
  })

  const updateValue = useMutation({
    mutationFn: ({ id, form }: { id: number; form: ValueForm }) =>
      api.put(`/api/admin/values/${id}`, {
        value: form.value,
        color_code: selectedAttr?.type === 'color' ? form.color_code : null,
      }),
    onSuccess: () => {
      invalidate()
      setEditingValueId(null)
      toast.success('Value updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
  })

  const deleteValue = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/values/${id}`),
    onSuccess: () => {
      invalidate()
      toast.success('Value deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Product Attributes</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
            Define product dimensions like Capacity, Color, and Type — then assign them to products in the Variants tab.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Attribute list ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200 dark:border-dark-700">
            <h2 className="font-semibold text-dark-900 dark:text-white">Attributes</h2>
            {!addingAttr && (
              <button
                type="button"
                onClick={() => { setAddingAttr(true); setAttrForm(emptyAttrForm()) }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                New
              </button>
            )}
          </div>

          {/* Add new attribute form */}
          {addingAttr && (
            <div className="px-5 py-4 border-b border-dark-100 dark:border-dark-700 bg-primary-50/40 dark:bg-primary-900/10">
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  className="input text-sm"
                  placeholder="Attribute name (e.g. Capacity)"
                  value={attrForm.name}
                  onChange={e => setAttrForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') createAttr.mutate(attrForm) }}
                />
                <select
                  className="input text-sm"
                  value={attrForm.type}
                  onChange={e => setAttrForm(f => ({ ...f, type: e.target.value as Attribute['type'] }))}
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => createAttr.mutate(attrForm)}
                    disabled={!attrForm.name || createAttr.isPending}
                    className="flex-1 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingAttr(false)}
                    className="px-3 py-1.5 text-sm text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attribute rows */}
          <div className="divide-y divide-dark-100 dark:divide-dark-700">
            {isLoading && (
              <div className="px-5 py-8 text-center text-sm text-dark-400">Loading...</div>
            )}
            {!isLoading && attributes.length === 0 && !addingAttr && (
              <div className="px-5 py-8 text-center text-sm text-dark-400">
                No attributes yet. Create your first one.
              </div>
            )}
            {attributes.map(attr => {
              const isEditing = editingAttrId === attr.id
              const isSelected = selectedAttrId === attr.id

              if (isEditing) {
                return (
                  <div key={attr.id} className="px-5 py-3 bg-primary-50/40 dark:bg-primary-900/10">
                    <div className="flex flex-col gap-2">
                      <input
                        autoFocus
                        className="input text-sm"
                        value={editAttrForm.name}
                        onChange={e => setEditAttrForm(f => ({ ...f, name: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') updateAttr.mutate({ id: attr.id, form: editAttrForm })
                          if (e.key === 'Escape') setEditingAttrId(null)
                        }}
                      />
                      <select
                        className="input text-sm"
                        value={editAttrForm.type}
                        onChange={e => setEditAttrForm(f => ({ ...f, type: e.target.value as Attribute['type'] }))}
                      >
                        {Object.entries(TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateAttr.mutate({ id: attr.id, form: editAttrForm })}
                          disabled={updateAttr.isPending}
                          className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAttrId(null)}
                          className="p-1.5 bg-dark-200 hover:bg-dark-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-700 dark:text-dark-200 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={attr.id}
                  type="button"
                  className={`group w-full text-left px-5 py-3 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-dark-50 dark:hover:bg-dark-700/50'
                  }`}
                  onClick={() => setSelectedAttrId(attr.id)}
                >
                  <div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-dark-900 dark:text-white'}`}>
                      {attr.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 bg-dark-100 dark:bg-dark-700 text-dark-500 dark:text-dark-400 rounded">
                        {TYPE_LABELS[attr.type] || attr.type}
                      </span>
                      <span className="text-xs text-dark-400 dark:text-dark-500">
                        {attr.values.length} value{attr.values.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAttrId(attr.id)
                        setEditAttrForm({ name: attr.name, type: attr.type })
                      }}
                      className="p-1.5 rounded hover:bg-dark-200 dark:hover:bg-dark-600 text-dark-500 dark:text-dark-400 transition-colors"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete attribute "${attr.name}" and all its values?`)) {
                          deleteAttr.mutate(attr.id)
                        }
                      }}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right: Values panel ──────────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-800 rounded-xl shadow-sm">
          {!selectedAttr ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <SwatchIcon className="w-12 h-12 text-dark-300 dark:text-dark-600 mb-3" />
              <p className="text-dark-500 dark:text-dark-400 text-sm">
                Select an attribute on the left to manage its values.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200 dark:border-dark-700">
                <div>
                  <h2 className="font-semibold text-dark-900 dark:text-white">
                    {selectedAttr.name}
                  </h2>
                  <span className="text-xs px-1.5 py-0.5 bg-dark-100 dark:bg-dark-700 text-dark-500 dark:text-dark-400 rounded">
                    {TYPE_LABELS[selectedAttr.type]}
                  </span>
                </div>
                {!addingValue && (
                  <button
                    type="button"
                    onClick={() => { setAddingValue(true); setValueForm(emptyValueForm()) }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Value
                  </button>
                )}
              </div>

              {/* Add value form */}
              {addingValue && (
                <div className="px-5 py-4 border-b border-dark-100 dark:border-dark-700 bg-primary-50/40 dark:bg-primary-900/10">
                  <div className="flex items-center gap-2">
                    {selectedAttr.type === 'color' && (
                      <input
                        type="color"
                        className="h-9 w-12 rounded border border-dark-200 dark:border-dark-600 cursor-pointer"
                        value={valueForm.color_code}
                        onChange={e => setValueForm(f => ({ ...f, color_code: e.target.value }))}
                      />
                    )}
                    <input
                      autoFocus
                      className="input text-sm flex-1"
                      placeholder={selectedAttr.type === 'color' ? 'Color name (e.g. White)' : 'Value (e.g. 15L)'}
                      value={valueForm.value}
                      onChange={e => setValueForm(f => ({ ...f, value: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') createValue.mutate(valueForm) }}
                    />
                    <button
                      type="button"
                      onClick={() => createValue.mutate(valueForm)}
                      disabled={!valueForm.value || createValue.isPending}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingValue(false)}
                      className="p-2 bg-dark-200 hover:bg-dark-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-700 dark:text-dark-200 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Values list */}
              <div className="divide-y divide-dark-100 dark:divide-dark-700">
                {selectedAttr.values.length === 0 && !addingValue && (
                  <div className="px-5 py-8 text-center text-sm text-dark-400">
                    No values yet. Add the first value above.
                  </div>
                )}
                {selectedAttr.values.map(val => {
                  const isEditingVal = editingValueId === val.id

                  if (isEditingVal) {
                    return (
                      <div key={val.id} className="px-5 py-3 bg-primary-50/40 dark:bg-primary-900/10">
                        <div className="flex items-center gap-2">
                          {selectedAttr.type === 'color' && (
                            <input
                              type="color"
                              className="h-9 w-12 rounded border border-dark-200 dark:border-dark-600 cursor-pointer"
                              value={editValueForm.color_code || '#000000'}
                              onChange={e => setEditValueForm(f => ({ ...f, color_code: e.target.value }))}
                            />
                          )}
                          <input
                            autoFocus
                            className="input text-sm flex-1"
                            value={editValueForm.value}
                            onChange={e => setEditValueForm(f => ({ ...f, value: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') updateValue.mutate({ id: val.id, form: editValueForm })
                              if (e.key === 'Escape') setEditingValueId(null)
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => updateValue.mutate({ id: val.id, form: editValueForm })}
                            disabled={updateValue.isPending}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingValueId(null)}
                            className="p-2 bg-dark-200 hover:bg-dark-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-700 dark:text-dark-200 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={val.id} className="group flex items-center justify-between px-5 py-3 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {selectedAttr.type === 'color' && val.color_code && (
                          <span
                            className="w-6 h-6 rounded-full border border-dark-200 dark:border-dark-600 flex-shrink-0"
                            style={{ backgroundColor: val.color_code }}
                          />
                        )}
                        <span className="text-sm text-dark-900 dark:text-white">{val.value}</span>
                        {selectedAttr.type === 'color' && val.color_code && (
                          <span className="text-xs text-dark-400 font-mono">{val.color_code}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingValueId(val.id)
                            setEditValueForm({ value: val.value, color_code: val.color_code || '#000000' })
                          }}
                          className="p-1.5 rounded hover:bg-dark-200 dark:hover:bg-dark-600 text-dark-500 dark:text-dark-400 transition-colors"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete value "${val.value}"?`)) deleteValue.mutate(val.id)
                          }}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
