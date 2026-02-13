import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
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
      // Backend returns { success, data: [...] }
      return response.data.data
    },
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
        await api.put(`/admin/categories/${editingId}`, payload)
      } else {
        await api.post('/api/admin/categories', payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(editingId ? 'Category updated' : 'Category created')
      resetForm()
    },
    onError: () => {
      toast.error('Failed to save category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Category deleted')
    },
    onError: () => {
      toast.error('Failed to delete category')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', features: '', parent_id: '', is_active: true })
    setEditingId(null)
    setShowForm(false)
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  // List view render
  const renderCategoryList = (category: Category, level = 0) => (
    <div key={category.id}>
      <div className={`flex items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 ${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex items-center gap-3">
          {level > 0 && <ChevronRightIcon className="w-4 h-4 text-dark-300 dark:text-dark-500" />}
          <div className="w-12 h-12 bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl flex items-center justify-center">
            <CategoryIcon slug={category.slug} className="w-8 h-8" />
          </div>
          <div>
            <p className="font-medium text-dark-900 dark:text-white">{category.name}</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">{category.products_count} products</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            category.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this category?')) {
                  deleteMutation.mutate(category.id)
                }
              }}
              className="p-2 text-dark-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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
      className="group relative bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
    >
      {/* Status badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          category.is_active
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {category.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleEdit(category)}
          className="p-2 bg-dark-700/80 backdrop-blur-sm rounded-lg text-dark-300 hover:text-primary-400 hover:bg-dark-600 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this category?')) {
              deleteMutation.mutate(category.id)
            }
          }}
          className="p-2 bg-dark-700/80 backdrop-blur-sm rounded-lg text-dark-300 hover:text-red-400 hover:bg-dark-600 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Icon area */}
      <div className="h-36 flex items-center justify-center relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-primary-500/10 transition-all duration-500" />

        {/* Icon with hover scale */}
        <div className="group-hover:scale-110 transition-transform duration-500">
          <CategoryIcon slug={category.slug} className="w-20 h-20" />
        </div>
      </div>

      {/* Info section */}
      <div className="p-4 bg-dark-800/50 border-t border-dark-700">
        <h3 className="font-bold text-white truncate">{category.name}</h3>
        <p className="text-sm text-dark-400">{category.products_count} products</p>

        {/* Children count if any */}
        {category.children && category.children.length > 0 && (
          <p className="text-xs text-primary-400 mt-1">
            {category.children.length} subcategories
          </p>
        )}
      </div>

      {/* Subcategories preview */}
      {category.children && category.children.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-1">
          {category.children.slice(0, 3).map((child) => (
            <span
              key={child.id}
              className="px-2 py-0.5 text-xs bg-dark-700 text-dark-300 rounded-full truncate max-w-[100px]"
            >
              {child.name}
            </span>
          ))}
          {category.children.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-dark-700 text-dark-400 rounded-full">
              +{category.children.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Categories</h1>
          <p className="text-dark-500 dark:text-dark-400">Organize your products</p>
        </div>
        <div className="flex items-center gap-3">
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
              className="btn btn-primary flex items-center gap-2"
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
              <button type="button" onClick={resetForm} className="btn btn-dark-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700">
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
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.filter(c => !c.parent_id).map((category) => renderCategoryCard(category))}
          </div>
        ) : (
          // List View
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
    </div>
  )
}
