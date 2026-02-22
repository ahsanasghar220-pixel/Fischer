import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Bundle, BundleSlot, BundleItem } from '@/api/bundles.types'

// Re-export types so consumers can import from one place
export type { Bundle, BundleSlot, BundleItem } from '@/api/bundles.types'

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
