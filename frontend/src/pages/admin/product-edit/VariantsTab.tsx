import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Product, ProductVariant } from '@/types'

interface VariantsTabProps {
  product?: Product
}

interface VariantRow {
  name: string
  sku: string
  price: string
  compare_price: string
  stock_quantity: string
}

const emptyRow = (): VariantRow => ({
  name: '',
  sku: '',
  price: '',
  compare_price: '',
  stock_quantity: '0',
})

export default function VariantsTab({ product }: VariantsTabProps) {
  const queryClient = useQueryClient()
  const productId = product?.id

  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? [])
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState<VariantRow>(emptyRow())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<VariantRow>(emptyRow())

  // Sync local list when product prop changes (after query invalidation)
  useEffect(() => {
    setVariants(product?.variants ?? [])
  }, [product?.variants])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-product', String(productId)] })

  // Add variant
  const addMutation = useMutation({
    mutationFn: async (row: VariantRow) => {
      const res = await api.post(`/api/admin/products/${productId}/variants`, {
        name: row.name,
        sku: row.sku,
        price: row.price ? parseFloat(row.price) : null,
        compare_price: row.compare_price ? parseFloat(row.compare_price) : null,
        stock_quantity: parseInt(row.stock_quantity) || 0,
      })
      return res.data.data
    },
    onSuccess: () => {
      setAdding(false)
      setNewRow(emptyRow())
      invalidate()
      toast.success('Variant added')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || Object.values(err.response?.data?.errors ?? {})[0] || 'Failed to add variant'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    },
  })

  // Update variant
  const updateMutation = useMutation({
    mutationFn: async ({ id, row }: { id: number; row: VariantRow }) => {
      const res = await api.put(`/api/admin/products/${productId}/variants/${id}`, {
        name: row.name,
        sku: row.sku,
        price: row.price ? parseFloat(row.price) : null,
        compare_price: row.compare_price ? parseFloat(row.compare_price) : null,
        stock_quantity: parseInt(row.stock_quantity) || 0,
      })
      return res.data.data
    },
    onSuccess: () => {
      setEditingId(null)
      invalidate()
      toast.success('Variant updated')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || Object.values(err.response?.data?.errors ?? {})[0] || 'Failed to update variant'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    },
  })

  // Delete variant
  const deleteMutation = useMutation({
    mutationFn: async (variantId: number) => {
      await api.delete(`/api/admin/products/${productId}/variants/${variantId}`)
    },
    onSuccess: () => {
      invalidate()
      toast.success('Variant deleted')
    },
    onError: () => toast.error('Failed to delete variant'),
  })

  const startEdit = (v: ProductVariant) => {
    setEditingId(v.id)
    setEditRow({
      name: v.name ?? '',
      sku: v.sku ?? '',
      price: v.price != null ? String(v.price) : '',
      compare_price: v.compare_price != null ? String(v.compare_price) : '',
      stock_quantity: String(v.stock ?? v.stock_quantity ?? 0),
    })
  }

  // ── Not yet saved ──────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">Variants</h2>
        <p className="text-dark-500 dark:text-dark-400 text-sm">
          Save the product first to add variants.
        </p>
      </div>
    )
  }

  // ── Full CRUD UI ───────────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Variants</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => { setAdding(true); setNewRow(emptyRow()) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Variant
          </button>
        )}
      </div>
      <p className="text-sm text-dark-500 dark:text-dark-400 mb-5">
        Add variants to offer different options (size, color, capacity, etc.). Each variant can have its own price and stock.
      </p>

      {/* Table */}
      {(variants.length > 0 || adding) && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700 text-left text-xs uppercase tracking-wider text-dark-500 dark:text-dark-400">
                <th className="pb-2 pr-4 font-medium">Option Value</th>
                <th className="pb-2 pr-4 font-medium">SKU</th>
                <th className="pb-2 pr-4 font-medium">Price (Rs.)</th>
                <th className="pb-2 pr-4 font-medium">Orig. Price</th>
                <th className="pb-2 pr-4 font-medium">Stock</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">

              {/* Existing rows */}
              {variants.map((v) =>
                editingId === v.id ? (
                  // ── Edit row ──────────────────────────────────────────────
                  <tr key={v.id} className="bg-primary-50/50 dark:bg-primary-900/10">
                    <td className="py-2 pr-3">
                      <input
                        className="input-sm w-full"
                        value={editRow.name}
                        onChange={e => setEditRow(r => ({ ...r, name: e.target.value }))}
                        placeholder="e.g. Small"
                        autoFocus
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className="input-sm w-full"
                        value={editRow.sku}
                        onChange={e => setEditRow(r => ({ ...r, sku: e.target.value }))}
                        placeholder="SKU"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-sm w-24"
                        value={editRow.price}
                        onChange={e => setEditRow(r => ({ ...r, price: e.target.value }))}
                        placeholder="Price"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-sm w-24"
                        value={editRow.compare_price}
                        onChange={e => setEditRow(r => ({ ...r, compare_price: e.target.value }))}
                        placeholder="Original"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        className="input-sm w-20"
                        value={editRow.stock_quantity}
                        onChange={e => setEditRow(r => ({ ...r, stock_quantity: e.target.value }))}
                      />
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateMutation.mutate({ id: v.id, row: editRow })}
                          disabled={updateMutation.isPending}
                          className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                          title="Save"
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded bg-dark-200 hover:bg-dark-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-700 dark:text-dark-200 transition-colors"
                          title="Cancel"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // ── Display row ───────────────────────────────────────────
                  <tr key={v.id} className="group">
                    <td className="py-2.5 pr-4 font-medium text-dark-900 dark:text-white">{v.name}</td>
                    <td className="py-2.5 pr-4 text-dark-500 dark:text-dark-400 font-mono text-xs">{v.sku}</td>
                    <td className="py-2.5 pr-4 text-dark-900 dark:text-white">
                      {v.price != null ? `Rs. ${Number(v.price).toLocaleString()}` : <span className="text-dark-400 italic">—</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-dark-400 line-through text-xs">
                      {v.compare_price ? `Rs. ${Number(v.compare_price).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-dark-700 dark:text-dark-300">{v.stock ?? v.stock_quantity ?? 0}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startEdit(v)}
                          className="p-1.5 rounded hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 dark:text-dark-400 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete variant "${v.name}"?`)) {
                              deleteMutation.mutate(v.id)
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {/* Add row */}
              {adding && (
                <tr className="bg-primary-50/50 dark:bg-primary-900/10">
                  <td className="py-2 pr-3">
                    <input
                      className="input-sm w-full"
                      value={newRow.name}
                      onChange={e => setNewRow(r => ({ ...r, name: e.target.value }))}
                      placeholder="e.g. Small, Red, 15L"
                      autoFocus
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className="input-sm w-full"
                      value={newRow.sku}
                      onChange={e => setNewRow(r => ({ ...r, sku: e.target.value }))}
                      placeholder="SKU"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-sm w-24"
                      value={newRow.price}
                      onChange={e => setNewRow(r => ({ ...r, price: e.target.value }))}
                      placeholder="Price"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-sm w-24"
                      value={newRow.compare_price}
                      onChange={e => setNewRow(r => ({ ...r, compare_price: e.target.value }))}
                      placeholder="Original"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      className="input-sm w-20"
                      value={newRow.stock_quantity}
                      onChange={e => setNewRow(r => ({ ...r, stock_quantity: e.target.value }))}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addMutation.mutate(newRow)}
                        disabled={addMutation.isPending || !newRow.name || !newRow.sku}
                        className="p-1.5 rounded bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAdding(false); setNewRow(emptyRow()) }}
                        className="p-1.5 rounded bg-dark-200 hover:bg-dark-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-dark-700 dark:text-dark-200 transition-colors"
                        title="Cancel"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {variants.length === 0 && !adding && (
        <div className="py-8 text-center border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-lg">
          <p className="text-dark-500 dark:text-dark-400 text-sm mb-3">No variants yet.</p>
          <button
            type="button"
            onClick={() => { setAdding(true); setNewRow(emptyRow()) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add First Variant
          </button>
        </div>
      )}

      {/* Add Variant button at bottom when table already has rows */}
      {variants.length > 0 && !adding && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => { setAdding(true); setNewRow(emptyRow()) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Variant
          </button>
        </div>
      )}
    </div>
  )
}
