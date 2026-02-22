import type { Product } from '@/types'

export interface Category {
  id: number
  name: string
  slug: string
  image?: string
  icon?: string
  products_count: number
  description?: string
  features?: string[]
}

export interface Banner {
  id: number
  title: string
  subtitle?: string
  image: string
  button_text?: string
  button_link?: string
}

export interface Testimonial {
  name: string
  role: string
  content: string
  image?: string
  rating: number
}

export interface Stat {
  label: string
  value: string
  icon?: string
}

export interface Feature {
  title: string
  description: string
  icon?: string
  color?: string
}

export interface TrustBadge {
  title: string
  image?: string
}

export interface NotableClient {
  id: number
  name: string
  logo: string | null
  website: string | null
}

export interface SectionSettings {
  title?: string
  subtitle?: string
  is_enabled: boolean
  settings?: Record<string, any>
}

export interface HomeData {
  banners: Banner[]
  categories: Category[]
  video_categories?: Category[]
  bestsellers: Product[]
  featured_products?: Product[]
  new_arrivals?: Product[]
  testimonials: Testimonial[]
  stats: Stat[]
  features: Feature[]
  trust_badges: TrustBadge[]
  notable_clients: NotableClient[]
  sections: Record<string, SectionSettings & { sort_order?: number }>
  settings: Record<string, string>
}
