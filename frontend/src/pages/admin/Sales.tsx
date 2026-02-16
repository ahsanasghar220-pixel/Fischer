import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface SaleProduct {
  id: number
  product_id: number
  product_name: string
  sale_price: number | null
  sort_order: number
}

interface Sale {
  id: number
  name: string
  slug: string
  description: string | null
  banner_image: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  products_count: number
  products?: SaleProduct[]
  created_at: string
}

interface SalesResponse {
  data: Sale[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

interface SaleForm {
  name: string
  description: string
  banner_image: string
  start_date: string
  end_date: string
  is_active: boolean
  products: { product_id: number; sale_price: string }[]
}

const emptyForm: SaleForm = {
  name: '',
  description: '',
  banner_image: '',
  start_date: '',
  end_date: '',
  is_active: true,
  products: [],
}

interface ProductOption {
  id: number
  name: string
  price: number
}

export default function AdminSales() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SaleForm>(emptyForm)
  const [productSearch, setProductSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<SalesResponse>({
    queryKey: ['admin-sales', page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      const res = await api.get(`/api/admin/sales?${params}`)
      return res.data.data
    },
  })

  const { data: productOptions } = useQuery<ProductOption[]>({
    queryKey: ['admin-products-list', productSearch],
    queryFn: async () => {
      const res = await api.get(`/api/admin/products?per_page=20&search=${productSearch}`)
      const products = res.data.data?.data || res.data.data || []
      return products.map((p: { id: number; name: string; price: number }) => ({
        id: p.id,
        name: p.name,
        price: p.price,
      }))
    },
    enabled: showModal,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: SaleForm) => {
      if (editingId) {
        return api.put(`/api/admin/sales/${editingId}`, data)
      }
      return api.post('/api/admin/sales', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] })
      toast.success(editingId ? 'Sale updated' : 'Sale created')
      closeModal()
    },
    onError: () => toast.error('Failed to save sale'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/sales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] })
      toast.success('Sale deleted')
    },
    onError: () => toast.error('Failed to delete sale'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.put(`/api/admin/sales/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] })
      toast.success('Sale status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const openEdit = async (sale: Sale) => {
    try {
      const res = await api.get(`/api/admin/sales/${sale.id}`)
      const detail = res.data.data?.data || res.data.data
      setForm({
        name: detail.name || '',
        description: detail.description || '',
        banner_image: detail.banner_image || '',
        start_date: detail.start_date ? detail.start_date.split('T')[0] : '',
        end_date: detail.end_date ? detail.end_date.split('T')[0] : '',
        is_active: detail.is_active ?? true,
        products: (detail.products || []).map((p: SaleProduct) => ({
          product_id: p.product_id,
          sale_price: p.sale_price?.toString() || '',
        })),
      })
      setEditingId(sale.id)
      setShowModal(true)
    } catch {
      toast.error('Failed to load sale details')
    }
  }

  const addProduct = (product: ProductOption) => {
    if (form.products.some(p => p.product_id === product.id)) return
    setForm({
      ...form,
      products: [...form.products, { product_id: product.id, sale_price: '' }],
    })
  }

  const removeProduct = (productId: number) => {
    setForm({
      ...form,
      products: form.products.filter(p => p.product_id !== productId),
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const sales = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Sales</h1>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Create Sale
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search sales..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-dark-900 dark:bg-dark-700 text-white rounded-lg hover:bg-dark-800 dark:hover:bg-dark-600 transition-colors">
          Search
        </button>
      </form>

      {/* Sales Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-dark-500">Loading sales...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-dark-500">No sales found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">End</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">{sale.name}</p>
                        <p className="text-xs text-dark-500">/sale/{sale.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">
                      {sale.products_count || 0} products
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 whitespace-nowrap">
                      {sale.start_date ? new Date(sale.start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 whitespace-nowrap">
                      {sale.end_date ? new Date(sale.end_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMutation.mutate(sale.id)}
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          sale.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-dark-100 text-dark-500 dark:bg-dark-700 dark:text-dark-400'
                        }`}
                      >
                        {sale.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <a
                          href={`/sale/${sale.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-dark-400 hover:text-dark-600 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                          title="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => openEdit(sale)}
                          className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this sale?')) {
                              deleteMutation.mutate(sale.id)
                            }
                          }}
                          className="p-1.5 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 dark:border-dark-700">
            <p className="text-sm text-dark-500">
              Page {meta.current_page} of {meta.last_page} ({meta.total} sales)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-xl w-full max-w-2xl my-8 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                {editingId ? 'Edit Sale' : 'Create Sale'}
              </h2>
              <button onClick={closeModal} className="text-dark-400 hover:text-dark-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate(form)
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Sale Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={form.banner_image}
                  onChange={e => setForm({ ...form, banner_image: e.target.value })}
                  placeholder="/images/sale-banner.webp"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-500"
                />
                <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Active</span>
              </label>

              {/* Product Picker */}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Products ({form.products.length} selected)
                </label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products to add..."
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {productSearch && productOptions && productOptions.length > 0 && (
                  <div className="mt-1 border border-dark-200 dark:border-dark-600 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-dark-700">
                    {productOptions
                      .filter(p => !form.products.some(fp => fp.product_id === p.id))
                      .map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { addProduct(p); setProductSearch('') }}
                          className="w-full text-left px-3 py-2 hover:bg-dark-50 dark:hover:bg-dark-600 text-sm text-dark-900 dark:text-white"
                        >
                          {p.name} — Rs. {p.price?.toLocaleString()}
                        </button>
                      ))}
                  </div>
                )}

                {form.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {form.products.map((p, i) => {
                      const product = productOptions?.find(po => po.id === p.product_id)
                      return (
                        <div key={p.product_id} className="flex items-center gap-2 p-2 bg-dark-50 dark:bg-dark-700 rounded-lg">
                          <span className="flex-1 text-sm text-dark-900 dark:text-white truncate">
                            {product?.name || `Product #${p.product_id}`}
                          </span>
                          <input
                            type="number"
                            value={p.sale_price}
                            onChange={e => {
                              const updated = [...form.products]
                              updated[i] = { ...updated[i], sale_price: e.target.value }
                              setForm({ ...form, products: updated })
                            }}
                            placeholder="Sale price"
                            className="w-28 px-2 py-1 text-sm border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeProduct(p.product_id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
