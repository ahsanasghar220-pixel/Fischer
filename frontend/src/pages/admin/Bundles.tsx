import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  useAdminBundles,
  useDeleteBundle,
  useDuplicateBundle,
  useToggleBundle,
  type Bundle,
} from '@/api/bundles'
import toast from 'react-hot-toast'

export default function AdminBundles() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useAdminBundles({
    search: search || undefined,
    type: typeFilter as 'fixed' | 'configurable' | undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page,
    per_page: 15,
  })

  const deleteBundle = useDeleteBundle()
  const duplicateBundle = useDuplicateBundle()
  const toggleBundle = useToggleBundle()

  const bundles: Bundle[] = data?.data || []
  const meta = data?.meta

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await deleteBundle.mutateAsync(id)
      toast.success('Bundle deleted successfully')
    } catch {
      toast.error('Failed to delete bundle')
    }
  }

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateBundle.mutateAsync(id)
      toast.success('Bundle duplicated successfully')
    } catch {
      toast.error('Failed to duplicate bundle')
    }
  }

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await toggleBundle.mutateAsync(id)
      toast.success(isActive ? 'Bundle deactivated' : 'Bundle activated')
    } catch {
      toast.error('Failed to toggle bundle status')
    }
  }

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      gold: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    }
    return colors[color] || colors.gold
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Bundles</h1>
          <p className="text-dark-500 dark:text-dark-400">Create and manage product bundles with special offers</p>
        </div>
        <Link to="/admin/bundles/new" className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Create Bundle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">Total Bundles</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{meta?.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">Active Bundles</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {bundles.filter(b => b.is_active).length}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">Fixed Bundles</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {bundles.filter(b => b.bundle_type === 'fixed').length}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
          <p className="text-sm text-dark-500 dark:text-dark-400">Configurable Bundles</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {bundles.filter(b => b.bundle_type === 'configurable').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search bundles..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="fixed">Fixed Bundles</option>
            <option value="configurable">Configurable Bundles</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-dark-500 dark:text-dark-400">No bundles found.</p>
            <Link to="/admin/bundles/new" className="text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
              Create your first bundle
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-700 border-b border-dark-200 dark:border-dark-600">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Bundle</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Discount</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Homepage</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                  {bundles.map((bundle) => (
                    <tr key={bundle.id} className="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                            {bundle.featured_image ? (
                              <img
                                src={bundle.featured_image}
                                alt={bundle.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-dark-900 dark:text-white block">{bundle.name}</span>
                            {bundle.badge_label && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(bundle.badge_color)}`}>
                                {bundle.badge_label}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bundle.bundle_type === 'fixed'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        }`}>
                          {bundle.bundle_type === 'fixed' ? 'Fixed' : 'Configurable'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-600 dark:text-dark-400">
                        {bundle.discount_type === 'percentage'
                          ? `${bundle.discount_value}% off`
                          : formatPrice(bundle.discount_value)
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-dark-900 dark:text-white">
                            {formatPrice(bundle.discounted_price)}
                          </span>
                          {bundle.savings > 0 && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Save {formatPrice(bundle.savings)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {bundle.show_on_homepage ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                            {bundle.homepage_position}
                          </span>
                        ) : (
                          <span className="text-dark-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(bundle.id, bundle.is_active)}
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                            bundle.is_active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200'
                          }`}
                        >
                          {bundle.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/bundle/${bundle.slug}`}
                            target="_blank"
                            className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded"
                            title="View"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/bundles/${bundle.id}/analytics`}
                            className="p-2 text-dark-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="Analytics"
                          >
                            <ChartBarIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(bundle.id)}
                            className="p-2 text-dark-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                            title="Duplicate"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/bundles/${bundle.id}`}
                            className="p-2 text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(bundle.id, bundle.name)}
                            className="p-2 text-dark-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                          >
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
            {meta && meta.last_page > 1 && (
              <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, meta.total)} of {meta.total} bundles
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
                    disabled={page === meta.last_page}
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
