import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  Bars3Icon,
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Section {
  id: number
  key: string
  title: string
  subtitle: string | null
  is_enabled: boolean
  sort_order: number
  settings: Record<string, any>
}

interface Stat {
  id?: number
  label: string
  value: string
  icon: string
  sort_order: number
  is_visible: boolean
}

interface Feature {
  id?: number
  title: string
  description: string
  icon: string
  color: string
  sort_order: number
  is_visible: boolean
}

interface Testimonial {
  id?: number
  name: string
  role: string
  content: string
  image: string
  rating: number
  sort_order: number
  is_visible: boolean
}

interface Banner {
  id?: number
  title: string
  subtitle: string
  image: string
  mobile_image?: string
  button_text: string
  button_link: string
  position: string
  sort_order: number
  is_active: boolean
}

interface TrustBadge {
  id?: number
  title: string
  image?: string
  sort_order: number
  is_visible: boolean
}

interface NotableClient {
  id?: number
  name: string
  logo?: string
  website?: string
  sort_order: number
  is_visible: boolean
}

interface HomepageCategory {
  id: number
  category_id: number
  sort_order: number
  is_visible: boolean
  category: {
    id: number
    name: string
    slug: string
    image?: string
  }
}

interface Category {
  id: number
  name: string
  slug: string
  image?: string
  products_count: number
}

interface HomepageProduct {
  id: number
  product_id: number
  section: string
  sort_order: number
  is_visible: boolean
  product: {
    id: number
    name: string
    slug: string
    price: number
    sku: string
    primary_image?: string
    images?: { id: number; image: string }[]
  }
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sku: string
  primary_image?: string
  images?: { id: number; image: string }[]
}

interface HomepageData {
  sections: Section[]
  stats: Stat[]
  features: Feature[]
  testimonials: Testimonial[]
  trust_badges: TrustBadge[]
  notable_clients: NotableClient[]
  homepage_categories: HomepageCategory[]
  homepage_products: HomepageProduct[]
  banners: Banner[]
  all_categories: Category[]
  all_products: Product[]
}

const iconOptions = [
  { value: 'star', label: 'Star' },
  { value: 'users', label: 'Users' },
  { value: 'cube', label: 'Cube' },
  { value: 'fire', label: 'Fire' },
  { value: 'truck', label: 'Truck' },
  { value: 'shield', label: 'Shield' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'phone', label: 'Phone' },
  { value: 'clock', label: 'Clock' },
  { value: 'check-circle', label: 'Check Circle' },
  { value: 'gift', label: 'Gift' },
  { value: 'heart', label: 'Heart' },
]

const colorOptions = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'pink', label: 'Pink' },
  { value: 'cyan', label: 'Cyan' },
]

const validTabs = ['sections', 'banners', 'categories', 'products', 'stats', 'features', 'testimonials', 'badges', 'clients']

