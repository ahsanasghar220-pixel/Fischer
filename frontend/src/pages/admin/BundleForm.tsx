import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  useAdminBundle,
  useCreateBundle,
  useUpdateBundle,
  useAddBundleItem,
  useRemoveBundleItem,
  useAddBundleSlot,
  useUpdateBundleSlot,
  useRemoveBundleSlot,
  useUploadBundleImages,
  useDeleteBundleImage,
  type Bundle,
} from '@/api/bundles'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  slug: string
  sku: string
  price: number
  primary_image?: string
}

type Tab = 'basic' | 'products' | 'pricing' | 'display' | 'media' | 'seo'

export default function BundleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    short_description: '',
    discount_type: 'percentage' as 'fixed_price' | 'percentage',
    discount_value: 10,
    badge_label: '',
    badge_color: 'gold',
    theme_color: '',
    video_url: '',
    is_active: true,
    starts_at: '',
    ends_at: '',
    stock_limit: '',
    bundle_type: 'fixed' as 'fixed' | 'configurable',
    cart_display: 'grouped' as 'single_item' | 'grouped' | 'individual',
    allow_coupon_stacking: false,
    show_on_homepage: false,
    homepage_position: '' as '' | 'carousel' | 'grid' | 'banner',
    display_order: 0,
    meta_title: '',
    meta_description: '',
    cta_text: 'Add Bundle to Cart',
    show_countdown: false,
    show_savings: true,
  })

  // Fixed bundle items
  const [items, setItems] = useState<Array<{
    product_id: number
    product?: Product
    quantity: number
    price_override?: number
  }>>([])

  // Configurable bundle slots
  const [slots, setSlots] = useState<Array<{
    id?: number
    name: string
    description: string
    is_required: boolean
    min_selections: number
    max_selections: number
    products: Array<{ product_id: number; product?: Product; price_override?: number }>
  }>>([])

  // Product search
  const [productSearch, setProductSearch] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)

  const { data: bundle, isLoading: loadingBundle } = useAdminBundle(Number(id))
  const createBundle = useCreateBundle()
  const updateBundle = useUpdateBundle()
  const addItem = useAddBundleItem()
  const removeItem = useRemoveBundleItem()
  const addSlot = useAddBundleSlot()
  const updateSlot = useUpdateBundleSlot()
  const removeSlot = useRemoveBundleSlot()
  const uploadImages = useUploadBundleImages()
  const deleteImage = useDeleteBundleImage()

  // Search products
  const { data: searchResults } = useQuery({
    queryKey: ['admin-products-search', productSearch],
    queryFn: async () => {
      if (!productSearch || productSearch.length < 2) return []
      const { data } = await api.get('/admin/products', {
        params: { search: productSearch, per_page: 10 },
      })
      return data.data?.data || []
    },
    enabled: productSearch.length >= 2,
  })

  // Load bundle data when editing
  useEffect(() => {
    if (bundle && isEditing) {
      setFormData({
        name: bundle.name || '',
        sku: bundle.sku || '',
        description: bundle.description || '',
        short_description: bundle.short_description || '',
        discount_type: bundle.discount_type,
        discount_value: bundle.discount_value,
        badge_label: bundle.badge_label || '',
        badge_color: bundle.badge_color || 'gold',
        theme_color: bundle.theme_color || '',
        video_url: bundle.video_url || '',
        is_active: bundle.is_active,
        starts_at: bundle.starts_at ? bundle.starts_at.slice(0, 16) : '',
        ends_at: bundle.ends_at ? bundle.ends_at.slice(0, 16) : '',
        stock_limit: bundle.stock_limit?.toString() || '',
        bundle_type: bundle.bundle_type,
        cart_display: bundle.cart_display,
        allow_coupon_stacking: bundle.allow_coupon_stacking,
        show_on_homepage: bundle.show_on_homepage,
        homepage_position: bundle.homepage_position || '',
        display_order: bundle.display_order,
        meta_title: bundle.meta_title || '',
        meta_description: bundle.meta_description || '',
        cta_text: bundle.cta_text || 'Add Bundle to Cart',
        show_countdown: bundle.show_countdown,
        show_savings: bundle.show_savings,
      })

      if (bundle.bundle_type === 'fixed' && bundle.items) {
        setItems(bundle.items.map(item => ({
          product_id: item.product_id,
          product: item.product as Product,
          quantity: item.quantity,
          price_override: item.price_override || undefined,
        })))
      }

      if (bundle.bundle_type === 'configurable' && bundle.slots) {
        setSlots(bundle.slots.map(slot => ({
          id: slot.id,
          name: slot.name,
          description: slot.description || '',
          is_required: slot.is_required,
          min_selections: slot.min_selections,
          max_selections: slot.max_selections,
          products: slot.products?.map(p => ({
            product_id: p.product_id,
            product: p.product as Product,
            price_override: p.price_override || undefined,
          })) || [],
        })))
      }
    }
  }, [bundle, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      stock_limit: formData.stock_limit ? parseInt(formData.stock_limit) : null,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
      homepage_position: formData.homepage_position || null,
      items: formData.bundle_type === 'fixed' ? items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_override: item.price_override,
      })) : undefined,
      slots: formData.bundle_type === 'configurable' ? slots.map(slot => ({
        name: slot.name,
        description: slot.description,
        is_required: slot.is_required,
        min_selections: slot.min_selections,
        max_selections: slot.max_selections,
        products: slot.products.map(p => ({
          product_id: p.product_id,
          price_override: p.price_override,
        })),
      })) : undefined,
    }

    try {
      if (isEditing) {
        await updateBundle.mutateAsync({ id: Number(id), ...payload })
        toast.success('Bundle updated successfully')
      } else {
        const newBundle = await createBundle.mutateAsync(payload)
        toast.success('Bundle created successfully')
        navigate(`/admin/bundles/${newBundle.id}`)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save bundle'
      toast.error(message)
    }
  }

  const handleAddProduct = (product: Product) => {
    if (selectedSlotIndex !== null) {
      // Add to slot
      const newSlots = [...slots]
      if (!newSlots[selectedSlotIndex].products.find(p => p.product_id === product.id)) {
        newSlots[selectedSlotIndex].products.push({
          product_id: product.id,
          product,
        })
        setSlots(newSlots)
      }
    } else {
      // Add to items
      if (!items.find(i => i.product_id === product.id)) {
        setItems([...items, { product_id: product.id, product, quantity: 1 }])
      }
    }
    setShowProductSearch(false)
    setProductSearch('')
    setSelectedSlotIndex(null)
  }

  const handleRemoveProduct = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleAddSlot = () => {
    setSlots([...slots, {
      name: `Slot ${slots.length + 1}`,
      description: '',
      is_required: true,
      min_selections: 1,
      max_selections: 1,
      products: [],
    }])
  }

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const handleRemoveSlotProduct = (slotIndex: number, productIndex: number) => {
    const newSlots = [...slots]
    newSlots[slotIndex].products = newSlots[slotIndex].products.filter((_, i) => i !== productIndex)
    setSlots(newSlots)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !id) return

    try {
      await uploadImages.mutateAsync({
        bundleId: Number(id),
        images: Array.from(files),
      })
      toast.success('Images uploaded successfully')
    } catch {
      toast.error('Failed to upload images')
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!id || !confirm('Delete this image?')) return
    try {
      await deleteImage.mutateAsync({ bundleId: Number(id), imageId })
      toast.success('Image deleted')
    } catch {
      toast.error('Failed to delete image')
    }
  }

  // Calculate prices
  const originalPrice = items.reduce((sum, item) => {
    const price = item.price_override || item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  const discountedPrice = formData.discount_type === 'fixed_price'
    ? formData.discount_value
    : originalPrice - (originalPrice * formData.discount_value / 100)

  const savings = originalPrice - discountedPrice

  const tabs: { id: Tab; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'products', label: 'Products' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'display', label: 'Display' },
    { id: 'media', label: 'Media' },
    { id: 'seo', label: 'SEO' },
  ]

  if (loadingBundle && isEditing) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/bundles')}
          className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            {isEditing ? 'Edit Bundle' : 'Create Bundle'}
          </h1>
          <p className="text-dark-500 dark:text-dark-400">
            {isEditing ? `Editing: ${bundle?.name}` : 'Create a new product bundle'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        <div className="border-b border-dark-200 dark:border-dark-700">
          <nav className="flex gap-4 px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Bundle Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Kitchen Essentials Bundle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description for cards"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Full Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Detailed bundle description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Bundle Type *
                  </label>
                  <select
                    value={formData.bundle_type}
                    onChange={(e) => setFormData({ ...formData, bundle_type: e.target.value as 'fixed' | 'configurable' })}
                    disabled={isEditing}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value="fixed">Fixed Bundle - Pre-defined products</option>
                    <option value="configurable">Configurable - Customer picks from slots</option>
                  </select>
                  {isEditing && (
                    <p className="mt-1 text-xs text-dark-500">Bundle type cannot be changed after creation</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Cart Display
                  </label>
                  <select
                    value={formData.cart_display}
                    onChange={(e) => setFormData({ ...formData, cart_display: e.target.value as 'single_item' | 'grouped' | 'individual' })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="single_item">Single Line Item</option>
                    <option value="grouped">Grouped Items</option>
                    <option value="individual">Individual Items</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_coupon_stacking}
                    onChange={(e) => setFormData({ ...formData, allow_coupon_stacking: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Allow Coupon Stacking</span>
                </label>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {formData.bundle_type === 'fixed' ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-dark-900 dark:text-white">Bundle Items</h3>
                    <button
                      type="button"
                      onClick={() => { setShowProductSearch(true); setSelectedSlotIndex(null); }}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-dark-500 dark:text-dark-400 text-center py-8">
                      No products added yet. Click "Add Product" to add items to this bundle.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-dark-50 dark:bg-dark-700 rounded-lg">
                          <div className="w-12 h-12 bg-dark-200 dark:bg-dark-600 rounded overflow-hidden flex-shrink-0">
                            {item.product?.primary_image && (
                              <img src={item.product.primary_image} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-dark-900 dark:text-white">{item.product?.name}</p>
                            <p className="text-sm text-dark-500 dark:text-dark-400">
                              {formatPrice(item.product?.price || 0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="text-xs text-dark-500 dark:text-dark-400">Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...items]
                                  newItems[index].quantity = parseInt(e.target.value) || 1
                                  setItems(newItems)
                                }}
                                className="w-16 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-center"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-dark-500 dark:text-dark-400">Override Price</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price_override || ''}
                                onChange={(e) => {
                                  const newItems = [...items]
                                  newItems[index].price_override = e.target.value ? parseFloat(e.target.value) : undefined
                                  setItems(newItems)
                                }}
                                placeholder="Original"
                                className="w-24 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-center"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-dark-900 dark:text-white">Bundle Slots</h3>
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Slot
                    </button>
                  </div>

                  {slots.length === 0 ? (
                    <p className="text-dark-500 dark:text-dark-400 text-center py-8">
                      No slots added yet. Click "Add Slot" to create selection options for customers.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="border border-dark-200 dark:border-dark-600 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={slot.name}
                                onChange={(e) => {
                                  const newSlots = [...slots]
                                  newSlots[slotIndex].name = e.target.value
                                  setSlots(newSlots)
                                }}
                                placeholder="Slot Name"
                                className="px-3 py-2 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                              />
                              <div className="flex gap-2">
                                <div>
                                  <label className="text-xs text-dark-500">Min</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={slot.min_selections}
                                    onChange={(e) => {
                                      const newSlots = [...slots]
                                      newSlots[slotIndex].min_selections = parseInt(e.target.value) || 0
                                      setSlots(newSlots)
                                    }}
                                    className="w-16 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-dark-500">Max</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={slot.max_selections}
                                    onChange={(e) => {
                                      const newSlots = [...slots]
                                      newSlots[slotIndex].max_selections = parseInt(e.target.value) || 1
                                      setSlots(newSlots)
                                    }}
                                    className="w-16 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                                  />
                                </div>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={slot.is_required}
                                    onChange={(e) => {
                                      const newSlots = [...slots]
                                      newSlots[slotIndex].is_required = e.target.checked
                                      setSlots(newSlots)
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-xs text-dark-500">Required</span>
                                </label>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(slotIndex)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {slot.products.map((product, productIndex) => (
                              <div key={productIndex} className="flex items-center gap-3 p-2 bg-dark-50 dark:bg-dark-700 rounded">
                                <div className="w-8 h-8 bg-dark-200 dark:bg-dark-600 rounded overflow-hidden">
                                  {product.product?.primary_image && (
                                    <img src={product.product.primary_image} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="flex-1 text-sm text-dark-900 dark:text-white">{product.product?.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlotProduct(slotIndex, productIndex)}
                                  className="p-1 text-red-500"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => { setShowProductSearch(true); setSelectedSlotIndex(slotIndex); }}
                              className="w-full py-2 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded text-dark-500 hover:border-primary-500 hover:text-primary-500 text-sm"
                            >
                              + Add Product to Slot
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Product Search Modal */}
              {showProductSearch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-dark-800 rounded-xl w-full max-w-lg p-6 max-h-[80vh] overflow-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-dark-900 dark:text-white">Add Product</h3>
                      <button onClick={() => { setShowProductSearch(false); setSelectedSlotIndex(null); }}>
                        <XMarkIcon className="w-5 h-5 text-dark-400" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white mb-4"
                      autoFocus
                    />
                    <div className="space-y-2">
                      {(searchResults as Product[] || []).map((product: Product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-dark-50 dark:hover:bg-dark-700 rounded-lg text-left"
                        >
                          <div className="w-10 h-10 bg-dark-100 dark:bg-dark-600 rounded overflow-hidden">
                            {product.primary_image && (
                              <img src={product.primary_image} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-dark-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-dark-500">{formatPrice(product.price)}</p>
                          </div>
                        </button>
                      ))}
                      {productSearch.length >= 2 && (!searchResults || (searchResults as Product[]).length === 0) && (
                        <p className="text-center text-dark-500 py-4">No products found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'fixed_price' | 'percentage' })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed_price">Fixed Price</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    {formData.discount_type === 'percentage' ? 'Discount Percentage *' : 'Bundle Price *'}
                  </label>
                  <div className="relative">
                    {formData.discount_type === 'percentage' && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500">%</span>
                    )}
                    {formData.discount_type === 'fixed_price' && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">Rs</span>
                    )}
                    <input
                      type="number"
                      min="0"
                      step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                      max={formData.discount_type === 'percentage' ? '100' : undefined}
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                      className={`w-full py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        formData.discount_type === 'fixed_price' ? 'pl-10 pr-4' : 'pl-4 pr-10'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              {formData.bundle_type === 'fixed' && items.length > 0 && (
                <div className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4">
                  <h4 className="font-medium text-dark-900 dark:text-white mb-3">Price Preview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">Original Price:</span>
                      <span className="text-dark-900 dark:text-white">{formatPrice(originalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">Bundle Price:</span>
                      <span className="font-bold text-dark-900 dark:text-white">{formatPrice(discountedPrice)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Customer Saves:</span>
                      <span className="font-medium">{formatPrice(savings)} ({((savings / originalPrice) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Stock Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_limit}
                  onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  className="w-full md:w-1/2 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={formData.badge_label}
                    onChange={(e) => setFormData({ ...formData, badge_label: e.target.value })}
                    placeholder="e.g., Best Value, Limited Time"
                    maxLength={50}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Badge Color
                  </label>
                  <select
                    value={formData.badge_color}
                    onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="gold">Gold</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  maxLength={100}
                  className="w-full md:w-1/2 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="border-t border-dark-200 dark:border-dark-700 pt-6">
                <h4 className="font-medium text-dark-900 dark:text-white mb-4">Homepage Display</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_on_homepage}
                      onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700 dark:text-dark-300">Show on Homepage</span>
                  </label>

                  {formData.show_on_homepage && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                          Position
                        </label>
                        <select
                          value={formData.homepage_position}
                          onChange={(e) => setFormData({ ...formData, homepage_position: e.target.value as '' | 'carousel' | 'grid' | 'banner' })}
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select Position</option>
                          <option value="carousel">Carousel</option>
                          <option value="grid">Grid</option>
                          <option value="banner">Banner</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_countdown}
                    onChange={(e) => setFormData({ ...formData, show_countdown: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Show Countdown Timer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_savings}
                    onChange={(e) => setFormData({ ...formData, show_savings: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Show Savings Amount</span>
                </label>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                    Bundle Images
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {bundle?.images?.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.image}
                          alt={image.alt_text || 'Bundle image'}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {image.is_primary && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                    <PhotoIcon className="w-8 h-8 text-dark-400" />
                    <span className="mt-2 text-sm text-dark-500">Click to upload images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {!isEditing && (
                <p className="text-dark-500 dark:text-dark-400 text-center py-8">
                  Save the bundle first to upload images
                </p>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder={formData.name || 'Bundle name will be used if empty'}
                  maxLength={255}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder={formData.short_description || 'Short description will be used if empty'}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-dark-200 dark:border-dark-700">
            <button
              type="button"
              onClick={() => navigate('/admin/bundles')}
              className="px-6 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBundle.isPending || updateBundle.isPending}
              className="btn btn-primary px-6 py-2 disabled:opacity-50"
            >
              {createBundle.isPending || updateBundle.isPending ? (
                <LoadingSpinner size="sm" />
              ) : isEditing ? (
                'Update Bundle'
              ) : (
                'Create Bundle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
