export interface ShippingMethod {
  id: number
  code: string
  name: string
  description: string
  cost: number
  estimated_delivery: string
}

export interface Address {
  id: number
  label?: string
  name?: string
  first_name?: string
  last_name?: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state?: string
  postal_code?: string
  is_default?: boolean
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

export interface OrderItem {
  id: number
  product_name: string
  product_image?: string
  product_sku?: string
  variant_attributes?: string
  quantity: number
  unit_price: string
  total_price: string
}

export interface Order {
  id: number
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  subtotal: string | number
  discount_amount?: string
  discount?: number
  shipping_amount?: string
  shipping_cost?: number
  total: string | number
  created_at: string
  shipping_first_name?: string
  shipping_last_name?: string
  shipping_phone?: string
  shipping_email?: string
  shipping_address_line_1?: string
  shipping_address_line_2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_method?: string
  tracking_number?: string
  courier_name?: string
  customer_notes?: string
  items: OrderItem[]
  items_count: number
}

export interface CartItem {
  id: number
  product_id: number | null
  variant_id: number | null
  bundle_id: number | null
  is_bundle_item: boolean
  parent_cart_item_id: number | null
  product: {
    id: number
    name: string
    slug: string
    sku: string
    image: string | null
    primary_image: string | null
    price: number
    stock_quantity: number
    track_inventory: boolean
  } | null
  bundle: {
    id: number
    name: string
    slug: string
    featured_image: string | null
    cart_display: 'single_item' | 'grouped' | 'individual'
    discount_type: 'fixed_price' | 'percentage'
    discount_value: number
    original_price: number
    discounted_price: number
    savings: number
    items_count: number
  } | null
  bundle_slot_selections: Array<{
    slot_id: number
    slot_name: string
    product_id: number
    product_name: string
    product_image: string | null
  }> | null
  variant: {
    id: number
    sku: string
    name: string
    price: number
    attributes: Array<{ attribute: string; value: string }>
  } | null
  quantity: number
  unit_price: number
  total_price: number
  bundle_discount: number
  is_available: boolean
}