// Section-specific settings editor within the section modal
function SectionSettingsModal({
  section,
  settingsForm,
  onSettingsChange,
  onClose,
  onSave,
}: {
  section: Section
  settingsForm: Record<string, any>
  onSettingsChange: (s: Record<string, any>) => void
  onClose: () => void
  onSave: (title: string, subtitle: string, settings?: Record<string, any>) => void
}) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')

  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settingsForm, [key]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Only send settings if they were modified (section has known settings keys)
    const hasSettingsFields = ['hero', 'brand_statement', 'hero_products', 'categories', 'dealer_cta', 'about', 'newsletter', 'bestsellers', 'featured_products', 'new_arrivals'].includes(section.key)
    onSave(title, subtitle, hasSettingsFields ? settingsForm : undefined)
  }

  // Helper for editing a list of items (benefits, features, products)
  const renderListEditor = (key: string, fields: { name: string; label: string; type?: string }[], itemLabel: string) => {
    const items: any[] = settingsForm[key] || []
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">{itemLabel}</label>
          <button
            type="button"
            onClick={() => {
              const newItem: Record<string, string> = {}
              fields.forEach(f => { newItem[f.name] = '' })
              updateSetting(key, [...items, newItem])
            }}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        </div>
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3 border border-dark-200 dark:border-dark-700 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-500">#{idx + 1}</span>
              <div className="flex gap-1">
                {idx > 0 && (
                  <button type="button" onClick={() => {
                    const newItems = [...items]
                    ;[newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]]
                    updateSetting(key, newItems)
                  }} className="p-1 text-dark-400 hover:text-dark-600"><ChevronUpIcon className="w-3 h-3" /></button>
                )}
                {idx < items.length - 1 && (
                  <button type="button" onClick={() => {
                    const newItems = [...items]
                    ;[newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]]
                    updateSetting(key, newItems)
                  }} className="p-1 text-dark-400 hover:text-dark-600"><ChevronDownIcon className="w-3 h-3" /></button>
                )}
                <button type="button" onClick={() => updateSetting(key, items.filter((_: any, i: number) => i !== idx))} className="p-1 text-red-500 hover:text-red-600"><TrashIcon className="w-3 h-3" /></button>
              </div>
            </div>
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-xs text-dark-500 dark:text-dark-400 mb-0.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={item[field.name] || ''}
                    onChange={(e) => {
                      const newItems = [...items]
                      newItems[idx] = { ...newItems[idx], [field.name]: e.target.value }
                      updateSetting(key, newItems)
                    }}
                    rows={2}
                    className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm"
                  />
                ) : field.type === 'images' ? (
                  <textarea
                    value={(item[field.name] || []).join('\n')}
                    onChange={(e) => {
                      const newItems = [...items]
                      newItems[idx] = { ...newItems[idx], [field.name]: e.target.value.split('\n').filter(Boolean) }
                      updateSetting(key, newItems)
                    }}
                    rows={2}
                    placeholder="One image path per line"
                    className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm font-mono"
                  />
                ) : (
                  <input
                    type="text"
                    value={item[field.name] || ''}
                    onChange={(e) => {
                      const newItems = [...items]
                      newItems[idx] = { ...newItems[idx], [field.name]: e.target.value }
                      updateSetting(key, newItems)
                    }}
                    className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Simple string list editor (for about features)
  const renderStringListEditor = (key: string, label: string) => {
    const items: string[] = settingsForm[key] || []
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">{label}</label>
          <button type="button" onClick={() => updateSetting(key, [...items, ''])}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        </div>
        {items.map((item: string, idx: number) => (
          <div key={idx} className="flex gap-2">
            <input type="text" value={item} onChange={(e) => {
              const newItems = [...items]
              newItems[idx] = e.target.value
              updateSetting(key, newItems)
            }} className="flex-1 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
            <button type="button" onClick={() => updateSetting(key, items.filter((_: string, i: number) => i !== idx))} className="p-1 text-red-500"><TrashIcon className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    )
  }

  // Key-value map editor (for category_videos)
  const renderMapEditor = (key: string, label: string, keyLabel: string, valueLabel: string) => {
    const map: Record<string, string> = settingsForm[key] || {}
    const entries = Object.entries(map)
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">{label}</label>
          <button type="button" onClick={() => updateSetting(key, { ...map, '': '' })}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        </div>
        {entries.map(([k, v], idx) => (
          <div key={idx} className="flex gap-2">
            <input type="text" value={k} placeholder={keyLabel} onChange={(e) => {
              const newMap: Record<string, string> = {}
              entries.forEach(([ek, ev], i) => {
                newMap[i === idx ? e.target.value : ek] = ev
              })
              updateSetting(key, newMap)
            }} className="w-1/3 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
            <input type="text" value={v} placeholder={valueLabel} onChange={(e) => {
              const newMap = { ...map, [k]: e.target.value }
              updateSetting(key, newMap)
            }} className="flex-1 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
            <button type="button" onClick={() => {
              const newMap = { ...map }
              delete newMap[k]
              updateSetting(key, newMap)
            }} className="p-1 text-red-500"><TrashIcon className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-white">
              Edit: {section.title || section.key}
            </h2>
            <button onClick={onClose} className="p-2 text-dark-400 hover:text-dark-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields: title & subtitle */}
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Section Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Section Subtitle</label>
              <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} className={inputClass} />
            </div>

            {/* Section-specific settings */}
            {section.key === 'hero' && (
              <div className="border-t border-dark-200 dark:border-dark-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider">Hero Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Video URL</label>
                  <input type="text" value={settingsForm.video_url || ''} onChange={e => updateSetting('video_url', e.target.value)} placeholder="/videos/hero-video.mp4" className={inputClass} />
                </div>
              </div>
            )}

            {section.key === 'hero_products' && (
              <div className="border-t border-dark-200 dark:border-dark-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider">Hero Products Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Badge Text</label>
                  <input type="text" value={settingsForm.badge_text || ''} onChange={e => updateSetting('badge_text', e.target.value)} placeholder="Our Bestsellers" className={inputClass} />
                </div>
                {renderListEditor('products', [
                  { name: 'name', label: 'Product Name' },
                  { name: 'category', label: 'Category Label' },
                  { name: 'description', label: 'Description' },
                  { name: 'href', label: 'Link (e.g. /category/kitchen-hoods)' },
                  { name: 'images', label: 'Images (one path per line)', type: 'images' },
                ], 'Products')}
              </div>
            )}

            {section.key === 'categories' && (
              <div className="border-t border-dark-200 dark:border-dark-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider">Category Settings</h3>
                {renderMapEditor('category_videos', 'Category Videos', 'Category Slug', 'Video URL')}
              </div>
            )}

            {section.key === 'dealer_cta' && (
              <div className="border-t border-dark-200 dark:border-dark-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider">Dealer CTA Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Badge Text</label>
                  <input type="text" value={settingsForm.badge_text || ''} onChange={e => updateSetting('badge_text', e.target.value)} placeholder="Partnership Opportunity" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Primary Button Text</label>
                    <input type="text" value={settingsForm.button_text || ''} onChange={e => updateSetting('button_text', e.target.value)} placeholder="Apply Now" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Primary Button Link</label>
                    <input type="text" value={settingsForm.button_link || ''} onChange={e => updateSetting('button_link', e.target.value)} placeholder="/become-dealer" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Secondary Button Text</label>
                    <input type="text" value={settingsForm.secondary_button_text || ''} onChange={e => updateSetting('secondary_button_text', e.target.value)} placeholder="Contact Sales" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Secondary Button Link</label>
                    <input type="text" value={settingsForm.secondary_button_link || ''} onChange={e => updateSetting('secondary_button_link', e.target.value)} placeholder="/contact" className={inputClass} />
                  </div>
                </div>
                {renderListEditor('benefits', [
                  { name: 'title', label: 'Title' },
                  { name: 'description', label: 'Description' },
                  { name: 'icon', label: 'Icon (emoji)' },
                ], 'Benefits Cards')}
              </div>
            )}

            {section.key === 'about' && (
              <div className="border-t border-dark-200 dark:border-dark-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider">About Section Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Badge Text</label>
                  <input type="text" value={settingsForm.badge_text || ''} onChange={e => updateSetting('badge_text', e.target.value)} placeholder="About Fischer" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Content</label>
                  <textarea value={settingsForm.content || ''} onChange={e => updateSetting('content', e.target.value)} rows={4} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Image URL</label>
                    <input type="text" value={settingsForm.image || ''} onChange={e => updateSetting('image', e.target.value)} placeholder="/images/about-factory.webp" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Fallback Image</label>
                    <input type="text" value={settingsForm.fallback_image || ''} onChange={e => updateSetting('fallback_image', e.target.value)} placeholder="/images/about-fischer.webp" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Button Text</label>
                    <input type="text" value={settingsForm.button_text || ''} onChange={e => updateSetting('button_text', e.target.value)} placeholder="Learn More About Us" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Button Link</label>
                    <input type="text" value={settingsForm.button_link || ''} onChange={e => updateSetting('button_link', e.target.value)} placeholder="/about" className={inputClass} />
                  </div>
                </div>
                {renderStringListEditor('features', 'Feature Bullet Points')}
              </div>
            )}

            {section.key === 'newsletter' && (
              <div className="border-t border-dark-200 dark:border-dark-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider">Newsletter Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Placeholder Text</label>
                  <input type="text" value={settingsForm.placeholder || ''} onChange={e => updateSetting('placeholder', e.target.value)} placeholder="Enter your email address" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Button Text</label>
                  <input type="text" value={settingsForm.button_text || ''} onChange={e => updateSetting('button_text', e.target.value)} placeholder="Subscribe" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Disclaimer Text</label>
                  <input type="text" value={settingsForm.disclaimer || ''} onChange={e => updateSetting('disclaimer', e.target.value)} placeholder="No spam, unsubscribe anytime." className={inputClass} />
                </div>
              </div>
            )}

            {(section.key === 'featured_products' || section.key === 'new_arrivals' || section.key === 'bestsellers') && (
              <div className="border-t border-dark-200 dark:border-dark-700 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider">Display Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Source</label>
                    <select value={settingsForm.source || 'auto'} onChange={e => updateSetting('source', e.target.value)} className={inputClass}>
                      <option value="auto">Automatic</option>
                      <option value="manual">Manual Selection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Display Count</label>
                    <input type="number" value={settingsForm.display_count || 10} onChange={e => updateSetting('display_count', parseInt(e.target.value) || 10)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function HomePageSettings() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  // Get active tab from URL, default to 'sections'
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'sections'

  // Update URL when tab changes
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab })
  }

  // Fetch all homepage data
  const { data, isLoading, error } = useQuery<HomepageData>({
    queryKey: ['admin-homepage'],
    queryFn: async () => {
      const response = await api.get('/api/admin/homepage')
      return response.data.data
    },
  })

  // Local state for editing
  const [sections, setSections] = useState<Section[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<number[]>([])
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<number[]>([])
  const [bestsellersProducts, setBestsellersProducts] = useState<number[]>([])
  const [notableClients, setNotableClients] = useState<NotableClient[]>([])

  // Modal states
  const [bannerModal, setBannerModal] = useState<{ open: boolean; banner: Banner | null }>({ open: false, banner: null })
  const [testimonialModal, setTestimonialModal] = useState<{ open: boolean; testimonial: Testimonial | null }>({ open: false, testimonial: null })
  const [sectionModal, setSectionModal] = useState<{ open: boolean; section: Section | null }>({ open: false, section: null })
  const [sectionSettingsForm, setSectionSettingsForm] = useState<Record<string, any>>({})

  // Form states
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    image: '',
    button_text: 'Shop Now',
    button_link: '/shop',
    position: 'hero',
    is_active: true,
    sort_order: 0,
  })

  const [testimonialForm, setTestimonialForm] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    content: '',
    image: '',
    rating: 5,
    is_visible: true,
  })

  // Initialize local state when data loads
  useEffect(() => {
    if (data) {
      setSections(data.sections || [])
      setStats(data.stats || [])
      setFeatures(data.features || [])
      setTrustBadges(data.trust_badges || [])
      setNotableClients(data.notable_clients || [])
      setSelectedCategories(data.homepage_categories?.map(hc => hc.category_id) || [])
      // Initialize product selections
      const featured = data.homepage_products?.filter(hp => hp.section === 'featured').map(hp => hp.product_id) || []
      const newArrivals = data.homepage_products?.filter(hp => hp.section === 'new_arrivals').map(hp => hp.product_id) || []
      const bestsellers = data.homepage_products?.filter(hp => hp.section === 'bestsellers').map(hp => hp.product_id) || []
      setFeaturedProducts(featured)
      setNewArrivalsProducts(newArrivals)
      setBestsellersProducts(bestsellers)
    }
  }, [data])

  // Mutations
  const updateSectionMutation = useMutation({
    mutationFn: async ({ key, data }: { key: string; data: Partial<Section> }) => {
      await api.put(`/api/admin/homepage/sections/${key}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Section updated')
    },
    onError: () => toast.error('Failed to update section'),
  })

  const updateStatsMutation = useMutation({
    mutationFn: async (statsData: Stat[]) => {
      await api.put('/api/admin/homepage/stats', { stats: statsData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Stats saved')
    },
    onError: () => toast.error('Failed to save stats'),
  })

  const updateFeaturesMutation = useMutation({
    mutationFn: async (featuresData: Feature[]) => {
      await api.put('/api/admin/homepage/features', { features: featuresData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Features saved')
    },
    onError: () => toast.error('Failed to save features'),
  })

  const updateTrustBadgesMutation = useMutation({
    mutationFn: async (badgesData: TrustBadge[]) => {
      await api.put('/api/admin/homepage/trust-badges', { badges: badgesData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Trust badges saved')
    },
    onError: () => toast.error('Failed to save trust badges'),
  })

  const updateNotableClientsMutation = useMutation({
    mutationFn: async (clientsData: NotableClient[]) => {
      await api.put('/api/admin/homepage/notable-clients', { clients: clientsData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Notable clients saved')
    },
    onError: () => toast.error('Failed to save notable clients'),
  })

  const uploadClientLogoMutation = useMutation({
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

  const updateCategoriesMutation = useMutation({
    mutationFn: async (categoryIds: number[]) => {
      await api.put('/api/admin/homepage/categories', {
        categories: categoryIds.map((id, index) => ({
          category_id: id,
          sort_order: index,
          is_visible: true,
        })),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Categories saved')
    },
    onError: () => toast.error('Failed to save categories'),
  })

  const updateProductsMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      const labels: Record<string, string> = { featured: 'Featured products', new_arrivals: 'New arrivals', bestsellers: 'Best sellers' }
      toast.success(`${labels[section] || section} saved`)
    },
    onError: () => toast.error('Failed to save products'),
  })

  // Banner mutations
  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: Partial<Banner>) => {
      await api.post('/api/admin/homepage/banners', bannerData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Banner created')
      setBannerModal({ open: false, banner: null })
    },
    onError: () => toast.error('Failed to create banner'),
  })

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Banner> }) => {
      await api.put(`/api/admin/homepage/banners/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Banner updated')
      setBannerModal({ open: false, banner: null })
    },
    onError: () => toast.error('Failed to update banner'),
  })

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/homepage/banners/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Banner deleted')
    },
    onError: () => toast.error('Failed to delete banner'),
  })

  // Testimonial mutations
  const createTestimonialMutation = useMutation({
    mutationFn: async (testimonialData: Partial<Testimonial>) => {
      await api.post('/api/admin/homepage/testimonials', testimonialData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Testimonial created')
      setTestimonialModal({ open: false, testimonial: null })
    },
    onError: () => toast.error('Failed to create testimonial'),
  })

  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Testimonial> }) => {
      await api.put(`/api/admin/homepage/testimonials/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Testimonial updated')
      setTestimonialModal({ open: false, testimonial: null })
    },
    onError: () => toast.error('Failed to update testimonial'),
  })

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/homepage/testimonials/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage'] })
      toast.success('Testimonial deleted')
    },
    onError: () => toast.error('Failed to delete testimonial'),
  })

  // Handle banner form
  const openBannerModal = (banner: Banner | null = null) => {
    if (banner) {
      setBannerForm(banner)
    } else {
      setBannerForm({
        title: '',
        subtitle: '',
        image: '',
        button_text: 'Shop Now',
        button_link: '/shop',
        position: 'hero',
        is_active: true,
        sort_order: (data?.banners?.length || 0) + 1,
      })
    }
    setBannerModal({ open: true, banner })
  }

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bannerModal.banner?.id) {
      updateBannerMutation.mutate({ id: bannerModal.banner.id, data: bannerForm })
    } else {
      createBannerMutation.mutate(bannerForm)
    }
  }

  // Handle testimonial form
  const openTestimonialModal = (testimonial: Testimonial | null = null) => {
    if (testimonial) {
      setTestimonialForm(testimonial)
    } else {
      setTestimonialForm({
        name: '',
        role: '',
        content: '',
        image: '',
        rating: 5,
        is_visible: true,
      })
    }
    setTestimonialModal({ open: true, testimonial })
  }

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (testimonialModal.testimonial?.id) {
      updateTestimonialMutation.mutate({ id: testimonialModal.testimonial.id, data: testimonialForm })
    } else {
      createTestimonialMutation.mutate(testimonialForm)
    }
  }

  // Toggle section visibility
  const toggleSection = (key: string, enabled: boolean) => {
    updateSectionMutation.mutate({ key, data: { is_enabled: enabled } })
  }

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Move category up/down
  const moveCategoryUp = (index: number) => {
    if (index === 0) return
    const newCategories = [...selectedCategories]
    ;[newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]]
    setSelectedCategories(newCategories)
  }

  const moveCategoryDown = (index: number) => {
    if (index === selectedCategories.length - 1) return
    const newCategories = [...selectedCategories]
    ;[newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]]
    setSelectedCategories(newCategories)
  }

  // Product selection helpers
  const getProductState = (section: string) => {
    if (section === 'featured') return [featuredProducts, setFeaturedProducts] as const
    if (section === 'bestsellers') return [bestsellersProducts, setBestsellersProducts] as const
    return [newArrivalsProducts, setNewArrivalsProducts] as const
  }

  const toggleProduct = (productId: number, section: string) => {
    const [products, setProducts] = getProductState(section)
    setProducts(products.includes(productId)
      ? products.filter(id => id !== productId)
      : [...products, productId]
    )
  }

  const moveProductUp = (index: number, section: string) => {
    if (index === 0) return
    const [products, setProducts] = getProductState(section)
    const newProducts = [...products]
    ;[newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]]
    setProducts(newProducts)
  }

  const moveProductDown = (index: number, section: string) => {
    const [products, setProducts] = getProductState(section)
    if (index === products.length - 1) return
    const newProducts = [...products]
    ;[newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]]
    setProducts(newProducts)
  }

  const tabs = [
    { id: 'sections', label: 'Sections' },
    { id: 'banners', label: 'Banners' },
    { id: 'categories', label: 'Categories' },
    { id: 'products', label: 'Products' },
    { id: 'stats', label: 'Stats' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'badges', label: 'Trust Badges' },
    { id: 'clients', label: 'Notable Clients' },
  ]

  // Notable clients helper functions
  const updateClient = (index: number, field: keyof NotableClient, value: any) => {
    const newClients = [...notableClients]
    newClients[index] = { ...newClients[index], [field]: value }
    setNotableClients(newClients)
  }

  const moveClient = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= notableClients.length) return
    const newClients = [...notableClients]
    ;[newClients[index], newClients[newIndex]] = [newClients[newIndex], newClients[index]]
    // Update sort_order
    newClients.forEach((client, i) => {
      client.sort_order = i
    })
    setNotableClients(newClients)
  }

  const removeClient = (index: number) => {
    setNotableClients(notableClients.filter((_, i) => i !== index))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadClientLogoMutation.mutateAsync(file)
      updateClient(index, 'logo', result.path)
      toast.success('Logo uploaded')
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        Failed to load homepage settings. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Homepage Settings</h1>
        <p className="text-dark-500 dark:text-dark-400">Configure all sections of your homepage</p>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-dark-200 dark:border-dark-700">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">Section Visibility & Order</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Enable/disable sections and configure their settings</p>
                </div>
              </div>

              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.key}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      section.is_enabled
                        ? 'border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800'
                        : 'border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Bars3Icon className="w-5 h-5 text-dark-400 cursor-grab" />
                      <div>
                        <h4 className="font-medium text-dark-900 dark:text-white">{section.title || section.key}</h4>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{section.subtitle || `Configure ${section.key} section`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSectionSettingsForm(section.settings || {})
                          setSectionModal({ open: true, section })
                        }}
                        className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                        title="Edit settings"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleSection(section.key, !section.is_enabled)}
                        className={`p-2 rounded-lg ${
                          section.is_enabled
                            ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                            : 'text-dark-400 hover:text-dark-600'
                        }`}
                        title={section.is_enabled ? 'Disable section' : 'Enable section'}
                      >
                        {section.is_enabled ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && (
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

              {data?.banners && data.banners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.banners.map((banner) => (
                    <div key={banner.id} className="border border-dark-200 dark:border-dark-700 rounded-xl overflow-hidden bg-white dark:bg-dark-800">
                      <div className="aspect-video bg-dark-100 dark:bg-dark-700 relative">
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <PhotoIcon className="w-12 h-12 text-dark-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            banner.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-dark-900 dark:text-white truncate">{banner.title || 'Untitled'}</h4>
                        <p className="text-sm text-dark-500 dark:text-dark-400 truncate">{banner.subtitle || 'No subtitle'}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-dark-400">Order: {banner.sort_order}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openBannerModal(banner)}
                              className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this banner?')) {
                                  deleteBannerMutation.mutate(banner.id!)
                                }
                              }}
                              className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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
                <div className="text-center py-12 text-dark-500 dark:text-dark-400">
                  <PhotoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No banners yet. Add your first banner.</p>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-2">Homepage Categories</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
                  Select which categories to show on the homepage and arrange their order.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Categories */}
                <div>
                  <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Available Categories</h4>
                  <div className="border border-dark-200 dark:border-dark-700 rounded-lg max-h-96 overflow-y-auto">
                    {data?.all_categories?.map((category) => (
                      <label
                        key={category.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-700 border-b border-dark-100 dark:border-dark-700 last:border-b-0 ${
                          selectedCategories.includes(category.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="w-4 h-4 rounded text-primary-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-dark-900 dark:text-white">{category.name}</span>
                          <span className="text-sm text-dark-500 dark:text-dark-400 ml-2">({category.products_count} products)</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selected Categories (Ordered) */}
                <div>
                  <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Selected Categories (in order)</h4>
                  <div className="border border-dark-200 dark:border-dark-700 rounded-lg">
                    {selectedCategories.length > 0 ? (
                      selectedCategories.map((categoryId, index) => {
                        const category = data?.all_categories?.find(c => c.id === categoryId)
                        return category ? (
                          <div
                            key={categoryId}
                            className="flex items-center gap-3 p-3 border-b border-dark-100 dark:border-dark-700 last:border-b-0"
                          >
                            <span className="w-6 h-6 flex items-center justify-center bg-dark-100 dark:bg-dark-700 rounded text-sm font-medium text-dark-600 dark:text-dark-400">
                              {index + 1}
                            </span>
                            <span className="flex-1 font-medium text-dark-900 dark:text-white">{category.name}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveCategoryUp(index)}
                                disabled={index === 0}
                                className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                              >
                                <ChevronUpIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveCategoryDown(index)}
                                disabled={index === selectedCategories.length - 1}
                                className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                              >
                                <ChevronDownIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleCategory(categoryId)}
                                className="p-1 text-dark-400 hover:text-red-600"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : null
                      })
                    ) : (
                      <div className="p-6 text-center text-dark-500 dark:text-dark-400">
                        No categories selected
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => updateCategoriesMutation.mutate(selectedCategories)}
                    disabled={updateCategoriesMutation.isPending}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {updateCategoriesMutation.isPending && <LoadingSpinner size="sm" />}
                    Save Categories
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* Featured Products */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">Featured Products</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    Select products to show in the Featured Products section on the homepage.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Products */}
                  <div>
                    <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Available Products</h4>
                    <div className="border border-dark-200 dark:border-dark-700 rounded-lg max-h-80 overflow-y-auto">
                      {data?.all_products?.map((product) => (
                        <label
                          key={product.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-700 border-b border-dark-100 dark:border-dark-700 last:border-b-0 ${
                            featuredProducts.includes(product.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={featuredProducts.includes(product.id)}
                            onChange={() => toggleProduct(product.id, 'featured')}
                            className="w-4 h-4 rounded text-primary-600"
                          />
                          <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                            {product.primary_image || product.images?.[0]?.image ? (
                              <img src={product.primary_image || product.images?.[0]?.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PhotoIcon className="w-5 h-5 text-dark-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-dark-900 dark:text-white block truncate">{product.name}</span>
                            <span className="text-sm text-dark-500 dark:text-dark-400">PKR {product.price?.toLocaleString()}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Selected Featured Products (Ordered) */}
                  <div>
                    <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Selected ({featuredProducts.length})</h4>
                    <div className="border border-dark-200 dark:border-dark-700 rounded-lg">
                      {featuredProducts.length > 0 ? (
                        featuredProducts.map((productId, index) => {
                          const product = data?.all_products?.find(p => p.id === productId)
                          return product ? (
                            <div
                              key={productId}
                              className="flex items-center gap-3 p-3 border-b border-dark-100 dark:border-dark-700 last:border-b-0"
                            >
                              <span className="w-6 h-6 flex items-center justify-center bg-dark-100 dark:bg-dark-700 rounded text-sm font-medium text-dark-600 dark:text-dark-400">
                                {index + 1}
                              </span>
                              <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                                {product.primary_image || product.images?.[0]?.image ? (
                                  <img src={product.primary_image || product.images?.[0]?.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <PhotoIcon className="w-5 h-5 text-dark-400" />
                                  </div>
                                )}
                              </div>
                              <span className="flex-1 font-medium text-dark-900 dark:text-white truncate">{product.name}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveProductUp(index, 'featured')}
                                  disabled={index === 0}
                                  className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                                >
                                  <ChevronUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => moveProductDown(index, 'featured')}
                                  disabled={index === featuredProducts.length - 1}
                                  className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                                >
                                  <ChevronDownIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleProduct(productId, 'featured')}
                                  className="p-1 text-dark-400 hover:text-red-600"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : null
                        })
                      ) : (
                        <div className="p-6 text-center text-dark-500 dark:text-dark-400">
                          No products selected
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => updateProductsMutation.mutate({ section: 'featured', productIds: featuredProducts })}
                      disabled={updateProductsMutation.isPending}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {updateProductsMutation.isPending && <LoadingSpinner size="sm" />}
                      Save Featured Products
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-dark-200 dark:border-dark-700" />

              {/* New Arrivals */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">New Arrivals</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    Select products to show in the New Arrivals section on the homepage.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Products */}
                  <div>
                    <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Available Products</h4>
                    <div className="border border-dark-200 dark:border-dark-700 rounded-lg max-h-80 overflow-y-auto">
                      {data?.all_products?.map((product) => (
                        <label
                          key={product.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-700 border-b border-dark-100 dark:border-dark-700 last:border-b-0 ${
                            newArrivalsProducts.includes(product.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={newArrivalsProducts.includes(product.id)}
                            onChange={() => toggleProduct(product.id, 'new_arrivals')}
                            className="w-4 h-4 rounded text-primary-600"
                          />
                          <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                            {product.primary_image || product.images?.[0]?.image ? (
                              <img src={product.primary_image || product.images?.[0]?.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PhotoIcon className="w-5 h-5 text-dark-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-dark-900 dark:text-white block truncate">{product.name}</span>
                            <span className="text-sm text-dark-500 dark:text-dark-400">PKR {product.price?.toLocaleString()}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Selected New Arrivals (Ordered) */}
                  <div>
                    <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Selected ({newArrivalsProducts.length})</h4>
                    <div className="border border-dark-200 dark:border-dark-700 rounded-lg">
                      {newArrivalsProducts.length > 0 ? (
                        newArrivalsProducts.map((productId, index) => {
                          const product = data?.all_products?.find(p => p.id === productId)
                          return product ? (
                            <div
                              key={productId}
                              className="flex items-center gap-3 p-3 border-b border-dark-100 dark:border-dark-700 last:border-b-0"
                            >
                              <span className="w-6 h-6 flex items-center justify-center bg-dark-100 dark:bg-dark-700 rounded text-sm font-medium text-dark-600 dark:text-dark-400">
                                {index + 1}
                              </span>
                              <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                                {product.primary_image || product.images?.[0]?.image ? (
                                  <img src={product.primary_image || product.images?.[0]?.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <PhotoIcon className="w-5 h-5 text-dark-400" />
                                  </div>
                                )}
                              </div>
                              <span className="flex-1 font-medium text-dark-900 dark:text-white truncate">{product.name}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveProductUp(index, 'new_arrivals')}
                                  disabled={index === 0}
                                  className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                                >
                                  <ChevronUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => moveProductDown(index, 'new_arrivals')}
                                  disabled={index === newArrivalsProducts.length - 1}
                                  className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                                >
                                  <ChevronDownIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleProduct(productId, 'new_arrivals')}
                                  className="p-1 text-dark-400 hover:text-red-600"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : null
                        })
                      ) : (
                        <div className="p-6 text-center text-dark-500 dark:text-dark-400">
                          No products selected
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => updateProductsMutation.mutate({ section: 'new_arrivals', productIds: newArrivalsProducts })}
                      disabled={updateProductsMutation.isPending}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {updateProductsMutation.isPending && <LoadingSpinner size="sm" />}
                      Save New Arrivals
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-dark-200 dark:border-dark-700" />

              {/* Best Sellers */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">Best Sellers</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    Select products to show in the Best Sellers section. Leave empty to use automatic selection (by sales count).
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Available Products</h4>
                    <div className="border border-dark-200 dark:border-dark-700 rounded-lg max-h-80 overflow-y-auto">
                      {data?.all_products?.map((product) => (
                        <label
                          key={product.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-700 border-b border-dark-100 dark:border-dark-700 last:border-b-0 ${
                            bestsellersProducts.includes(product.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={bestsellersProducts.includes(product.id)}
                            onChange={() => toggleProduct(product.id, 'bestsellers')}
                            className="w-4 h-4 rounded text-primary-600"
                          />
                          <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                            {product.primary_image || product.images?.[0]?.image ? (
                              <img src={product.primary_image || product.images?.[0]?.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PhotoIcon className="w-5 h-5 text-dark-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-dark-900 dark:text-white block truncate">{product.name}</span>
                            <span className="text-sm text-dark-500 dark:text-dark-400">PKR {product.price?.toLocaleString()}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-dark-700 dark:text-dark-300 mb-3">Selected ({bestsellersProducts.length})</h4>
                    <div className="border border-dark-200 dark:border-dark-700 rounded-lg">
                      {bestsellersProducts.length > 0 ? (
                        bestsellersProducts.map((productId, index) => {
                          const product = data?.all_products?.find(p => p.id === productId)
                          return product ? (
                            <div
                              key={productId}
                              className="flex items-center gap-3 p-3 border-b border-dark-100 dark:border-dark-700 last:border-b-0"
                            >
                              <span className="w-6 h-6 flex items-center justify-center bg-dark-100 dark:bg-dark-700 rounded text-sm font-medium text-dark-600 dark:text-dark-400">
                                {index + 1}
                              </span>
                              <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                                {product.primary_image || product.images?.[0]?.image ? (
                                  <img src={product.primary_image || product.images?.[0]?.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <PhotoIcon className="w-5 h-5 text-dark-400" />
                                  </div>
                                )}
                              </div>
                              <span className="flex-1 font-medium text-dark-900 dark:text-white truncate">{product.name}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveProductUp(index, 'bestsellers')}
                                  disabled={index === 0}
                                  className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                                >
                                  <ChevronUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => moveProductDown(index, 'bestsellers')}
                                  disabled={index === bestsellersProducts.length - 1}
                                  className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                                >
                                  <ChevronDownIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleProduct(productId, 'bestsellers')}
                                  className="p-1 text-dark-400 hover:text-red-600"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : null
                        })
                      ) : (
                        <div className="p-6 text-center text-dark-500 dark:text-dark-400">
                          No products selected (using automatic best sellers)
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => updateProductsMutation.mutate({ section: 'bestsellers', productIds: bestsellersProducts })}
                      disabled={updateProductsMutation.isPending}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {updateProductsMutation.isPending && <LoadingSpinner size="sm" />}
                      Save Best Sellers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">Statistics Section</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Configure the stats shown below the hero banner</p>
                </div>
                <button
                  onClick={() => setStats([...stats, { label: '', value: '', icon: 'star', sort_order: stats.length, is_visible: true }])}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Stat
                </button>
              </div>

              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...stats]
                          newStats[index].value = e.target.value
                          setStats(newStats)
                        }}
                        placeholder="35+"
                        className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...stats]
                          newStats[index].label = e.target.value
                          setStats(newStats)
                        }}
                        placeholder="Years Experience"
                        className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Icon</label>
                      <select
                        value={stat.icon}
                        onChange={(e) => {
                          const newStats = [...stats]
                          newStats[index].icon = e.target.value
                          setStats(newStats)
                        }}
                        className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => setStats(stats.filter((_, i) => i !== index))}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => updateStatsMutation.mutate(stats)}
                disabled={updateStatsMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updateStatsMutation.isPending && <LoadingSpinner size="sm" />}
                Save Stats
              </button>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">Features / USPs</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Configure the feature cards (Free Shipping, Warranty, etc.)</p>
                </div>
                <button
                  onClick={() => setFeatures([...features, { title: '', description: '', icon: 'star', color: 'blue', sort_order: features.length, is_visible: true }])}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Feature
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-dark-500 dark:text-dark-400">Feature {index + 1}</span>
                      <button
                        onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...features]
                        newFeatures[index].title = e.target.value
                        setFeatures(newFeatures)
                      }}
                      placeholder="Feature Title"
                      className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-medium"
                    />
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...features]
                        newFeatures[index].description = e.target.value
                        setFeatures(newFeatures)
                      }}
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={feature.icon}
                        onChange={(e) => {
                          const newFeatures = [...features]
                          newFeatures[index].icon = e.target.value
                          setFeatures(newFeatures)
                        }}
                        className="px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <select
                        value={feature.color}
                        onChange={(e) => {
                          const newFeatures = [...features]
                          newFeatures[index].color = e.target.value
                          setFeatures(newFeatures)
                        }}
                        className="px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      >
                        {colorOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => updateFeaturesMutation.mutate(features)}
                disabled={updateFeaturesMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updateFeaturesMutation.isPending && <LoadingSpinner size="sm" />}
                Save Features
              </button>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
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

              {data?.testimonials && data.testimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border border-dark-200 dark:border-dark-700 rounded-xl p-4 bg-white dark:bg-dark-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-dark-100 dark:bg-dark-700 overflow-hidden flex-shrink-0">
                          {testimonial.image ? (
                            <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-dark-400 text-lg font-bold">
                              {testimonial.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-900 dark:text-white">{testimonial.name}</h4>
                          <p className="text-sm text-dark-500 dark:text-dark-400">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-dark-600 dark:text-dark-400 text-sm line-clamp-3 mb-3">"{testimonial.content}"</p>
                      <div className="flex items-center justify-between">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-lg">{i < testimonial.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openTestimonialModal(testimonial)}
                            className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this testimonial?')) {
                                deleteTestimonialMutation.mutate(testimonial.id!)
                              }
                            }}
                            className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-dark-500 dark:text-dark-400">
                  <p>No testimonials yet. Add your first testimonial.</p>
                </div>
              )}
            </div>
          )}

          {/* Trust Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">Trust Badges</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Certifications and trust indicators shown on the hero</p>
                </div>
                <button
                  onClick={() => setTrustBadges([...trustBadges, { title: '', sort_order: trustBadges.length, is_visible: true }])}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Badge
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800">
                    <input
                      type="text"
                      value={badge.title}
                      onChange={(e) => {
                        const newBadges = [...trustBadges]
                        newBadges[index].title = e.target.value
                        setTrustBadges(newBadges)
                      }}
                      placeholder="e.g., ISO 9001:2015"
                      className="flex-1 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                    <button
                      onClick={() => setTrustBadges(trustBadges.filter((_, i) => i !== index))}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => updateTrustBadgesMutation.mutate(trustBadges)}
                disabled={updateTrustBadgesMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updateTrustBadgesMutation.isPending && <LoadingSpinner size="sm" />}
                Save Trust Badges
              </button>
            </div>
          )}

          {/* Notable Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-dark-900 dark:text-white">Notable Clients</h3>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    Manage client logos displayed in the trust section. Only clients with logos will be shown on the homepage.
                  </p>
                </div>
                <button
                  onClick={() => setNotableClients([...notableClients, {
                    name: '',
                    logo: '',
                    website: '',
                    sort_order: notableClients.length,
                    is_visible: true
                  }])}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Client
                </button>
              </div>

              {/* Client Cards Grid */}
              {notableClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notableClients.map((client, index) => (
                    <div key={index} className="border border-dark-200 dark:border-dark-700 rounded-xl p-4 bg-white dark:bg-dark-800">
                      {/* Logo Preview/Upload */}
                      <div className="aspect-[3/2] bg-dark-100 dark:bg-dark-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative group">
                        {client.logo ? (
                          <img
                            src={client.logo}
                            alt={client.name || 'Client logo'}
                            className="max-w-full max-h-full object-contain p-4"
                          />
                        ) : (
                          <PhotoIcon className="w-12 h-12 text-dark-400" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="px-3 py-2 bg-white rounded-lg cursor-pointer text-sm font-medium hover:bg-dark-100 transition-colors">
                            {client.logo ? 'Change Logo' : 'Upload Logo'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, index)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Client Name */}
                      <input
                        type="text"
                        value={client.name}
                        onChange={(e) => updateClient(index, 'name', e.target.value)}
                        placeholder="Client Name"
                        className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white mb-3"
                      />

                      {/* Website URL */}
                      <input
                        type="text"
                        value={client.website || ''}
                        onChange={(e) => updateClient(index, 'website', e.target.value)}
                        placeholder="Website URL (optional)"
                        className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white mb-3 text-sm"
                      />

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={client.is_visible}
                            onChange={(e) => updateClient(index, 'is_visible', e.target.checked)}
                            className="w-4 h-4 rounded text-primary-600"
                          />
                          <span className="text-sm text-dark-600 dark:text-dark-400">Visible</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveClient(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                            title="Move up"
                          >
                            <ChevronUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveClient(index, 'down')}
                            disabled={index === notableClients.length - 1}
                            className="p-1 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                            title="Move down"
                          >
                            <ChevronDownIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeClient(index)}
                            className="p-1 text-red-500 hover:text-red-600"
                            title="Remove"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-dark-500 dark:text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-xl">
                  <PhotoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notable clients added yet.</p>
                  <p className="text-sm mt-1">Add clients and upload their logos to display them on the homepage.</p>
                </div>
              )}

              <button
                onClick={() => updateNotableClientsMutation.mutate(notableClients)}
                disabled={updateNotableClientsMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updateNotableClientsMutation.isPending && <LoadingSpinner size="sm" />}
                Save Notable Clients
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner Modal */}
      {bannerModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-dark-900 dark:text-white">
                  {bannerModal.banner ? 'Edit Banner' : 'Add Banner'}
                </h2>
                <button onClick={() => setBannerModal({ open: false, banner: null })} className="p-2 text-dark-400 hover:text-dark-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={bannerForm.title || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="Banner Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={bannerForm.subtitle || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="Banner Subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Image URL *</label>
                  <input
                    type="text"
                    value={bannerForm.image || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="/images/banner.webp"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={bannerForm.button_text || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={bannerForm.button_link || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, button_link: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      placeholder="/shop"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={bannerForm.sort_order || 0}
                      onChange={(e) => setBannerForm({ ...bannerForm, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bannerForm.is_active ?? true}
                        onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-primary-600"
                      />
                      <span className="text-sm text-dark-700 dark:text-dark-300">Active</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setBannerModal({ open: false, banner: null })}
                    className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {(createBannerMutation.isPending || updateBannerMutation.isPending) && <LoadingSpinner size="sm" />}
                    Save
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-dark-900 dark:text-white">
                  {testimonialModal.testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <button onClick={() => setTestimonialModal({ open: false, testimonial: null })} className="p-2 text-dark-400 hover:text-dark-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={testimonialForm.name || ''}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={testimonialForm.role || ''}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="Homeowner, Lahore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Content *</label>
                  <textarea
                    value={testimonialForm.content || ''}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={testimonialForm.image || ''}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, image: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    placeholder="https://example.com/avatar.webp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Rating</label>
                  <select
                    value={testimonialForm.rating || 5}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} Stars</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setTestimonialModal({ open: false, testimonial: null })}
                    className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {(createTestimonialMutation.isPending || updateTestimonialMutation.isPending) && <LoadingSpinner size="sm" />}
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Section Settings Modal */}
      {sectionModal.open && sectionModal.section && (
        <SectionSettingsModal
          section={sectionModal.section}
          settingsForm={sectionSettingsForm}
          onSettingsChange={setSectionSettingsForm}
          onClose={() => setSectionModal({ open: false, section: null })}
          onSave={(title, subtitle, settings) => {
            updateSectionMutation.mutate({
              key: sectionModal.section!.key,
              data: { title, subtitle, settings },
            })
            setSectionModal({ open: false, section: null })
          }}
        />
      )}
    </div>
  )
}
