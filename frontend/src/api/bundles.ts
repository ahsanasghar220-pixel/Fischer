import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import type { Bundle, HomepageBundles, SlotSelection, PricingBreakdown } from '@/api/bundles.types'

// Re-export all types so existing imports from '@/api/bundles' continue to work
export type {
  BundleProduct,
  BundleItem,
  BundleSlotProduct,
  BundleSlot,
  BundleImage,
  Bundle,
  SlotSelection,
  PricingBreakdown,
  HomepageBundles,
} from '@/api/bundles.types'

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

// Re-export admin hooks so any existing imports from '@/api/bundles' continue to work
export {
  useAdminBundles,
  useAdminBundle,
  useBundleAnalytics,
  useCreateBundle,
  useUpdateBundle,
  useDeleteBundle,
  useDuplicateBundle,
  useToggleBundle,
  useAddBundleSlot,
  useUpdateBundleSlot,
  useRemoveBundleSlot,
  useAddBundleItem,
  useUpdateBundleItem,
  useRemoveBundleItem,
  useUploadBundleImages,
  useDeleteBundleImage,
  useSetPrimaryBundleImage,
  useBundleBulkAction,
} from '@/api/bundles.admin'
