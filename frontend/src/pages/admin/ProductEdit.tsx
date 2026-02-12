import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, PhotoIcon, TrashIcon, StarIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
  slug: string
}

interface ProductImage {
  id: number
  image: string
  is_primary: boolean
}

interface Product {
  id: number
  name: string
  slug: string
  sku: string
  description: string
  short_description: string
  price: number
  compare_price: number | null
  cost_price: number | null
  stock?: number
  stock_quantity?: number
  low_stock_threshold: number
  stock_status: string
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  is_bestseller: boolean
  category_id: number | null
  brand_id: number | null
  weight: number | null
  dimensions: string | null
  meta_title: string | null
  meta_description: string | null
  images: ProductImage[]
  category?: Category
}

interface FilePreview {
  file: File
  preview: string
}

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    stock: '0',
    low_stock_threshold: '5',
    stock_status: 'in_stock',
    is_active: true,
    is_featured: false,
    is_new: false,
    is_bestseller: false,
    category_id: '',
    brand_id: '',
    weight: '',
    dimensions: '',
    meta_title: '',
    meta_description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<FilePreview[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Fetch product if editing
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const response = await api.get(`/admin/products/${id}`)
      return response.data.data
    },
    enabled: !isNew,
  })

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const response = await api.get('/admin/categories')
      return response.data.data
    },
  })

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price?.toString() || '',
        compare_price: product.compare_price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        stock: (product.stock_quantity ?? product.stock)?.toString() || '0',
        low_stock_threshold: product.low_stock_threshold?.toString() || '5',
        stock_status: product.stock_status || 'in_stock',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_new: product.is_new ?? false,
        is_bestseller: product.is_bestseller ?? false,
        category_id: product.category_id?.toString() || '',
        brand_id: product.brand_id?.toString() || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
      })
    }
  }, [product])

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      pendingFiles.forEach(f => URL.revokeObjectURL(f.preview))
    }
  }, [pendingFiles])

  // Upload images helper
  const uploadImages = async (productId: number, files: File[]) => {
    if (files.length === 0) return
    const fd = new FormData()
    files.forEach(file => fd.append('images[]', file))
    await api.post(`/admin/products/${productId}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        price: parseFloat(data.price) || 0,
        compare_price: data.compare_price ? parseFloat(data.compare_price) : null,
        cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
        stock: parseInt(data.stock) || 0,
        low_stock_threshold: parseInt(data.low_stock_threshold) || 5,
        category_id: data.category_id ? parseInt(data.category_id) : null,
        brand_id: data.brand_id ? parseInt(data.brand_id) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
      }

      if (isNew) {
        const response = await api.post('/admin/products', payload)
        const newProduct = response.data.data?.data || response.data.data
        // Upload pending images for the new product
        if (pendingFiles.length > 0 && newProduct?.id) {
          await uploadImages(newProduct.id, pendingFiles.map(f => f.file))
        }
        return response
      } else {
        const response = await api.put(`/admin/products/${id}`, payload)
        // Upload any pending images for existing product
        if (pendingFiles.length > 0) {
          await uploadImages(Number(id), pendingFiles.map(f => f.file))
        }
        return response
      }
    },
    onSuccess: () => {
      pendingFiles.forEach(f => URL.revokeObjectURL(f.preview))
      setPendingFiles([])
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
      toast.success(isNew ? 'Product created successfully' : 'Product updated successfully')
      navigate('/admin/products')
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
        toast.error('Please fix the validation errors')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to save product')
      }
    },
  })

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await api.delete(`/admin/products/${id}/images/${imageId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
      toast.success('Image deleted')
    },
    onError: () => {
      toast.error('Failed to delete image')
    },
  })

  // Set primary image mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await api.put(`/admin/products/${id}/images/${imageId}/primary`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
      toast.success('Primary image updated')
    },
    onError: () => {
      toast.error('Failed to set primary image')
    },
  })

  // Upload images immediately (for existing products)
  const uploadNowMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setUploadingImages(true)
      await uploadImages(Number(id), files)
    },
    onSuccess: () => {
      setUploadingImages(false)
      pendingFiles.forEach(f => URL.revokeObjectURL(f.preview))
      setPendingFiles([])
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
      toast.success('Images uploaded successfully')
    },
    onError: () => {
      setUploadingImages(false)
      toast.error('Failed to upload images')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    saveMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPendingFiles(prev => [...prev, ...newPreviews])

    // Reset input so selecting same file again works
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const getImageUrl = (img: ProductImage) => {
    const src = img.image
    if (!src) return ''
    if (src.startsWith('http')) return src
    return src.startsWith('/') ? src : '/' + src
  }

  if (!isNew && productLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-dark-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h1>
          <p className="text-dark-500 dark:text-dark-400">
            {isNew ? 'Create a new product' : `Editing: ${product?.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Short Description
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Compare Price
                </label>
                <input
                  type="number"
                  name="compare_price"
                  value={formData.compare_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Original price for sale display"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Cost Price
                </label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="For profit calculation"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Stock Status
                </label>
                <select
                  name="stock_status"
                  value={formData.stock_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="backorder">On Backorder</option>
                  <option value="preorder">Pre-order</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Images</h2>
              {!isNew && pendingFiles.length > 0 && (
                <button
                  type="button"
                  disabled={uploadingImages}
                  onClick={() => uploadNowMutation.mutate(pendingFiles.map(f => f.file))}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  {uploadingImages ? 'Uploading...' : `Upload ${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''}`}
                </button>
              )}
            </div>

            {/* Existing Images */}
            {!isNew && product?.images && product.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">Current images ({product.images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {product.images.map((image) => (
                    <div key={image.id} className="relative group rounded-lg overflow-hidden border-2 border-dark-200 dark:border-dark-600 hover:border-primary-400 transition-colors">
                      <img
                        src={getImageUrl(image)}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                      {/* Primary badge */}
                      {image.is_primary && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full font-medium">
                          Primary
                        </span>
                      )}
                      {/* Action overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {!image.is_primary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryMutation.mutate(image.id)}
                            disabled={setPrimaryMutation.isPending}
                            className="p-2 bg-white rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors shadow-lg"
                            title="Set as primary"
                          >
                            <StarIcon className="w-5 h-5" />
                          </button>
                        )}
                        {image.is_primary && (
                          <div className="p-2 bg-yellow-500 rounded-lg text-white shadow-lg">
                            <StarIconSolid className="w-5 h-5" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this image?')) {
                              deleteImageMutation.mutate(image.id)
                            }
                          }}
                          disabled={deleteImageMutation.isPending}
                          className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors shadow-lg"
                          title="Delete image"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Uploads Preview */}
            {pendingFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-3">
                  {isNew ? 'Images to upload (will be uploaded when product is created)' : 'Pending uploads'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {pendingFiles.map((fp, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-dashed border-primary-300 dark:border-primary-700">
                      <img
                        src={fp.preview}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePendingFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                        {fp.file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Input */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
            >
              <PhotoIcon className="w-10 h-10 mx-auto text-dark-400 dark:text-dark-500 mb-3" />
              <p className="text-dark-600 dark:text-dark-400 font-medium">Click to add images</p>
              <p className="text-dark-400 dark:text-dark-500 text-sm mt-1">JPG, PNG, or WebP (max 2MB each)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Status</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-700 dark:text-dark-300">Active (visible on site)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-700 dark:text-dark-300">Featured Product</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_new"
                  checked={formData.is_new}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-700 dark:text-dark-300">New Arrival</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_bestseller"
                  checked={formData.is_bestseller}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-700 dark:text-dark-300">Bestseller</span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Shipping</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Dimensions (L x W x H cm)
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., 30 x 20 x 15"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full btn btn-primary disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving...' : (isNew ? 'Create Product' : 'Save Changes')}
              </button>
              <Link
                to="/admin/products"
                className="w-full btn btn-secondary block text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
