import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'

// Types
export interface BundleProduct {
  id: number
  name: string
  slug: string
  price: number
  image: string | null
  is_in_stock: boolean
}

export interface BundleItem {
  id: number
  bundle_id: number
  product_id: number
  quantity: number
  price_override: number | null
  effective_price: number
  line_total: number
  sort_order: number
  product: BundleProduct
}

export interface BundleSlotProduct {
  id: number
  bundle_slot_id: number
  product_id: number
  price_override: number | null
  effective_price: number
  product: BundleProduct
}

export interface BundleSlot {
  id: number
  bundle_id: number
  name: string
  description: string | null
  slot_order: number
  is_required: boolean
  min_selections: number
  max_selections: number
  allows_multiple: boolean
  products: BundleSlotProduct[]
  available_products?: BundleProduct[]
}

export interface Bundle {
  id: number
  name: string
  slug: string
  sku: string | null
  description: string | null
  short_description: string | null
  discount_type: 'fixed_price' | 'percentage'
  discount_value: number
  original_price: number
  discounted_price: number
  savings: number
  savings_percentage: number
  badge_label: string | null
  badge_color: string
  theme_color: string | null
  featured_image: string | null
  gallery_images: string[] | null
  video_url: string | null
  images: BundleImage[]
  is_active: boolean
  is_available: boolean
  starts_at: string | null
  ends_at: string | null
  stock_limit: number | null
  stock_sold: number
  stock_remaining: number | null
  time_remaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
    total_seconds: number
  } | null
  bundle_type: 'fixed' | 'configurable'
  cart_display: 'single_item' | 'grouped' | 'individual'
  allow_coupon_stacking: boolean
  show_on_homepage: boolean
  homepage_position: 'carousel' | 'grid' | 'banner' | null
  display_order: number
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  cta_text: string
  show_countdown: boolean
  show_savings: boolean
  items: BundleItem[]
  slots: BundleSlot[]
  products_preview: Array<{ id: number; name: string; image: string | null; is_in_stock?: boolean }>
  // Admin analytics
  view_count?: number
  add_to_cart_count?: number
  purchase_count?: number
  revenue?: number
  conversion_rate?: number
  add_to_cart_rate?: number
  created_at: string
  updated_at: string
}

export interface BundleImage {
  id: number
  bundle_id: number
  image: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

export interface SlotSelection {
  slot_id: number
  product_id?: number
  product_ids?: number[]
}

export interface PricingBreakdown {
  original_price: number
  discounted_price: number
  savings: number
  savings_percentage: number
  discount_type: 'fixed_price' | 'percentage'
  discount_value: number
  items: Array<{
    slot_id?: number
    slot_name?: string
    product_id: number
    product_name: string
    product_image: string | null
    quantity: number
    unit_price: number
    line_total: number
  }>
}

export interface HomepageBundles {
  carousel: Bundle[]
  grid: Bundle[]
  banner: Bundle[]
}

// Public API hooks

export function useBundles(params?: {
  type?: 'fixed' | 'configurable'
  search?: string
  sort_by?: string
  per_page?: number
  page?: number
}) {
  return useQuery({
    queryKey: ['bundles', params],
    queryFn: async () => {
      const { data } = await api.get('/api/bundles', { params })
      return data
    },
  })
}

export function useBundle(slug: string) {
  return useQuery({
    queryKey: ['bundle', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/bundles/${slug}`)
      return data.data as Bundle
    },
    enabled: !!slug,
  })
}

export function useHomepageBundles() {
  return useQuery({
    queryKey: ['bundles', 'homepage'],
    queryFn: async () => {
      const { data } = await api.get('/api/bundles/homepage')
      return data.data as HomepageBundles
    },
  })
}

export function useRelatedBundles(slug: string) {
  return useQuery({
    queryKey: ['bundles', 'related', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/bundles/${slug}/related`)
      return data.data as Bundle[]
    },
    enabled: !!slug,
  })
}

export function useCalculateBundlePrice() {
  return useMutation({
    mutationFn: async ({ slug, selections }: { slug: string; selections: SlotSelection[] }) => {
      const { data } = await api.post(`/api/bundles/${slug}/calculate`, { selections })
      return data.data as PricingBreakdown
    },
  })
}

export function useAddBundleToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bundleSlug,
      selections,
    }: {
      bundleSlug: string
      selections?: SlotSelection[]
    }) => {
      const { data } = await api.post('/api/cart/bundle', {
        bundle_slug: bundleSlug,
        selections,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      useCartStore.getState().fetchCart()
    },
  })
}

// Admin API hooks

export function useAdminBundles(params?: {
  search?: string
  is_active?: boolean
  type?: 'fixed' | 'configurable'
  homepage_position?: 'carousel' | 'grid' | 'banner'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}) {
  return useQuery({
    queryKey: ['admin', 'bundles', params],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/bundles', { params })
      return data
    },
  })
}

