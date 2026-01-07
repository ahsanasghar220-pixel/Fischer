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
      const response = await api.get(`/admin/products?${params.toString()}`)
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Products</h1>
          <p className="text-dark-500">Manage your product catalog</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Product</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">SKU</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Stock</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.data.map((product) => (
                    <tr key={product.id} className="hover:bg-dark-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-dark-100 rounded-lg overflow-hidden flex-shrink-0">
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
                          <span className="font-medium text-dark-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark-600">{product.sku}</td>
                      <td className="px-4 py-3 text-dark-600">{product.category?.name || '-'}</td>
                      <td className="px-4 py-3 font-medium text-dark-900">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock <= 10 ? 'text-orange-600' : 'text-dark-600'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-100 rounded"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded">
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
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-dark-500">
                  Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, data.meta.total)} of {data.meta.total} products
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.meta.last_page}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
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
