import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, ArrowPathIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Product } from '@/types'

interface AttributeValue {
  id: number
  value: string
  color_code?: string | null
}

interface Attribute {
  id: number
  name: string
  type: string
  values: AttributeValue[]
}

interface ExistingVariant {
  id: number
  sku: string
  price: number
  compare_price?: number | null
  stock?: number
  stock_quantity?: number
  is_active?: boolean
  attributeValues?: Array<{ id: number; value: string; attribute: { id: number; name: string } }>
}

interface MatrixRow {
  _key: string           // comma-sorted attr_value_ids
  _label: string         // "Type / Capacity" display
  _attrValueIds: number[]
  id?: number            // existing variant id
  sku: string
  price: string
  compare_price: string
  stock_quantity: string
  is_active: boolean
  _dirty: boolean
}

interface VariantsTabProps {
  product?: Product & { attributes?: Attribute[]; variants?: ExistingVariant[] }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function cartesian(arrays: AttributeValue[][]): AttributeValue[][] {
  if (arrays.length === 0) return []
  return arrays.reduce<AttributeValue[][]>(
    (acc, arr) => acc.flatMap(combo => arr.map(v => [...combo, v])),
    [[]]
  )
}

function makeKey(ids: number[]): string {
  return [...ids].sort((a, b) => a - b).join(',')
}

function comboLabel(values: AttributeValue[]): string {
  return values.map(v => v.value).join(' / ')
}

// ── Component ──────────────────────────────────────────────────────────────

export default function VariantsTab({ product }: VariantsTabProps) {
  const queryClient = useQueryClient()
  const productId = product?.id

  // Selected attribute IDs for this product (synced to backend)
  const [selectedAttrIds, setSelectedAttrIds] = useState<number[]>([])
  // Matrix rows for the variant grid
  const [matrix, setMatrix] = useState<MatrixRow[]>([])
  // Whether we're in "simple mode" (no configurator — just manual rows)
  const [mode, setMode] = useState<'configurator' | 'simple'>('configurator')

  // ── Load global attributes ───────────────────────────────────────────────
  const { data: globalAttrs = [] } = useQuery<Attribute[]>({
    queryKey: ['admin-attributes'],
    queryFn: async () => {
      const res = await api.get('/api/admin/attributes')
      return res.data.data
    },
  })

  // ── Initialise from product.attributes + product.variants ───────────────
  useEffect(() => {
    if (!product) return

    const assignedIds = (product.attributes ?? []).map(a => a.id)
    setSelectedAttrIds(assignedIds)

    if (assignedIds.length > 0) {
      setMode('configurator')
      rebuildMatrix(assignedIds, product.variants ?? [], globalAttrs)
    } else if ((product.variants ?? []).length > 0) {
      setMode('simple')
    }
  // Only re-run when product id changes, not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, globalAttrs.length])

  // ── Selected attributes (full objects with their values) ─────────────────
  const selectedAttrs = useMemo(
    () => globalAttrs.filter(a => selectedAttrIds.includes(a.id)),
    [globalAttrs, selectedAttrIds]
  )

  // ── Rebuild matrix from selected attrs × existing variants ───────────────
  function rebuildMatrix(attrIds: number[], existing: ExistingVariant[], allAttrs: Attribute[]) {
    const attrs = allAttrs.filter(a => attrIds.includes(a.id))
    const valueSets = attrs.map(a => a.values)
    if (valueSets.some(vs => vs.length === 0)) return

    const combinations = cartesian(valueSets)

    // Build lookup from existing variants by their attr-value key
    const existingByKey: Record<string, ExistingVariant> = {}
    for (const v of existing) {
      if (v.attributeValues && v.attributeValues.length > 0) {
        const key = makeKey(v.attributeValues.map(av => av.id))
        existingByKey[key] = v
      }
    }

    const rows: MatrixRow[] = combinations.map(combo => {
      const key = makeKey(combo.map(v => v.id))
      const ex = existingByKey[key]
      return {
        _key: key,
        _label: comboLabel(combo),
        _attrValueIds: combo.map(v => v.id),
        id: ex?.id,
        sku: ex?.sku ?? '',
        price: ex?.price != null ? String(ex.price) : '',
        compare_price: ex?.compare_price != null ? String(ex.compare_price) : '',
        stock_quantity: String(ex?.stock ?? ex?.stock_quantity ?? 0),
        is_active: ex?.is_active ?? true,
        _dirty: false,
      }
    })

    setMatrix(rows)
  }

  // ── Sync selected attributes to backend ──────────────────────────────────
  const syncAttrsMutation = useMutation({
    mutationFn: (ids: number[]) =>
      api.put(`/api/admin/products/${productId}/attributes`, { attribute_ids: ids }),
    onSuccess: (_, ids) => {
      rebuildMatrix(ids, product?.variants ?? [], globalAttrs)
      toast.success('Attributes saved')
      queryClient.invalidateQueries({ queryKey: ['admin-product', String(productId)] })
    },
    onError: () => toast.error('Failed to save attributes'),
  })

  // ── Batch save variants ───────────────────────────────────────────────────
  const batchMutation = useMutation({
    mutationFn: (rows: MatrixRow[]) =>
      api.post(`/api/admin/products/${productId}/variants/batch`, {
        variants: rows.map(r => ({
          id: r.id,
          sku: r.sku,
          price: r.price ? parseFloat(r.price) : null,
          compare_price: r.compare_price ? parseFloat(r.compare_price) : null,
          stock_quantity: parseInt(r.stock_quantity) || 0,
          is_active: r.is_active,
          attribute_value_ids: r._attrValueIds,
        })),
      }),
    onSuccess: () => {
      toast.success('Variants saved')
      queryClient.invalidateQueries({ queryKey: ['admin-product', String(productId)] })
      setMatrix(rows => rows.map(r => ({ ...r, _dirty: false })))
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Failed to save variants'),
  })

  // ── Simple mode: add/edit/delete individual variants ─────────────────────
  const [addingSimple, setAddingSimple] = useState(false)
  const [simpleForm, setSimpleForm] = useState({ name: '', sku: '', price: '', compare_price: '', stock_quantity: '0' })
  const [editingSimpleId, setEditingSimpleId] = useState<number | null>(null)
  const [editSimpleForm, setEditSimpleForm] = useState({ name: '', sku: '', price: '', compare_price: '', stock_quantity: '0' })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-product', String(productId)] })

  const addSimpleMutation = useMutation({
    mutationFn: (f: typeof simpleForm) => api.post(`/api/admin/products/${productId}/variants`, {
      name: f.name, sku: f.sku,
      price: f.price ? parseFloat(f.price) : null,
      compare_price: f.compare_price ? parseFloat(f.compare_price) : null,
      stock_quantity: parseInt(f.stock_quantity) || 0,
    }),
    onSuccess: () => { invalidate(); setAddingSimple(false); setSimpleForm({ name: '', sku: '', price: '', compare_price: '', stock_quantity: '0' }); toast.success('Variant added') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add variant'),
  })

  const updateSimpleMutation = useMutation({
    mutationFn: ({ id, f }: { id: number; f: typeof editSimpleForm }) => api.put(`/api/admin/products/${productId}/variants/${id}`, {
      name: f.name, sku: f.sku,
      price: f.price ? parseFloat(f.price) : null,
      compare_price: f.compare_price ? parseFloat(f.compare_price) : null,
      stock_quantity: parseInt(f.stock_quantity) || 0,
    }),
    onSuccess: () => { invalidate(); setEditingSimpleId(null); toast.success('Variant updated') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update variant'),
  })

  const deleteSimpleMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/products/${productId}/variants/${id}`),
    onSuccess: () => { invalidate(); toast.success('Variant deleted') },
    onError: () => toast.error('Failed to delete variant'),
  })

  // ── Guard: not yet saved ──────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">Variants</h2>
        <p className="text-dark-500 dark:text-dark-400 text-sm">Save the product first to add variants.</p>
      </div>
    )
  }

  const simpleVariants = (product.variants ?? []) as ExistingVariant[]
  const dirtyCount = matrix.filter(r => r._dirty).length

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-dark-500 dark:text-dark-400 font-medium">Variant mode:</span>
          <button
            type="button"
            onClick={() => setMode('configurator')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'configurator'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
            }`}
          >
            Configurator (Apple-style)
          </button>
          <button
            type="button"
            onClick={() => setMode('simple')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'simple'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
            }`}
          >
            Simple List
          </button>
        </div>
      </div>

      {/* ── CONFIGURATOR MODE ──────────────────────────────────────────────── */}
      {mode === 'configurator' && (
        <>
          {/* Step 1: Assign Attributes */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-dark-900 dark:text-white mb-1">
              Step 1 — Assign Attributes
            </h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
              Select the attribute dimensions that apply to this product (e.g. Capacity, Color, Type). Manage global attributes under{' '}
              <a href="/admin/attributes" className="text-primary-600 dark:text-primary-400 hover:underline" target="_blank">Catalog → Attributes</a>.
            </p>

            {globalAttrs.length === 0 ? (
              <p className="text-sm text-dark-400 italic">No attributes defined yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {globalAttrs.map(attr => {
                  const checked = selectedAttrIds.includes(attr.id)
                  return (
                    <label
                      key={attr.id}
                      className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-colors ${
                        checked
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-dark-200 dark:border-dark-600 hover:border-dark-400 dark:hover:border-dark-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="rounded text-primary-500 focus:ring-primary-500"
                        checked={checked}
                        onChange={e => {
                          setSelectedAttrIds(prev =>
                            e.target.checked ? [...prev, attr.id] : prev.filter(id => id !== attr.id)
                          )
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{attr.name}</p>
                        <p className="text-xs text-dark-400">{attr.values.length} values</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                disabled={syncAttrsMutation.isPending || selectedAttrIds.length === 0}
                onClick={() => syncAttrsMutation.mutate(selectedAttrIds)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {syncAttrsMutation.isPending ? 'Saving...' : 'Save & Generate Matrix'}
              </button>
              {selectedAttrIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => rebuildMatrix(selectedAttrIds, product.variants ?? [], globalAttrs)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Regenerate
                </button>
              )}
            </div>
          </div>

          {/* Step 2: Variant Matrix */}
          {matrix.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-dark-900 dark:text-white">
                    Step 2 — Edit Variants
                  </h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    {matrix.length} combination{matrix.length !== 1 ? 's' : ''}.
                    {dirtyCount > 0 && <span className="text-orange-500 ml-1">{dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}.</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => batchMutation.mutate(matrix)}
                  disabled={batchMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {batchMutation.isPending ? 'Saving...' : 'Save All Variants'}
                </button>
              </div>

              {/* Bulk price setter */}
              <BulkPriceSetter onApply={(price, comparePrice) => {
                setMatrix(rows => rows.map(r => ({
                  ...r,
                  price: price !== null ? String(price) : r.price,
                  compare_price: comparePrice !== null ? String(comparePrice) : r.compare_price,
                  _dirty: true,
                })))
              }} />

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-200 dark:border-dark-700 text-left text-xs uppercase tracking-wider text-dark-500 dark:text-dark-400">
                      <th className="pb-2 pr-4 font-medium">Combination</th>
                      <th className="pb-2 pr-4 font-medium">SKU</th>
                      <th className="pb-2 pr-4 font-medium">Price (Rs.)</th>
                      <th className="pb-2 pr-4 font-medium">MRP (Rs.)</th>
                      <th className="pb-2 pr-4 font-medium">Stock</th>
                      <th className="pb-2 pr-2 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                    {matrix.map((row, i) => (
                      <tr
                        key={row._key}
                        className={row._dirty ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}
                      >
                        <td className="py-2 pr-4">
                          <span className="font-medium text-dark-900 dark:text-white text-sm">
                            {row._label}
                          </span>
                          {row.id && (
                            <span className="ml-2 text-xs text-dark-400">#{row.id}</span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            className="input-sm w-28"
                            value={row.sku}
                            onChange={e => setMatrix(rows => rows.map((r, j) =>
                              j === i ? { ...r, sku: e.target.value, _dirty: true } : r
                            ))}
                            placeholder="SKU"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            min="0"
                            className="input-sm w-24"
                            value={row.price}
                            onChange={e => setMatrix(rows => rows.map((r, j) =>
                              j === i ? { ...r, price: e.target.value, _dirty: true } : r
                            ))}
                            placeholder="Price"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            min="0"
                            className="input-sm w-24"
                            value={row.compare_price}
                            onChange={e => setMatrix(rows => rows.map((r, j) =>
                              j === i ? { ...r, compare_price: e.target.value, _dirty: true } : r
                            ))}
                            placeholder="MRP"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            min="0"
                            className="input-sm w-20"
                            value={row.stock_quantity}
                            onChange={e => setMatrix(rows => rows.map((r, j) =>
                              j === i ? { ...r, stock_quantity: e.target.value, _dirty: true } : r
                            ))}
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="checkbox"
                            className="rounded text-primary-500 focus:ring-primary-500"
                            checked={row.is_active}
                            onChange={e => setMatrix(rows => rows.map((r, j) =>
                              j === i ? { ...r, is_active: e.target.checked, _dirty: true } : r
                            ))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => batchMutation.mutate(matrix)}
                  disabled={batchMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {batchMutation.isPending ? 'Saving...' : 'Save All Variants'}
                </button>
              </div>
            </div>
          )}

          {selectedAttrs.length > 0 && matrix.length === 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 text-center text-sm text-dark-400">
              Click <strong>Save & Generate Matrix</strong> to build the variant combinations.
            </div>
          )}
        </>
      )}

      {/* ── SIMPLE MODE ───────────────────────────────────────────────────── */}
      {mode === 'simple' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-dark-900 dark:text-white">Variants</h3>
            {!addingSimple && (
              <button
                type="button"
                onClick={() => setAddingSimple(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add Variant
              </button>
            )}
          </div>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-5">
            Simple variant list — each variant gets a name, SKU, price, and stock.
          </p>

          {(simpleVariants.length > 0 || addingSimple) && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 dark:border-dark-700 text-left text-xs uppercase tracking-wider text-dark-500 dark:text-dark-400">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">SKU</th>
                    <th className="pb-2 pr-4 font-medium">Price</th>
                    <th className="pb-2 pr-4 font-medium">MRP</th>
                    <th className="pb-2 pr-4 font-medium">Stock</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                  {simpleVariants.map(v =>
                    editingSimpleId === v.id ? (
                      <tr key={v.id} className="bg-primary-50/50 dark:bg-primary-900/10">
                        {(['name', 'sku', 'price', 'compare_price', 'stock_quantity'] as const).map(field => (
                          <td key={field} className="py-2 pr-3">
                            <input
                              className="input-sm w-full"
                              type={['price', 'compare_price', 'stock_quantity'].includes(field) ? 'number' : 'text'}
                              min="0"
                              value={(editSimpleForm as any)[field]}
                              onChange={e => setEditSimpleForm(f => ({ ...f, [field]: e.target.value }))}
                              autoFocus={field === 'name'}
                            />
                          </td>
                        ))}
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => updateSimpleMutation.mutate({ id: v.id, f: editSimpleForm })} disabled={updateSimpleMutation.isPending} className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"><CheckIcon className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => setEditingSimpleId(null)} className="p-1.5 rounded bg-dark-200 hover:bg-dark-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-700 dark:text-dark-200 transition-colors"><XMarkIcon className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={v.id} className="group">
                        <td className="py-2.5 pr-4 font-medium text-dark-900 dark:text-white">{(v as any).name}</td>
                        <td className="py-2.5 pr-4 text-dark-500 dark:text-dark-400 font-mono text-xs">{v.sku}</td>
                        <td className="py-2.5 pr-4 text-dark-900 dark:text-white">{v.price != null ? `Rs. ${Number(v.price).toLocaleString()}` : '—'}</td>
                        <td className="py-2.5 pr-4 text-dark-400 line-through text-xs">{v.compare_price ? `Rs. ${Number(v.compare_price).toLocaleString()}` : '—'}</td>
                        <td className="py-2.5 pr-4 text-dark-700 dark:text-dark-300">{v.stock ?? v.stock_quantity ?? 0}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => { setEditingSimpleId(v.id); setEditSimpleForm({ name: (v as any).name ?? '', sku: v.sku ?? '', price: v.price != null ? String(v.price) : '', compare_price: v.compare_price != null ? String(v.compare_price) : '', stock_quantity: String(v.stock ?? v.stock_quantity ?? 0) }) }} className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 dark:text-dark-400 transition-colors"><PlusIcon className="w-3.5 h-3.5 rotate-45" /></button>
                            <button type="button" onClick={() => { if (confirm(`Delete variant?`)) deleteSimpleMutation.mutate(v.id) }} disabled={deleteSimpleMutation.isPending} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-50"><TrashIcon className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}

                  {addingSimple && (
                    <tr className="bg-primary-50/50 dark:bg-primary-900/10">
                      {(['name', 'sku', 'price', 'compare_price', 'stock_quantity'] as const).map(field => (
                        <td key={field} className="py-2 pr-3">
                          <input
                            className="input-sm w-full"
                            type={['price', 'compare_price', 'stock_quantity'].includes(field) ? 'number' : 'text'}
                            min="0"
                            placeholder={field === 'name' ? 'e.g. 15L / Red' : field === 'sku' ? 'SKU' : field === 'stock_quantity' ? 'Stock' : field === 'price' ? 'Price' : 'MRP'}
                            value={(simpleForm as any)[field]}
                            onChange={e => setSimpleForm(f => ({ ...f, [field]: e.target.value }))}
                            autoFocus={field === 'name'}
                          />
                        </td>
                      ))}
                      <td className="py-2">
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => addSimpleMutation.mutate(simpleForm)} disabled={addSimpleMutation.isPending || !simpleForm.name || !simpleForm.sku} className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"><CheckIcon className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => setAddingSimple(false)} className="p-1.5 rounded bg-dark-200 hover:bg-dark-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-700 dark:text-dark-200 transition-colors"><XMarkIcon className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {simpleVariants.length === 0 && !addingSimple && (
            <div className="py-8 text-center border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-lg">
              <p className="text-dark-500 dark:text-dark-400 text-sm mb-3">No variants yet.</p>
              <button type="button" onClick={() => setAddingSimple(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                <PlusIcon className="w-4 h-4" />
                Add First Variant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── BulkPriceSetter sub-component ─────────────────────────────────────────

interface BulkPriceSetterProps {
  onApply: (price: number | null, comparePrice: number | null) => void
}

function BulkPriceSetter({ onApply }: BulkPriceSetterProps) {
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
      >
        Bulk set prices...
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-dark-50 dark:bg-dark-700/50 rounded-lg">
      <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Bulk set:</span>
      <input
        type="number"
        min="0"
        className="input-sm w-28"
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />
      <input
        type="number"
        min="0"
        className="input-sm w-28"
        placeholder="MRP"
        value={comparePrice}
        onChange={e => setComparePrice(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          onApply(price ? parseFloat(price) : null, comparePrice ? parseFloat(comparePrice) : null)
          setOpen(false)
          setPrice('')
          setComparePrice('')
        }}
        className="px-3 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
      >
        Apply to all
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200"
      >
        Cancel
      </button>
    </div>
  )
}
