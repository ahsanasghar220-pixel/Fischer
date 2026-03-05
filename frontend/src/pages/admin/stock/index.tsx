import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon as ChevronRightPageIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface StockVariant {
  id: number
  name: string
  sku: string
  stock_quantity: number
  is_active: boolean
}

interface StockProduct {
  id: number
  name: string
  sku: string
  stock_quantity: number
  stock_status: string
  variants: StockVariant[]
}

interface StockResponse {
  data: StockProduct[]
  meta: { current_page: number; last_page: number; total: number }
}

type DirtyProduct = { stock_quantity: number; stock_status: string }
type DirtyVariant = { stock_quantity: number }

const STATUS_OPTIONS = [
  { value: 'in_stock',    label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'backorder',   label: 'Backorder' },
  { value: 'preorder',    label: 'Pre-order' },
]

const statusBadge = (status: string) => {
  switch (status) {
    case 'in_stock':    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'out_of_stock': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'backorder':   return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'preorder':    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:            return 'bg-dark-100 text-dark-600'
  }
}

export default function StockManagement() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  // Dirty state: tracks unsaved changes
  const [dirtyProducts, setDirtyProducts] = useState<Record<number, DirtyProduct>>({})
  const [dirtyVariants, setDirtyVariants] = useState<Record<number, DirtyVariant>>({})

  // Set-all form
  const [setAllQty, setSetAllQty] = useState('')
  const [setAllStatus, setSetAllStatus] = useState('in_stock')

  const { data, isLoading } = useQuery<StockResponse>({
    queryKey: ['admin-stock', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString() })
      if (search) params.set('search', search)
      const res = await api.get(`/api/admin/stock?${params}`)
      return res.data.data
    },
  })

  const bulkMutation = useMutation({
    mutationFn: (payload: { products: any[]; variants: any[] }) =>
      api.put('/api/admin/stock/bulk', payload),
    onSuccess: () => {
      toast.success('Stock updated')
      setDirtyProducts({})
      setDirtyVariants({})
      queryClient.invalidateQueries({ queryKey: ['admin-stock'] })
    },
    onError: () => toast.error('Failed to update stock'),
  })

  const setAllMutation = useMutation({
    mutationFn: (payload: { stock_quantity: number; stock_status: string }) =>
      api.put('/api/admin/stock/set-all', payload),
    onSuccess: (_data, vars) => {
      toast.success(`All products set to ${vars.stock_quantity}`)
      setDirtyProducts({})
      setDirtyVariants({})
      setSetAllQty('')
      queryClient.invalidateQueries({ queryKey: ['admin-stock'] })
    },
    onError: () => toast.error('Failed to set all stock'),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const setProductField = useCallback((product: StockProduct, field: 'stock_quantity' | 'stock_status', value: any) => {
    setDirtyProducts(prev => ({
      ...prev,
      [product.id]: {
        stock_quantity: prev[product.id]?.stock_quantity ?? product.stock_quantity,
        stock_status:   prev[product.id]?.stock_status   ?? product.stock_status,
        [field]: field === 'stock_quantity' ? Math.max(0, Number(value)) : value,
      },
    }))
  }, [])

  const setVariantField = useCallback((variant: StockVariant, value: string) => {
    setDirtyVariants(prev => ({
      ...prev,
      [variant.id]: { stock_quantity: Math.max(0, Number(value)) },
    }))
  }, [])

  const saveChanges = () => {
    const products = Object.entries(dirtyProducts).map(([id, v]) => ({
      id: Number(id), ...v,
    }))
    const variants = Object.entries(dirtyVariants).map(([id, v]) => ({
      id: Number(id), ...v,
    }))
    bulkMutation.mutate({ products, variants })
  }

  const handleSetAll = (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseInt(setAllQty)
    if (isNaN(qty) || qty < 0) return toast.error('Enter a valid quantity')
    setAllMutation.mutate({ stock_quantity: qty, stock_status: setAllStatus })
  }

  const hasDirty = Object.keys(dirtyProducts).length > 0 || Object.keys(dirtyVariants).length > 0
  const products = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Stock Management</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm">Update product and variant quantities in bulk</p>
        </div>
        {hasDirty && (
          <button
            onClick={saveChanges}
            disabled={bulkMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <CheckIcon className="w-5 h-5" />
            {bulkMutation.isPending ? 'Saving...' : `Save Changes (${Object.keys(dirtyProducts).length + Object.keys(dirtyVariants).length})`}
          </button>
        )}
      </div>

      {/* Set All */}
      <form onSubmit={handleSetAll} className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
        <p className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">Quick action — set ALL products &amp; variants at once</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-dark-500 mb-1">Quantity</label>
            <input
              type="number"
              min={0}
              value={setAllQty}
              onChange={e => setSetAllQty(e.target.value)}
              placeholder="e.g. 100"
              className="w-32 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-500 mb-1">Status</label>
            <select
              value={setAllStatus}
              onChange={e => setSetAllStatus(e.target.value)}
              className="px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={setAllMutation.isPending || !setAllQty}
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-900 dark:bg-dark-700 text-white rounded-lg hover:bg-dark-800 disabled:opacity-50 transition-colors text-sm"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {setAllMutation.isPending ? 'Updating...' : 'Set All'}
          </button>
        </div>
      </form>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-dark-900 dark:bg-dark-700 text-white rounded-lg hover:bg-dark-800 transition-colors text-sm">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }} className="px-4 py-2.5 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 text-sm">
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-dark-500">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-dark-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase w-40">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase w-44">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                {products.map(product => {
                  const dp = dirtyProducts[product.id]
                  const currentQty    = dp?.stock_quantity ?? product.stock_quantity
                  const currentStatus = dp?.stock_status   ?? product.stock_status
                  const isDirty = !!dp
                  const hasVariants = product.variants.length > 0
                  const isExpanded = expanded.has(product.id)

                  return [
                    <tr
                      key={`p-${product.id}`}
                      className={`hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors ${isDirty ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                    >
                      <td className="px-4 py-3">
                        {hasVariants && (
                          <button onClick={() => toggleExpand(product.id)} className="text-dark-400 hover:text-dark-700">
                            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-dark-900 dark:text-white text-sm">{product.name}</div>
                        {hasVariants && (
                          <div className="text-xs text-dark-400 mt-0.5">{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400 font-mono">{product.sku || '—'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={currentQty}
                          onChange={e => setProductField(product, 'stock_quantity', e.target.value)}
                          className="w-24 px-2 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={currentStatus}
                          onChange={e => setProductField(product, 'stock_status', e.target.value)}
                          className={`text-xs font-medium px-2 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${statusBadge(currentStatus)}`}
                        >
                          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                    </tr>,

                    // Variant rows
                    ...(isExpanded ? product.variants.map(variant => {
                      const dv = dirtyVariants[variant.id]
                      const variantQty = dv?.stock_quantity ?? variant.stock_quantity
                      const isVariantDirty = !!dv
                      return (
                        <tr
                          key={`v-${variant.id}`}
                          className={`border-l-2 border-primary-300 dark:border-primary-700 ${isVariantDirty ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-dark-50/50 dark:bg-dark-900/30'}`}
                        >
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 pl-8">
                            <span className="text-sm text-dark-700 dark:text-dark-300">{variant.name}</span>
                            {!variant.is_active && <span className="ml-2 text-xs text-dark-400">(inactive)</span>}
                          </td>
                          <td className="px-4 py-2 text-xs text-dark-400 font-mono">{variant.sku || '—'}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              value={variantQty}
                              onChange={e => setVariantField(variant, e.target.value)}
                              className="w-24 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-xs text-dark-400">—</td>
                        </tr>
                      )
                    }) : []),
                  ]
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 dark:border-dark-700">
            <p className="text-sm text-dark-500">
              Page {meta.current_page} of {meta.last_page} ({meta.total} products)
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700">
                <ChevronRightPageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      {hasDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dark-900 dark:bg-dark-700 text-white rounded-xl shadow-2xl px-6 py-3 flex items-center gap-4 z-40 !mt-0">
          <span className="text-sm">
            {Object.keys(dirtyProducts).length + Object.keys(dirtyVariants).length} unsaved change{Object.keys(dirtyProducts).length + Object.keys(dirtyVariants).length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => { setDirtyProducts({}); setDirtyVariants({}) }}
            className="text-sm text-dark-300 hover:text-white transition-colors"
          >
            Discard
          </button>
          <button
            onClick={saveChanges}
            disabled={bulkMutation.isPending}
            className="px-4 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {bulkMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
