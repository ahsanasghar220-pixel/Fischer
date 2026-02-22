import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  useAdminBundle,
  useCreateBundle,
  useUpdateBundle,
  useUploadBundleImages,
  useDeleteBundleImage,
} from '@/api/bundles'
import type {
  BundleFormData,
  BundleItem,
  BundleSlot,
  BundleProductLocal,
} from './types'

const DEFAULT_FORM_DATA: BundleFormData = {
  name: '',
  sku: '',
  description: '',
  short_description: '',
  discount_type: 'percentage',
  discount_value: 10,
  badge_label: '',
  badge_color: 'gold',
  theme_color: '',
  video_url: '',
  is_active: true,
  starts_at: '',
  ends_at: '',
  stock_limit: '',
  bundle_type: 'fixed',
  cart_display: 'grouped',
  allow_coupon_stacking: false,
  show_on_homepage: false,
  homepage_position: '',
  display_order: 0,
  meta_title: '',
  meta_description: '',
  cta_text: 'Add Bundle to Cart',
  show_countdown: false,
  show_savings: true,
}

export function useBundleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState<BundleFormData>(DEFAULT_FORM_DATA)
  const [items, setItems] = useState<BundleItem[]>([])
  const [slots, setSlots] = useState<BundleSlot[]>([])

  // Product search modal state
  const [productSearch, setProductSearch] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)

  const { data: bundle, isLoading: loadingBundle } = useAdminBundle(Number(id))
  const createBundle = useCreateBundle()
  const updateBundle = useUpdateBundle()
  const uploadImages = useUploadBundleImages()
  const deleteImage = useDeleteBundleImage()

  // Fetch products when modal is open
  const { data: searchResults, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products-for-bundle', productSearch],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/products', {
        params: {
          search: productSearch || undefined,
          per_page: 100,
          is_active: true,
        },
      })
      return data.data?.data || data.data || []
    },
    enabled: showProductSearch,
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
        setItems(
          bundle.items.map((item) => ({
            product_id: item.product_id,
            product: {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              sku: '',
              price: item.product.price,
              stock_status: item.product.is_in_stock ? 'in_stock' : 'out_of_stock',
              primary_image: item.product.image || undefined,
            },
            quantity: item.quantity,
            price_override: item.price_override || undefined,
          }))
        )
      }

      if (bundle.bundle_type === 'configurable' && bundle.slots) {
        setSlots(
          bundle.slots.map((slot) => ({
            id: slot.id,
            name: slot.name,
            description: slot.description || '',
            is_required: slot.is_required,
            min_selections: slot.min_selections,
            max_selections: slot.max_selections,
            products:
              slot.products?.map((p) => ({
                product_id: p.product_id,
                product: {
                  id: p.product.id,
                  name: p.product.name,
                  slug: p.product.slug,
                  sku: '',
                  price: p.product.price,
                  stock_status: p.product.is_in_stock ? 'in_stock' : 'out_of_stock',
                  primary_image: p.product.image || undefined,
                },
                price_override: p.price_override || undefined,
              })) || [],
          }))
        )
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
      items:
        formData.bundle_type === 'fixed'
          ? items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price_override: item.price_override,
            }))
          : undefined,
      slots:
        formData.bundle_type === 'configurable'
          ? slots.map((slot) => ({
              name: slot.name,
              description: slot.description,
              is_required: slot.is_required,
              min_selections: slot.min_selections,
              max_selections: slot.max_selections,
              products: slot.products.map((p) => ({
                product_id: p.product_id,
                price_override: p.price_override,
              })),
            }))
          : undefined,
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

  // --- Product / slot handlers ---

  const handleAddProduct = (product: BundleProductLocal) => {
    if (selectedSlotIndex !== null) {
      const newSlots = [...slots]
      if (!newSlots[selectedSlotIndex].products.find((p) => p.product_id === product.id)) {
        newSlots[selectedSlotIndex].products.push({ product_id: product.id, product })
        setSlots(newSlots)
      }
    } else {
      if (!items.find((i) => i.product_id === product.id)) {
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
    setSlots([
      ...slots,
      {
        name: `Slot ${slots.length + 1}`,
        description: '',
        is_required: true,
        min_selections: 1,
        max_selections: 1,
        products: [],
      },
    ])
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
      await uploadImages.mutateAsync({ bundleId: Number(id), images: Array.from(files) })
      toast.success(`${files.length} image(s) uploaded successfully`)
      e.target.value = ''
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Failed to upload images'
      toast.error(message)
      e.target.value = ''
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

  // Price calculations (for PricingTab preview)
  const originalPrice = items.reduce((sum, item) => {
    const price = item.price_override || item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  const discountedPrice =
    formData.discount_type === 'fixed_price'
      ? formData.discount_value
      : originalPrice - (originalPrice * formData.discount_value) / 100

  const savings = originalPrice - discountedPrice

  return {
    // Router state
    id,
    isEditing,
    navigate,
    // Form
    formData,
    setFormData,
    items,
    setItems,
    slots,
    setSlots,
    // Product search modal
    productSearch,
    setProductSearch,
    showProductSearch,
    setShowProductSearch,
    selectedSlotIndex,
    setSelectedSlotIndex,
    // Data / mutations
    bundle,
    loadingBundle,
    searchResults: searchResults as BundleProductLocal[] | undefined,
    loadingProducts,
    createBundle,
    updateBundle,
    uploadImages,
    // Handlers
    handleSubmit,
    handleAddProduct,
    handleRemoveProduct,
    handleAddSlot,
    handleRemoveSlot,
    handleRemoveSlotProduct,
    handleImageUpload,
    handleDeleteImage,
    // Price preview
    originalPrice,
    discountedPrice,
    savings,
  }
}
