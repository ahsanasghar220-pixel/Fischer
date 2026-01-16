import { create } from 'zustand'
import api, { getOrCreateSessionId } from '@/lib/api'
import toast from 'react-hot-toast'

interface CartItem {
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

interface CartState {
  items: CartItem[]
  subtotal: number
  discount: number
  coupon_code: string | null
  couponCode: string | null
  total: number
  items_count: number
  total_weight: number
  isLoading: boolean
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity?: number, variantId?: number | null) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  updateItemQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => Promise<void>
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  discount: 0,
  coupon_code: null,
  couponCode: null,
  total: 0,
  items_count: 0,
  total_weight: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      getOrCreateSessionId()
      const response = await api.get('/cart')
      const data = response.data.data
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        coupon_code: data.coupon_code,
        couponCode: data.coupon_code,
        total: data.total || 0,
        items_count: data.items_count || 0,
        total_weight: data.total_weight || 0,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  addItem: async (productId: number, quantity = 1, variantId = null) => {
    set({ isLoading: true })
    try {
      getOrCreateSessionId()
      const response = await api.post('/cart/add', {
        product_id: productId,
        variant_id: variantId,
        quantity,
      })
      const data = response.data.data
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        coupon_code: data.coupon_code,
        couponCode: data.coupon_code,
        total: data.total || 0,
        items_count: data.items_count || 0,
        isLoading: false,
      })
      toast.success('Added to cart')
    } catch (error: unknown) {
      set({ isLoading: false })
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to add item')
      throw error
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity })
      const data = response.data.data
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        total: data.total || 0,
        items_count: data.items_count || 0,
      })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to update quantity')
      throw error
    }
  },

  updateItemQuantity: async (itemId: number, quantity: number) => {
    return get().updateQuantity(itemId, quantity)
  },

  removeItem: async (itemId: number) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`)
      const data = response.data.data
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        total: data.total || 0,
        items_count: data.items_count || 0,
      })
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear')
      set({
        items: [],
        subtotal: 0,
        discount: 0,
        coupon_code: null,
        couponCode: null,
        total: 0,
        items_count: 0,
      })
    } catch {
      toast.error('Failed to clear cart')
    }
  },

  applyCoupon: async (code: string) => {
    try {
      const response = await api.post('/cart/coupon', { code })
      const data = response.data.data
      set({
        discount: data.discount || 0,
        coupon_code: data.coupon_code,
        couponCode: data.coupon_code,
        total: data.total || get().subtotal,
      })
      toast.success('Coupon applied')
      return true
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Invalid coupon code')
      return false
    }
  },

  removeCoupon: async () => {
    try {
      const response = await api.delete('/cart/coupon')
      const data = response.data.data
      set({
        discount: 0,
        coupon_code: null,
        couponCode: null,
        total: data.total || get().subtotal,
      })
      toast.success('Coupon removed')
    } catch {
      toast.error('Failed to remove coupon')
    }
  },
}))
