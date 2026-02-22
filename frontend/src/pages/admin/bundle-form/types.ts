// Shared types used across bundle-form sub-components

export interface BundleProductLocal {
  id: number
  name: string
  slug: string
  sku: string
  price: number
  primary_image?: string
  stock_status?: string
}

export type Tab = 'basic' | 'products' | 'pricing' | 'display' | 'media' | 'seo'

export interface BundleFormData {
  name: string
  sku: string
  description: string
  short_description: string
  discount_type: 'fixed_price' | 'percentage'
  discount_value: number
  badge_label: string
  badge_color: string
  theme_color: string
  video_url: string
  is_active: boolean
  starts_at: string
  ends_at: string
  stock_limit: string
  bundle_type: 'fixed' | 'configurable'
  cart_display: 'single_item' | 'grouped' | 'individual'
  allow_coupon_stacking: boolean
  show_on_homepage: boolean
  homepage_position: '' | 'carousel' | 'grid' | 'banner'
  display_order: number
  meta_title: string
  meta_description: string
  cta_text: string
  show_countdown: boolean
  show_savings: boolean
}

export interface BundleItem {
  product_id: number
  product?: BundleProductLocal
  quantity: number
  price_override?: number
}

export interface BundleSlotProduct {
  product_id: number
  product?: BundleProductLocal
  price_override?: number
}

export interface BundleSlot {
  id?: number
  name: string
  description: string
  is_required: boolean
  min_selections: number
  max_selections: number
  products: BundleSlotProduct[]
}
