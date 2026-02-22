// Bundle type definitions

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

export interface BundleImage {
  id: number
  bundle_id: number
  image: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
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
