import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Product {
  id: number
  name: string
  slug: string
  sku: string
  price: number
  stock: number
  stock_status: string
  is_active: boolean
  primary_image?: string
  category?: {
    name: string
  }
}

interface PaginatedProducts {
  data: Product[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery<PaginatedProducts>({
    queryKey: ['admin-products', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const response = await api.get(`/api/admin/products?${params.toString()}`)
      return response.data.data
    },
  })

  const products = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Products</h1>
          <p className="text-dark-500 dark:text-dark-400">Manage your product catalog</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-dark-500 dark:text-dark-400">No products found.</p>
            <Link to="/admin/products/new" className="text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
              Add your first product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-700 border-b border-dark-200 dark:border-dark-600">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Product</th>
                    <th className="hidden md:table-cell text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">SKU</th>
                    <th className="hidden lg:table-cell text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Stock</th>
                    <th className="hidden sm:table-cell text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                            {product.primary_image ? (
                              <img
                                src={product.primary_image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-dark-900 dark:text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-dark-600 dark:text-dark-400">{product.sku}</td>
                      <td className="hidden lg:table-cell px-4 py-3 text-dark-600 dark:text-dark-400">{product.category?.name || '-'}</td>
                      <td className="px-4 py-3 font-medium text-dark-900 dark:text-white">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`${
                          product.stock === 0 ? 'text-red-600 dark:text-red-400' :
                          product.stock <= 10 ? 'text-orange-600 dark:text-orange-400' : 'text-dark-600 dark:text-dark-400'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="p-2 text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button className="p-2 text-dark-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.meta && data.meta.last_page > 1 && (
              <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, data.meta.total)} of {data.meta.total} products
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-dark-200 dark:border-dark-600 rounded text-sm text-dark-700 dark:text-dark-300 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.meta.last_page}
                    className="px-3 py-1 border border-dark-200 dark:border-dark-600 rounded text-sm text-dark-700 dark:text-dark-300 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
