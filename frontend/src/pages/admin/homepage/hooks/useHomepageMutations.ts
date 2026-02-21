import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Section, Stat, Feature, TrustBadge, NotableClient, Banner, Testimonial } from '../types'

export function useHomepageMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })

  const updateSection = useMutation({
    mutationFn: async ({ key, data }: { key: string; data: Partial<Section> }) => {
      await api.put(`/api/admin/homepage/sections/${key}`, data)
    },
    onSuccess: () => { invalidate(); toast.success('Section updated') },
    onError: () => toast.error('Failed to update section'),
  })

  const updateStats = useMutation({
    mutationFn: async (statsData: Stat[]) => {
      await api.put('/api/admin/homepage/stats', { stats: statsData })
    },
    onSuccess: () => { invalidate(); toast.success('Stats saved') },
    onError: () => toast.error('Failed to save stats'),
  })

  const updateFeatures = useMutation({
    mutationFn: async (featuresData: Feature[]) => {
      await api.put('/api/admin/homepage/features', { features: featuresData })
    },
    onSuccess: () => { invalidate(); toast.success('Features saved') },
    onError: () => toast.error('Failed to save features'),
  })

  const updateTrustBadges = useMutation({
    mutationFn: async (badgesData: TrustBadge[]) => {
      await api.put('/api/admin/homepage/trust-badges', { badges: badgesData })
    },
    onSuccess: () => { invalidate(); toast.success('Trust badges saved') },
    onError: () => toast.error('Failed to save trust badges'),
  })

  const updateNotableClients = useMutation({
    mutationFn: async (clientsData: NotableClient[]) => {
      await api.put('/api/admin/homepage/notable-clients', { clients: clientsData })
    },
    onSuccess: () => { invalidate(); toast.success('Notable clients saved') },
    onError: () => toast.error('Failed to save notable clients'),
  })

  const uploadClientLogo = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('logo', file)
      const response = await api.post('/api/admin/homepage/notable-clients/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.data
    },
    onError: () => toast.error('Failed to upload logo'),
  })

  const uploadHeroImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      const response = await api.post('/api/admin/homepage/hero-products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.data
    },
    onError: () => toast.error('Failed to upload hero image'),
  })

  const updateCategories = useMutation({
    mutationFn: async (categoryIds: number[]) => {
      await api.put('/api/admin/homepage/categories', {
        categories: categoryIds.map((id, index) => ({
          category_id: id,
          sort_order: index,
          is_visible: true,
        })),
      })
    },
    onSuccess: () => { invalidate(); toast.success('Categories saved') },
    onError: () => toast.error('Failed to save categories'),
  })

  const updateProducts = useMutation({
    mutationFn: async ({ section, productIds }: { section: string; productIds: number[] }) => {
      await api.put(`/api/admin/homepage/products/${section}`, {
        products: productIds.map((id, index) => ({
          product_id: id,
          sort_order: index,
          is_visible: true,
        })),
      })
    },
    onSuccess: (_, { section }) => {
      invalidate()
      const labels: Record<string, string> = { featured: 'Featured products', new_arrivals: 'New arrivals', bestsellers: 'Best sellers' }
      toast.success(`${labels[section] || section} saved`)
    },
    onError: () => toast.error('Failed to save products'),
  })

  const createBanner = useMutation({
    mutationFn: async (bannerData: Partial<Banner>) => {
      await api.post('/api/admin/homepage/banners', bannerData)
    },
    onSuccess: () => { invalidate(); toast.success('Banner created') },
    onError: () => toast.error('Failed to create banner'),
  })

  const updateBanner = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Banner> }) => {
      await api.put(`/api/admin/homepage/banners/${id}`, data)
    },
    onSuccess: () => { invalidate(); toast.success('Banner updated') },
    onError: () => toast.error('Failed to update banner'),
  })

  const deleteBanner = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/homepage/banners/${id}`)
    },
    onSuccess: () => { invalidate(); toast.success('Banner deleted') },
    onError: () => toast.error('Failed to delete banner'),
  })

  const createTestimonial = useMutation({
    mutationFn: async (testimonialData: Partial<Testimonial>) => {
      await api.post('/api/admin/homepage/testimonials', testimonialData)
    },
    onSuccess: () => { invalidate(); toast.success('Testimonial created') },
    onError: () => toast.error('Failed to create testimonial'),
  })

  const updateTestimonial = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Testimonial> }) => {
      await api.put(`/api/admin/homepage/testimonials/${id}`, data)
    },
    onSuccess: () => { invalidate(); toast.success('Testimonial updated') },
    onError: () => toast.error('Failed to update testimonial'),
  })

  const deleteTestimonial = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/homepage/testimonials/${id}`)
    },
    onSuccess: () => { invalidate(); toast.success('Testimonial deleted') },
    onError: () => toast.error('Failed to delete testimonial'),
  })

  return {
    updateSection,
    updateStats,
    updateFeatures,
    updateTrustBadges,
    updateNotableClients,
    uploadClientLogo,
    uploadHeroImage,
    updateCategories,
    updateProducts,
    createBanner,
    updateBanner,
    deleteBanner,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  }
}
