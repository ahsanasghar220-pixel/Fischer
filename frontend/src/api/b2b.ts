import api from '@/lib/api'
import type {
  B2bOrder,
  CreateB2bOrderPayload,
  UpdateOrderStatusPayload,
  ProductionDashboard,
  ProductionInventoryItem,
  ProductSearchResult,
} from '@/types/b2b'

export interface PaginatedB2bOrders {
  data: B2bOrder[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export async function getMyOrders(page = 1): Promise<PaginatedB2bOrders> {
  const response = await api.get('/production/my-orders', { params: { page } })
  return response.data.data
}

export async function getAllOrders(params?: {
  status?: string
  city?: string
  salesperson_id?: number
  page?: number
}): Promise<PaginatedB2bOrders> {
  const response = await api.get('/production/orders', { params })
  return response.data.data
}

export async function getOrder(id: number): Promise<B2bOrder> {
  const response = await api.get(`/production/orders/${id}`)
  return response.data.data
}

export async function createOrder(payload: CreateB2bOrderPayload): Promise<B2bOrder> {
  const response = await api.post('/production/orders', payload)
  return response.data.data
}

export async function updateOrderStatus(
  id: number,
  payload: UpdateOrderStatusPayload,
): Promise<B2bOrder> {
  const response = await api.put(`/production/orders/${id}/status`, payload)
  return response.data.data
}

export async function getProductionDashboard(): Promise<ProductionDashboard> {
  const response = await api.get('/production/dashboard')
  return response.data.data
}

export async function getProductionInventory(): Promise<ProductionInventoryItem[]> {
  const response = await api.get('/production/inventory')
  return response.data.data
}

export async function createInventoryEntry(
  data: Partial<ProductionInventoryItem>,
): Promise<ProductionInventoryItem> {
  const response = await api.post('/production/inventory', data)
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
  const response = await api.put(`/production/inventory/${id}`, data)
  return response.data.data
}

export async function searchProducts(q: string): Promise<ProductSearchResult[]> {
  const response = await api.get('/production/products/search', { params: { q } })
  return response.data.data
}