export function useAdminBundle(id: number) {
  return useQuery({
    queryKey: ['admin', 'bundle', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/bundles/${id}`)
      return data.data as Bundle
    },
    enabled: !!id,
  })
}

export function useBundleAnalytics(id: number) {
  return useQuery({
    queryKey: ['admin', 'bundle', id, 'analytics'],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/bundles/${id}/analytics`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateBundle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bundleData: Omit<Partial<Bundle>, 'items' | 'slots'> & {
      items?: Array<{ product_id: number; quantity?: number; price_override?: number }>
      slots?: Array<{
        name: string
        description?: string
        is_required?: boolean
        min_selections?: number
        max_selections?: number
        products?: Array<{ product_id: number; price_override?: number }>
      }>
    }) => {
      const { data } = await api.post('/api/admin/bundles', bundleData)
      return data.data as Bundle
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundles'] })
    },
  })
}

export function useUpdateBundle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...bundleData }: { id: number } & Omit<Partial<Bundle>, 'items' | 'slots'> & {
      items?: Array<{ product_id: number; quantity?: number; price_override?: number }>
      slots?: Array<{
        name: string
        description?: string
        is_required?: boolean
        min_selections?: number
        max_selections?: number
        products?: Array<{ product_id: number; price_override?: number }>
      }>
    }) => {
      const { data } = await api.put(`/api/admin/bundles/${id}`, bundleData)
      return data.data as Bundle
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundles'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', id] })
      queryClient.invalidateQueries({ queryKey: ['bundles', 'homepage'] })
    },
  })
}

export function useDeleteBundle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/bundles/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundles'] })
    },
  })
}

export function useDuplicateBundle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/admin/bundles/${id}/duplicate`)
      return data.data as Bundle
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundles'] })
    },
  })
}

export function useToggleBundle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put(`/api/admin/bundles/${id}/toggle`)
      return data.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundles'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', id] })
    },
  })
}

// Slot management
export function useAddBundleSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bundleId,
      ...slotData
    }: {
      bundleId: number
      name: string
      description?: string
      is_required?: boolean
      min_selections?: number
      max_selections?: number
      products?: Array<{ product_id: number; price_override?: number }>
    }) => {
      const { data } = await api.post(`/api/admin/bundles/${bundleId}/slots`, slotData)
      return data.data as BundleSlot
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

export function useUpdateBundleSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bundleId,
      slotId,
      ...slotData
    }: {
      bundleId: number
      slotId: number
      name?: string
      description?: string
      is_required?: boolean
      min_selections?: number
      max_selections?: number
      products?: Array<{ product_id: number; price_override?: number }>
    }) => {
      const { data } = await api.put(`/api/admin/bundles/${bundleId}/slots/${slotId}`, slotData)
      return data.data as BundleSlot
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

export function useRemoveBundleSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bundleId, slotId }: { bundleId: number; slotId: number }) => {
      await api.delete(`/api/admin/bundles/${bundleId}/slots/${slotId}`)
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

// Item management (fixed bundles)
export function useAddBundleItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bundleId,
      ...itemData
    }: {
      bundleId: number
      product_id: number
      quantity?: number
      price_override?: number
    }) => {
      const { data } = await api.post(`/api/admin/bundles/${bundleId}/items`, itemData)
      return data.data as BundleItem
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

export function useUpdateBundleItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bundleId,
      itemId,
      ...itemData
    }: {
      bundleId: number
      itemId: number
      quantity?: number
      price_override?: number
    }) => {
      const { data } = await api.put(`/api/admin/bundles/${bundleId}/items/${itemId}`, itemData)
      return data.data as BundleItem
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

export function useRemoveBundleItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bundleId, itemId }: { bundleId: number; itemId: number }) => {
      await api.delete(`/api/admin/bundles/${bundleId}/items/${itemId}`)
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

// Image management
export function useUploadBundleImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bundleId, images }: { bundleId: number; images: File[] }) => {
      const formData = new FormData()
      images.forEach((image) => {
        formData.append('images[]', image)
      })
      const { data } = await api.post(`/api/admin/bundles/${bundleId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

export function useDeleteBundleImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bundleId, imageId }: { bundleId: number; imageId: number }) => {
      await api.delete(`/api/admin/bundles/${bundleId}/images/${imageId}`)
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

export function useSetPrimaryBundleImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bundleId, imageId }: { bundleId: number; imageId: number }) => {
      await api.put(`/api/admin/bundles/${bundleId}/images/${imageId}/primary`)
    },
    onSuccess: (_, { bundleId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundle', bundleId] })
    },
  })
}

// Bulk actions
export function useBundleBulkAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      action,
    }: {
      ids: number[]
      action: 'activate' | 'deactivate' | 'delete'
    }) => {
      const { data } = await api.post('/api/admin/bundles/bulk', { ids, action })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bundles'] })
    },
  })
}
