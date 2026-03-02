import { useState } from 'react'
import api from '@/lib/api'
import {
  PlusIcon,
  CubeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: number
  sku: string
  product_name: string
  total_b2b_demand: number
  quantity_available: number
  quantity_in_production: number
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeGap(item: InventoryItem): number {
  return item.total_b2b_demand - item.quantity_available - item.quantity_in_production
}

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void
  onSubmit: (data: { sku: string; product_name: string; quantity_available: number; quantity_in_production: number }) => void
  submitting: boolean
}

function AddModal({ onClose, onSubmit, submitting }: AddModalProps) {
  const [sku, setSku] = useState('')
  const [productName, setProductName] = useState('')
  const [inStock, setInStock] = useState('')
  const [inProd, setInProd] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku.trim() || !productName.trim()) return
    onSubmit({
      sku: sku.trim(),
      product_name: productName.trim(),
      quantity_available: parseInt(inStock) || 0,
      quantity_in_production: parseInt(inProd) || 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Inventory Entry</h2>
          <button
            onClick={onClose}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. FH-60-SS"
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Fischer Hood 60cm Stainless"
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              In Stock / Ready to Dispatch
            </label>
            <input
              type="number"
              min="0"
              value={inStock}
              onChange={(e) => setInStock(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currently in Production
            </label>
            <input
              type="number"
              min="0"
              value={inProd}
              onChange={(e) => setInProd(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding…' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Editable Row ─────────────────────────────────────────────────────────────

interface InventoryRowProps {
  item: InventoryItem
  onSave: (id: number, data: { quantity_available: number; quantity_in_production: number }) => void
  saving: boolean
}

function InventoryRow({ item, onSave, saving }: InventoryRowProps) {
  const [editing, setEditing] = useState(false)
  const [stockVal, setStockVal] = useState(item.quantity_available.toString())
  const [prodVal, setProdVal] = useState(item.quantity_in_production.toString())

  const gap = computeGap(item)

  const handleSave = () => {
    onSave(item.id, {
      quantity_available: parseInt(stockVal) || 0,
      quantity_in_production: parseInt(prodVal) || 0,
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setStockVal(item.quantity_available.toString())
    setProdVal(item.quantity_in_production.toString())
    setEditing(false)
  }

  if (editing) {
    return (
      <tr className="bg-blue-50 dark:bg-blue-900/10">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
          {item.sku}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {item.product_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-block px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            {item.total_b2b_demand}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="number"
            min="0"
            value={stockVal}
            onChange={(e) => setStockVal(e.target.value)}
            className="w-24 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="number"
            min="0"
            value={prodVal}
            onChange={(e) => setProdVal(e.target.value)}
            className="w-24 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-500">
          —
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {formatDate(item.updated_at)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
        {item.sku}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {item.product_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-block px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          {item.total_b2b_demand}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {item.quantity_available}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {item.quantity_in_production}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
        {gap > 0 ? (
          <span className="text-red-600 dark:text-red-400">{gap}</span>
        ) : (
          <span className="text-green-600 dark:text-green-400">{gap}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(item.updated_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => setEditing(true)}
          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors"
        >
          Edit
        </button>
      </td>
    </tr>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductionInventory() {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)

  const { data, isLoading, error } = useQuery<InventoryItem[]>({
    queryKey: ['production-inventory'],
    queryFn: async () => {
      const res = await api.get('/api/production/inventory')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload: {
      sku: string
      product_name: string
      quantity_available: number
      quantity_in_production: number
    }) => {
      await api.post('/api/production/inventory', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-inventory'] })
      setShowAddModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: { quantity_available: number; quantity_in_production: number }
    }) => {
      await api.put(`/api/production/inventory/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-inventory'] })
    },
  })

  const items = data ?? []

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Inventory</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Factory finished goods — completely separate from online shop stock
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Entry
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm">
          Failed to load inventory. Please refresh.
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <CubeIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">No inventory tracked yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add your first SKU using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">B2B Demand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Production</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gap</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    onSave={(id, data) => updateMutation.mutate({ id, data })}
                    saving={updateMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          submitting={createMutation.isPending}
        />
      )}
    </div>
  )
}
