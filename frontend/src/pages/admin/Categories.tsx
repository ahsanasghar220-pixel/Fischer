import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: number
  products_count: number
  is_active: boolean
  children?: Category[]
}

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    is_active: true,
  })

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get('/admin/categories')
      // Backend returns { success, data: { data: [...] } }
      return response.data.data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, data)
      } else {
        await api.post('/admin/categories', data)
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
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
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
    setFormData({ name: '', slug: '', description: '', parent_id: '', is_active: true })
    setEditingId(null)
    setShowForm(false)
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const renderCategory = (category: Category, level = 0) => (
    <div key={category.id}>
      <div className={`flex items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 ${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex items-center gap-3">
          {level > 0 && <ChevronRightIcon className="w-4 h-4 text-dark-300 dark:text-dark-500" />}
          {category.image && (
            <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
          )}
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
      {category.children?.map((child) => renderCategory(child, level + 1))}
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

      {/* Categories List */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {categories.filter(c => !c.parent_id).map((category) => renderCategory(category))}
          </div>
        ) : (
          <div className="p-12 text-center text-dark-500 dark:text-dark-400">
            No categories yet. Create your first category to get started.
          </div>
        )}
      </div>
    </div>
  )
}
