import api from '@/lib/api'
import type {
  B2bOrder,
  CreateB2bOrderPayload,
  UpdateOrderStatusPayload,
  ProductionDashboard,
  ProductionInventoryItem,
  ProductSearchResult,
  ProductVariantData,
} from '@/types/b2b'

export interface PaginatedB2bOrders {
  data: B2bOrder[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export async function getMyOrders(page = 1): Promise<PaginatedB2bOrders> {
  const response = await api.get('/api/production/my-orders', { params: { page } })
  return response.data.data
}

export async function getAllOrders(params?: {
  status?: string
  city?: string
  salesperson_id?: number
  brand_name?: string
  search?: string
  date_from?: string
  date_to?: string
  page?: number
}): Promise<PaginatedB2bOrders> {
  const response = await api.get('/api/production/orders', { params })
  return response.data.data
}

export interface OrderStats {
  totals: {
    total: number
    pending: number
    in_production: number
    ready: number
    delivered: number
    cancelled: number
  }
  by_salesperson: Array<{
    id: number
    name: string
    total: number
    pending: number
    in_production: number
    ready: number
    delivered: number
    cancelled: number
  }>
  salespersons: Array<{ id: number; name: string }>
}

export async function getOrderStats(): Promise<OrderStats> {
  const response = await api.get('/api/production/orders/stats')
  return response.data.data
}

export async function getOrder(id: number): Promise<B2bOrder> {
  const response = await api.get(`/api/production/orders/${id}`)
  return response.data.data
}

export async function createOrder(payload: CreateB2bOrderPayload): Promise<B2bOrder> {
  const response = await api.post('/api/production/orders', payload)
  return response.data.data
}

export async function updateOrderStatus(
  id: number,
  payload: UpdateOrderStatusPayload,
): Promise<B2bOrder> {
  const response = await api.put(`/api/production/orders/${id}/status`, payload)
  return response.data.data
}

export async function getProductionDashboard(): Promise<ProductionDashboard> {
  const response = await api.get('/api/production/dashboard')
  return response.data.data
}

export async function getProductionInventory(): Promise<ProductionInventoryItem[]> {
  const response = await api.get('/api/production/inventory')
  return response.data.data
}

export async function createInventoryEntry(
  data: Partial<ProductionInventoryItem>,
): Promise<ProductionInventoryItem> {
  const response = await api.post('/api/production/inventory', data)
  return response.data.data
}

export async function updateInventoryEntry(
  id: number,
  data: {
    quantity_available?: number
    quantity_in_production?: number
    product_name?: string
  },
): Promise<ProductionInventoryItem> {
  const response = await api.put(`/api/production/inventory/${id}`, data)
  return response.data.data
}

export async function searchProducts(q: string): Promise<ProductSearchResult[]> {
  const response = await api.get('/api/production/products/search', { params: { q } })
  return Array.isArray(response.data.data) ? response.data.data : []
}

export async function browseProducts(params?: { q?: string; category?: string }): Promise<ProductSearchResult[]> {
  const response = await api.get('/api/production/products', { params })
  return Array.isArray(response.data.data) ? response.data.data : []
}

export async function getProductVariants(productId: number): Promise<ProductVariantData> {
  const response = await api.get(`/api/production/products/${productId}/variants`)
  return response.data.data
}
