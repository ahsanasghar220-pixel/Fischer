import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { Product, ProductImage, Category } from '@/types'
import BasicInfoTab from './BasicInfoTab'
import MediaTab from './MediaTab'
import VariantsTab from './VariantsTab'
import SeoTab from './SeoTab'

interface FilePreview {
  file: File
  preview: string
}

type FormData = {
  name: string
  sku: string
  description: string
  short_description: string
  price: string
  compare_price: string
  cost_price: string
  stock: string
  low_stock_threshold: string
  stock_status: string
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  is_bestseller: boolean
  category_id: string
  brand_id: string
  weight: string
  dimensions: string
  meta_title: string
  meta_description: string
}

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'

  const [formData, setFormData] = useState<FormData>({
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
      const response = await api.get(`/api/admin/products/${id}`)
      return response.data.data
    },
    enabled: !isNew,
  })

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const response = await api.get('/api/admin/categories')
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
    await api.post(`/api/admin/products/${productId}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
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
        const response = await api.post('/api/admin/products', payload)
        const newProduct = response.data.data?.data || response.data.data
        if (pendingFiles.length > 0 && newProduct?.id) {
          await uploadImages(newProduct.id, pendingFiles.map(f => f.file))
        }
        return response
      } else {
        const response = await api.put(`/api/admin/products/${id}`, payload)
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
      await api.delete(`/api/admin/products/${id}/images/${imageId}`)
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
      await api.put(`/api/admin/products/${id}/images/${imageId}/primary`)
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
    e.target.value = ''
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
          <BasicInfoTab
            formData={formData}
            errors={errors}
            categories={categories}
            onChange={handleChange}
          />

          <MediaTab
            isNew={isNew}
            product={product}
            pendingFiles={pendingFiles}
            uploadingImages={uploadingImages}
            onFileSelect={handleFileSelect}
            onRemovePending={removePendingFile}
            onUploadNow={() => uploadNowMutation.mutate(pendingFiles.map(f => f.file))}
            onDeleteImage={(imageId) => deleteImageMutation.mutate(imageId)}
            onSetPrimary={(imageId) => setPrimaryMutation.mutate(imageId)}
            getImageUrl={getImageUrl}
            setPrimaryPending={setPrimaryMutation.isPending}
            deleteImagePending={deleteImageMutation.isPending}
          />

          <VariantsTab product={product} />

          <SeoTab formData={formData} onChange={handleChange} />
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
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
