import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  product_image?: string
  variant_attributes?: string
  quantity: number
  unit_price: string
  total_price: string
  product?: {
    id: number
    name: string
    slug: string
    sku: string
  }
}

export interface Order {
  id: number
  order_number: string
  user_id?: number
  status: string
  payment_status: string
  payment_method: string
  subtotal: string
  shipping_cost: string
  discount: string
  tax: string
  total: string
  currency: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_email: string
  shipping_phone: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_country: string
  billing_first_name?: string
  billing_last_name?: string
  billing_address_line_1?: string
  billing_city?: string
  customer_notes?: string
  admin_notes?: string
  tracking_number?: string
  tracking_url?: string
  courier?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
  user?: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

export const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ClockIcon },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircleIcon },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: ClockIcon },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: TruckIcon },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircleIcon },
}

export const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
}
