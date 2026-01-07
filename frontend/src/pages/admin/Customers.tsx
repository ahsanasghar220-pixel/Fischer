import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, EyeIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  orders_count: number
  total_spent: number
  loyalty_points: number
  created_at: string
  last_order_at?: string
}

interface PaginatedCustomers {
  data: Customer[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PaginatedCustomers>({
    queryKey: ['admin-customers', page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      const response = await api.get(`/admin/customers?${params.toString()}`)
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Customers</h1>
        <p className="text-dark-500">Manage your customer base</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-dark-900">1,234</p>
          <p className="text-sm text-dark-500">Total Customers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-dark-900">56</p>
          <p className="text-sm text-dark-500">New This Month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-dark-900">78%</p>
          <p className="text-sm text-dark-500">Repeat Customers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-dark-900">{formatPrice(45000)}</p>
          <p className="text-sm text-dark-500">Avg. Lifetime Value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">All Customers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP</option>
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
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Customer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Phone</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Orders</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Total Spent</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Points</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Joined</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.data.map((customer) => (
                    <tr key={customer.id} className="hover:bg-dark-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-dark-900">{customer.name}</p>
                            <p className="text-xs text-dark-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark-600">{customer.phone || '-'}</td>
                      <td className="px-4 py-3 text-dark-900">{customer.orders_count}</td>
                      <td className="px-4 py-3 font-medium text-dark-900">
                        {formatPrice(customer.total_spent)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-primary-600">
                          <span className="text-sm">⭐</span>
                          {customer.loyalty_points}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-600 text-sm">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-100 rounded">
                            <EnvelopeIcon className="w-4 h-4" />
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
                  Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, data.meta.total)} of {data.meta.total} customers
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
