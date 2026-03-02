export type B2bOrderStatus = 'pending' | 'in_production' | 'ready' | 'delivered' | 'cancelled'
export type BrandName = 'Fischer' | 'OEM' | 'ODM'

export interface B2bOrderItem {
  id: number
  b2b_order_id: number
  product_id: number | null
  sku: string
  product_name: string
  quantity: number
  notes: string | null
}

export interface B2bOrder {
  id: number
  order_number: string
  salesperson_id: number
  salesperson?: { id: number; full_name: string }
  dealer_name: string
  city: string
  brand_name: BrandName
  status: B2bOrderStatus
  delivery_estimate: string | null
  remarks: string | null
  items: B2bOrderItem[]
  created_at: string
  updated_at: string
}

export interface ProductionKpis {
  pending_orders: number
  units_to_manufacture: number
  skus_with_shortage: number
  delivered_today: number
}

export interface SkuAggregation {
  sku: string
  product_name: string
  total_ordered: number
  quantity_available: number
  quantity_in_production: number
  gap: number
}

export interface ProductionDashboard {
  kpis: ProductionKpis
  sku_aggregation: SkuAggregation[]
  recent_orders: B2bOrder[]
}

export interface ProductionInventoryItem {
  id: number
  product_id: number | null
  sku: string
  product_name: string
  quantity_available: number
  quantity_in_production: number
  total_b2b_demand: number
  last_updated_by: number | null
  updated_at: string
}

export interface ProductSearchResult {
  id: number
  sku: string
  slug: string
  name: string
  price: string | number
  dealer_price: string | number | null
  has_variants: boolean
  stock_status: string
  category_name: string | null
  category_slug: string | null
  image_url: string | null
}

export interface ProductVariantOption {
  id: number
  sku: string
  name: string | null
  price: string | number | null
  dealer_price: string | number | null
  attribute_values: Array<{ attribute: string; value: string }>
}

export interface ProductVariantData {
  attributes: Array<{ name: string; values: string[] }>
  variants: ProductVariantOption[]
}

export interface NewOrderItem {
  product_id: number | null
  sku: string
  product_name: string
  quantity: number
  notes: string
}

export interface CreateB2bOrderPayload {
  dealer_name: string
  city: string
  brand_name: BrandName
  remarks: string
  items: NewOrderItem[]
}

export interface UpdateOrderStatusPayload {
  status: B2bOrderStatus
  delivery_estimate?: string
}
