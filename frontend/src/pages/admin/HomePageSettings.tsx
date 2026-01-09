import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Banner {
  id: number
  title: string
  subtitle: string
  image: string
  link: string
  position: string
  is_active: boolean
  order: number
}

interface Stat {
  id: number
  label: string
  value: string
  icon: string
}

interface Feature {
  id: number
  title: string
  description: string
  icon: string
}

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  image: string
  rating: number
}

export default function HomePageSettings() {
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState('banners')

  // Fetch banners
  const { data: banners, isLoading: bannersLoading } = useQuery<Banner[]>({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const response = await api.get('/admin/banners')
      return response.data.data || []
    },
  })

  // Fetch testimonials
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const response = await api.get('/admin/testimonials')
      return response.data.data || []
    },
  })

  // Banner mutations
  const createBannerMutation = useMutation({
    mutationFn: async (data: Partial<Banner>) => {
      await api.post('/admin/banners', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Banner created successfully')
    },
    onError: () => {
      toast.error('Failed to create banner')
    },
  })

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Banner> }) => {
      await api.put(`/admin/banners/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Banner updated successfully')
    },
    onError: () => {
      toast.error('Failed to update banner')
    },
  })

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/banners/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Banner deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete banner')
    },
  })

  // Testimonial mutations
  const createTestimonialMutation = useMutation({
    mutationFn: async (data: Partial<Testimonial>) => {
      await api.post('/admin/testimonials', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast.success('Testimonial created successfully')
    },
    onError: () => {
      toast.error('Failed to create testimonial')
    },
  })

  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Testimonial> }) => {
      await api.put(`/admin/testimonials/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast.success('Testimonial updated successfully')
    },
    onError: () => {
      toast.error('Failed to update testimonial')
    },
  })

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/testimonials/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] })
      toast.success('Testimonial deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete testimonial')
    },
  })

  // State for modals
  const [bannerModal, setBannerModal] = useState<{ open: boolean; banner: Banner | null }>({ open: false, banner: null })
  const [testimonialModal, setTestimonialModal] = useState<{ open: boolean; testimonial: Testimonial | null }>({ open: false, testimonial: null })

  // Form states
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    position: 'hero',
    is_active: true,
    order: 0,
  })

  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    content: '',
    image: '',
    rating: 5,
  })

  const openBannerModal = (banner: Banner | null = null) => {
    if (banner) {
      setBannerForm({
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        link: banner.link,
        position: banner.position,
        is_active: banner.is_active,
        order: banner.order,
      })
    } else {
      setBannerForm({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        position: 'hero',
        is_active: true,
        order: (banners?.length || 0) + 1,
      })
    }
    setBannerModal({ open: true, banner })
  }

  const openTestimonialModal = (testimonial: Testimonial | null = null) => {
    if (testimonial) {
      setTestimonialForm({
        name: testimonial.name,
        role: testimonial.role,
        content: testimonial.content,
        image: testimonial.image,
        rating: testimonial.rating,
      })
    } else {
      setTestimonialForm({
        name: '',
        role: '',
        content: '',
        image: '',
        rating: 5,
      })
    }
    setTestimonialModal({ open: true, testimonial })
  }

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bannerModal.banner) {
      updateBannerMutation.mutate({ id: bannerModal.banner.id, data: bannerForm })
    } else {
      createBannerMutation.mutate(bannerForm)
    }
    setBannerModal({ open: false, banner: null })
  }

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (testimonialModal.testimonial) {
      updateTestimonialMutation.mutate({ id: testimonialModal.testimonial.id, data: testimonialForm })
    } else {
      createTestimonialMutation.mutate(testimonialForm)
    }
    setTestimonialModal({ open: false, testimonial: null })
  }

  const sections = [
    { id: 'banners', label: 'Hero Banners' },
    { id: 'stats', label: 'Stats Section' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Testimonials' },
  ]

  // Default stats (editable)
  const [stats, setStats] = useState<Stat[]>([
    { id: 1, label: 'Years of Excellence', value: '35+', icon: 'calendar' },
    { id: 2, label: 'Happy Customers', value: '500K+', icon: 'users' },
    { id: 3, label: 'Products', value: '100+', icon: 'cube' },
    { id: 4, label: 'Cities Served', value: '50+', icon: 'map' },
  ])

  // Default features (editable)
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, title: 'Free Shipping', description: 'On orders above Rs. 10,000', icon: 'truck' },
    { id: 2, title: '2 Year Warranty', description: 'On all products', icon: 'shield' },
    { id: 3, title: 'Easy Returns', description: '30-day return policy', icon: 'refresh' },
    { id: 4, title: '24/7 Support', description: 'Customer support available', icon: 'chat' },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Home Page Settings</h1>
        <p className="text-dark-500 dark:text-dark-400">Manage your home page content and sections</p>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {/* Section Tabs */}
        <div className="border-b border-dark-200 dark:border-dark-700">
          <div className="flex overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeSection === section.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Banners Section */}
          {activeSection === 'banners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-dark-900 dark:text-white">Hero Banners</h3>
                <button
                  onClick={() => openBannerModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Banner
                </button>
              </div>

              {bannersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : banners && banners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {banners.map((banner) => (
                    <div key={banner.id} className="border border-dark-200 dark:border-dark-700 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-dark-100 dark:bg-dark-700 relative">
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-dark-400">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${banner.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-dark-900 dark:text-white truncate">{banner.title || 'Untitled'}</h4>
                        <p className="text-sm text-dark-500 dark:text-dark-400 truncate">{banner.subtitle}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-dark-400">Order: {banner.order}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openBannerModal(banner)}
                              className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this banner?')) {
                                  deleteBannerMutation.mutate(banner.id)
                                }
                              }}
                              className="p-1.5 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-500 dark:text-dark-400">
                  No banners yet. Add your first banner to get started.
                </div>
              )}
            </div>
          )}

          {/* Stats Section */}
          {activeSection === 'stats' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-dark-900 dark:text-white">Stats Section</h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Edit the statistics shown on your home page (e.g., "35+ Years of Excellence")
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={stat.id} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...stats]
                            newStats[index].value = e.target.value
                            setStats(newStats)
                          }}
                          className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-xl font-bold"
                          placeholder="35+"
                        />
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...stats]
                            newStats[index].label = e.target.value
                            setStats(newStats)
                          }}
                          className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                          placeholder="Years of Excellence"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => toast.success('Stats saved (demo)')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Stats
              </button>
            </div>
          )}

          {/* Features Section */}
          {activeSection === 'features' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-dark-900 dark:text-white">Feature Cards</h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Edit the feature cards shown below the hero (e.g., "Free Shipping", "Warranty")
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={feature.id} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...features]
                          newFeatures[index].title = e.target.value
                          setFeatures(newFeatures)
                        }}
                        className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-medium"
                        placeholder="Feature Title"
                      />
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...features]
                          newFeatures[index].description = e.target.value
                          setFeatures(newFeatures)
                        }}
                        className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                        placeholder="Feature description"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => toast.success('Features saved (demo)')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Features
              </button>
            </div>
          )}

          {/* Testimonials Section */}
          {activeSection === 'testimonials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-dark-900 dark:text-white">Testimonials</h3>
                <button
                  onClick={() => openTestimonialModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Testimonial
                </button>
              </div>

              {testimonialsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : testimonials && testimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border border-dark-200 dark:border-dark-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-dark-100 dark:bg-dark-700 overflow-hidden">
                          {testimonial.image ? (
                            <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-dark-400 text-lg">
                              {testimonial.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-900 dark:text-white">{testimonial.name}</h4>
                          <p className="text-sm text-dark-500 dark:text-dark-400">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-dark-600 dark:text-dark-400 text-sm line-clamp-3">{testimonial.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < testimonial.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openTestimonialModal(testimonial)}
                            className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this testimonial?')) {
                                deleteTestimonialMutation.mutate(testimonial.id)
                              }
                            }}
                            className="p-1.5 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-500 dark:text-dark-400">
                  No testimonials yet. Add your first testimonial to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banner Modal */}
      {bannerModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">
                {bannerModal.banner ? 'Edit Banner' : 'Add Banner'}
              </h2>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="/images/banner.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="/shop"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Position</label>
                    <select
                      value={bannerForm.position}
                      onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
                      className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    >
                      <option value="hero">Hero</option>
                      <option value="promo">Promo</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Order</label>
                    <input
                      type="number"
                      value={bannerForm.order}
                      onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bannerForm.is_active}
                    onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Active</span>
                </label>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setBannerModal({ open: false, banner: null })}
                    className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createBannerMutation.isPending || updateBannerMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {testimonialModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">
                {testimonialModal.testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Role/Title</label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="Customer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Content</label>
                  <textarea
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={testimonialForm.image}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="/images/avatar.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Rating</label>
                  <select
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setTestimonialModal({ open: false, testimonial: null })}
                    className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createTestimonialMutation.isPending || updateTestimonialMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
