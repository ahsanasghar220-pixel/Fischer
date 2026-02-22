export interface ProductImage {
  id: number
  image?: string
  image_path?: string
  url?: string
  alt_text?: string
  is_primary: boolean
}

export interface ProductVariant {
  id: number
  sku: string
  name: string
  price: number
  compare_price?: number
  stock: number
  attributes: Record<string, string> | Array<{ attribute: string; value: string }>
}

export interface Review {
  id: number
  rating: number
  title?: string
  content: string
  created_at: string
  is_verified_purchase?: boolean
  user: {
    name: string
  }
  images?: { image: string }[]
  helpful_count: number
}

export interface Category {
  id?: number
  name: string
  slug: string
}

export interface Brand {
  id?: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  sale_price?: number | null
  cost_price?: number | null
  sku?: string
  description?: string
  short_description?: string
  primary_image?: string | null
  images?: ProductImage[]
  stock?: number
  stock_quantity?: number
  low_stock_threshold?: number
  stock_status: string
  is_new?: boolean
  is_bestseller?: boolean
  is_active?: boolean
  is_featured?: boolean
  average_rating?: number
  review_count?: number
  reviews_count?: number
  discount_percentage?: number | null
  category?: Category
  category_id?: number | null
  brand?: Brand
  brand_id?: number | null
  weight?: number | null
  dimensions?: string | null
  specifications?: Record<string, string>
  warranty_info?: string
  meta_title?: string | null
  meta_description?: string | null
  variants?: ProductVariant[]
  related_products?: Product[]
  reviews?: Review[]
}

export interface KitchenProduct {
  id: string
  name: string
  categorySlug: string
  product: Product | null
}
