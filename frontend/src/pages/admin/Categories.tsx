import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon,
  Squares2X2Icon, ListBulletIcon, XMarkIcon, CubeIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  features?: string[] | string | null
  image?: string
  parent_id?: number
  products_count: number
  is_active: boolean
  children?: Category[]
}

interface ProductSummary {
  id: number
  name: string
  sku: string
  price: number
  stock_status: string
  is_active: boolean
  primary_image: string | null
}

// Parse features from API (may be JSON string from raw DB query or array from Eloquent)
const parseFeatures = (features: string[] | string | null | undefined): string[] => {
  if (!features) return []
  if (Array.isArray(features)) return features
  try { return JSON.parse(features) } catch { return [] }
}

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    features: '',
    parent_id: '',
    is_active: true,
  })

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get('/api/admin/categories')
      return response.data.data
    },
  })

  const { data: categoryDetail, isLoading: isLoadingDetail } = useQuery<{
    category: Category
    products: ProductSummary[]
  }>({
    queryKey: ['admin-category-detail', selectedCategoryId],
    queryFn: async () => {
      const res = await api.get(`/api/admin/categories/${selectedCategoryId}`)
      return res.data.data
    },
    enabled: !!selectedCategoryId,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        features: data.features.trim()
          ? data.features.split('\n').map(f => f.trim()).filter(Boolean)
          : [],
      }
      if (editingId) {
        await api.put(`/api/admin/categories/${editingId}`, payload)
      } else {
        await api.post('/api/admin/categories', payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      if (selectedCategoryId) {
        queryClient.invalidateQueries({ queryKey: ['admin-category-detail', selectedCategoryId] })
      }
      toast.success(editingId ? 'Category updated' : 'Category created')
      resetForm()
    },
    onError: () => {
      toast.error('Failed to save category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Category deleted')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete category'
      toast.error(message)
    },
  })

  const handleEdit = (category: Category) => {
    const featuresArr = parseFeatures(category.features)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      features: featuresArr.join('\n'),
      parent_id: category.parent_id?.toString() || '',
      is_active: category.is_active,
    })
    setEditingId(category.id)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', features: '', parent_id: '', is_active: true })
    setEditingId(null)
    setShowForm(false)
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // List view render
  const renderCategoryList = (category: Category, level = 0) => (
    <div key={category.id}>
      <div className={`flex items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 ${level > 0 ? 'ml-8' : ''}`}>
        <button
          onClick={() => setSelectedCategoryId(category.id)}
          className="flex items-center gap-3 flex-1 text-left min-w-0"
        >
          {level > 0 && <ChevronRightIcon className="w-4 h-4 text-dark-300 dark:text-dark-500 flex-shrink-0" />}
          <div className="w-12 h-12 bg-dark-100 dark:bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <CategoryIcon slug={category.slug} className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-dark-900 dark:text-white truncate">{category.name}</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">{category.products_count} products</p>
          </div>
        </button>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          <span className={`hidden sm:inline px-2 py-1 text-xs font-medium rounded-full ${
            category.is_active
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-2 text-dark-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {category.children?.map((child) => renderCategoryList(child, level + 1))}
    </div>
  )

  // Grid view card render
  const renderCategoryCard = (category: Category) => (
    <div
      key={category.id}
      className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 flex flex-col"
    >
      {/* Clickable body — opens products panel */}
      <button
        onClick={() => setSelectedCategoryId(category.id)}
        className="flex-1 text-left"
      >
        {/* Status badge */}
        <div className="pt-3 pl-3 pr-3">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
            category.is_active
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Icon area */}
        <div className="h-28 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/5 transition-all duration-500" />
          <div className="group-hover:scale-110 transition-transform duration-500">
            <CategoryIcon slug={category.slug} className="w-16 h-16" />
          </div>
        </div>

        {/* Info section */}
        <div className="px-4 pb-3">
          <h3 className="font-bold text-dark-900 dark:text-white truncate">{category.name}</h3>
          <p className="text-sm text-dark-500 dark:text-dark-400">
            {category.products_count} product{category.products_count !== 1 ? 's' : ''}
          </p>
          {category.children && category.children.length > 0 && (
            <p className="text-xs text-primary-400 mt-0.5">
              {category.children.length} subcategories
            </p>
          )}
        </div>

        {/* Subcategories preview */}
        {category.children && category.children.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1">
            {category.children.slice(0, 3).map((child) => (
              <span
                key={child.id}
                className="px-2 py-0.5 text-xs bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 rounded-full truncate max-w-[100px]"
              >
                {child.name}
              </span>
            ))}
            {category.children.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-dark-100 dark:bg-dark-700 text-dark-500 dark:text-dark-400 rounded-full">
                +{category.children.length - 3} more
              </span>
            )}
          </div>
        )}
      </button>

      {/* Action bar — always visible */}
      <div className="border-t border-dark-200 dark:border-dark-700 px-3 py-2 flex items-center gap-1">
        <button
          onClick={() => setSelectedCategoryId(category.id)}
          className="flex-1 text-xs text-dark-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-1 text-center"
        >
          View Products
        </button>
        <div className="w-px h-4 bg-dark-200 dark:bg-dark-700 mx-1" />
        <button
          onClick={(e) => { e.stopPropagation(); handleEdit(category) }}
          className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors"
          title="Edit"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(category.id) }}
          className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-100 dark:hover:bg-dark-700 rounded transition-colors"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  // Resolve selected category name for the panel header (from list or from loaded detail)
  const selectedCategory = selectedCategoryId
    ? (categories?.find(c => c.id === selectedCategoryId) ?? categoryDetail?.category ?? null)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white">Categories</h1>
          <p className="text-dark-500 dark:text-dark-400">Organize your products</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View toggle */}
          <div className="flex items-center bg-dark-100 dark:bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
              }`}
              title="List view"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: editingId ? formData.slug : generateSlug(e.target.value),
                  })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Features
                <span className="text-dark-400 dark:text-dark-500 font-normal ml-1">(one per line)</span>
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={4}
                placeholder={"e.g.\nPremium Quality\nEnergy Efficient\n1 Year Warranty"}
                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
                These features are displayed on the category page. Enter one feature per line.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Parent Category</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">None (Top Level)</option>
                  {categories?.filter(c => c.id !== editingId).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-dark-700 dark:text-dark-300">Active</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn btn-primary"
              >
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-dark-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Display */}
      {isLoading ? (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-12 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : categories && categories.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.filter(c => !c.parent_id).map((category) => renderCategoryCard(category))}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-dark-200 dark:divide-dark-700">
              {categories.filter(c => !c.parent_id).map((category) => renderCategoryList(category))}
            </div>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-12 text-center text-dark-500 dark:text-dark-400">
          No categories yet. Create your first category to get started.
        </div>
      )}

      {/* Products Panel */}
      {selectedCategoryId && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedCategoryId(null)} />
          <div className="relative ml-auto w-full max-w-2xl bg-white dark:bg-dark-800 shadow-2xl flex flex-col h-full">

            {/* Panel Header */}
            <div className="flex-shrink-0 border-b border-dark-200 dark:border-dark-700 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-dark-900 dark:text-white truncate">
                    {selectedCategory?.name ?? 'Loading...'}
                  </h2>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    {isLoadingDetail
                      ? 'Loading products...'
                      : `${categoryDetail?.products?.length ?? 0} product${(categoryDetail?.products?.length ?? 0) !== 1 ? 's' : ''} in this category`
                    }
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="flex-shrink-0 p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
              {isLoadingDetail ? (
                <div className="flex justify-center py-16">
                  <LoadingSpinner size="lg" />
                </div>
              ) : categoryDetail?.products && categoryDetail.products.length > 0 ? (
                <div className="space-y-3">
                  {categoryDetail.products.map((product) => {
                    const imgSrc = product.primary_image
                      ? product.primary_image.startsWith('http') ? product.primary_image : `/storage/${product.primary_image}`
                      : null
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-dark-50 dark:bg-dark-700/50 border border-dark-100 dark:border-dark-700"
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-600 flex-shrink-0">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <CubeIcon className="w-6 h-6 text-dark-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-dark-900 dark:text-white text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">{product.sku}</p>
                        </div>

                        {/* Price + Stock */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-dark-900 dark:text-white">
                            Rs. {product.price?.toLocaleString()}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            product.stock_status === 'in_stock'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {product.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-dark-400 dark:text-dark-500">
                  <CubeIcon className="w-14 h-14 mb-4 opacity-30" />
                  <p className="text-base font-medium text-dark-600 dark:text-dark-300">
                    No products in this category
                  </p>
                  <p className="text-sm mt-1">
                    Assign products to this category from the Products page
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
