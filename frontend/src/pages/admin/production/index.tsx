import { useState, useCallback } from 'react'
import api from '@/lib/api'
import {
  ClockIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductionKPIs {
  pending_orders: number
  units_to_manufacture: number
  skus_with_shortage: number
  delivered_today: number
}

interface SkuAggregationRow {
  sku: string
  product_name: string
  ordered: number
  in_stock: number
  in_production: number
  gap: number
}

interface ProductionOrderItem {
  sku: string
  product_name: string
  quantity: number
}

interface ProductionOrder {
  id: number
  order_number: string
  salesperson_name: string
  dealer_name: string
  city: string
  items_count: number
  status: string
  delivery_estimate: string | null
  created_at: string
  items?: ProductionOrderItem[]
}

interface DashboardData {
  kpis: ProductionKPIs
  sku_aggregation: SkuAggregationRow[]
  recent_orders: ProductionOrder[]
}

interface PaginatedOrders {
  data: ProductionOrder[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending:       'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    in_production: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    ready:         'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    delivered:     'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    cancelled:     'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`
}

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_production', label: 'In Production' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const UPDATABLE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_production', label: 'In Production' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const NEEDS_DATE = ['in_production', 'ready']

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number | undefined
  icon: React.ReactNode
  iconBg: string
  valueColor?: string
}

function KpiCard({ label, value, icon, iconBg, valueColor }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold ${valueColor || 'text-gray-900 dark:text-white'}`}>
            {value ?? '—'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── Order Row ────────────────────────────────────────────────────────────────

interface OrderRowProps {
  order: ProductionOrder
  onStatusChange: (id: number, status: string, deliveryEstimate?: string) => void
  updating: boolean
}

function OrderRow({ order, onStatusChange, updating }: OrderRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [deliveryDate, setDeliveryDate] = useState(order.delivery_estimate?.split('T')[0] ?? '')
  const [loadingItems, setLoadingItems] = useState(false)
  const [items, setItems] = useState<ProductionOrderItem[] | null>(order.items ?? null)

  const handleExpand = async () => {
    if (!expanded && !items) {
      setLoadingItems(true)
      try {
        const res = await api.get(`/api/production/orders/${order.id}`)
        setItems(res.data.data?.items ?? [])
      } catch {
        setItems([])
      } finally {
        setLoadingItems(false)
      }
    }
    setExpanded(!expanded)
  }

  const handleStatusSave = () => {
    const dateToSend = NEEDS_DATE.includes(selectedStatus) ? deliveryDate || undefined : undefined
    onStatusChange(order.id, selectedStatus, dateToSend)
  }

  const statusChanged = selectedStatus !== order.status

  return (
    <>
      <tr
        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
        onClick={handleExpand}
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          <span className="font-mono font-medium">#{order.order_number}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {order.salesperson_name || '—'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {order.dealer_name || '—'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {order.city || '—'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
          {order.items_count}
        </td>
        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <span className={getStatusBadge(order.status)}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {order.delivery_estimate ? formatDate(order.delivery_estimate) : '—'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {formatDate(order.created_at)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {UPDATABLE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {NEEDS_DATE.includes(selectedStatus) && (
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {statusChanged && (
              <button
                onClick={handleStatusSave}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Save
              </button>
            )}
          </div>
        </td>
        <td className="px-4 py-4">
          {expanded
            ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-gray-50 dark:bg-gray-900/40">
          <td colSpan={10} className="px-8 py-4">
            {loadingItems ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">Loading items…</p>
            ) : items && items.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left pr-8 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="text-left pr-8 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="text-left pb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="pr-8 py-2 font-mono text-gray-700 dark:text-gray-300">{item.sku}</td>
                      <td className="pr-8 py-2 text-gray-700 dark:text-gray-300">{item.product_name}</td>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No line items found.</p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductionDashboard() {
  const queryClient = useQueryClient()
  const [orderStatusFilter, setOrderStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  // Dashboard data (KPIs + SKU aggregation + recent orders)
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useQuery<DashboardData>({
    queryKey: ['production-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/production/dashboard')
      return res.data.data
    },
  })

  // Full orders list with filters
  const { data: ordersData, isLoading: ordersLoading } = useQuery<PaginatedOrders>({
    queryKey: ['production-orders', page, orderStatusFilter],
    queryFn: async () => {
      const res = await api.get('/api/production/orders', {
        params: { page, status: orderStatusFilter || undefined },
      })
      return res.data.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, delivery_estimate }: { id: number; status: string; delivery_estimate?: string }) => {
      await api.put(`/api/production/orders/${id}/status`, { status, delivery_estimate })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['production-orders'] })
    },
  })

  const handleStatusChange = useCallback((id: number, status: string, deliveryEstimate?: string) => {
    updateStatusMutation.mutate({ id, status, delivery_estimate: deliveryEstimate })
  }, [updateStatusMutation])

  const kpis = dashboard?.kpis
  const skuRows = dashboard?.sku_aggregation ?? []
  const orders = ordersData?.data ?? []
  const meta = ordersData?.meta

  return (
    <div className="min-h-screen space-y-8 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production Manager</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          B2B production overview — orders, shortages, and factory status
        </p>
      </div>

      {/* KPI Cards */}
      {dashLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : dashError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm">
          Failed to load dashboard data. Please refresh.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Pending B2B Orders"
            value={kpis?.pending_orders}
            iconBg="bg-yellow-50 dark:bg-yellow-900/20"
            icon={<ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
          />
          <KpiCard
            label="Units to Manufacture"
            value={kpis?.units_to_manufacture}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            icon={<WrenchScrewdriverIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          />
          <KpiCard
            label="SKUs with Shortage"
            value={kpis?.skus_with_shortage}
            iconBg="bg-red-50 dark:bg-red-900/20"
            icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />}
            valueColor="text-red-600 dark:text-red-400"
          />
          <KpiCard
            label="Delivered Today"
            value={kpis?.delivered_today}
            iconBg="bg-green-50 dark:bg-green-900/20"
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
          />
        </div>
      )}

      {/* SKU Aggregation Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Production Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Sorted by urgency — biggest gap first
          </p>
        </div>

        {dashLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        ) : skuRows.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500">
            <WrenchScrewdriverIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No production data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-b-xl">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ordered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Production</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gap</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {skuRows.map((row) => (
                  <tr
                    key={row.sku}
                    className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${
                      row.gap > 0 ? 'border-red-500' : 'border-green-500'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {row.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {row.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {row.ordered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {row.in_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {row.in_production}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.gap > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400">{row.gap}</span>
                      ) : (
                        <span className="font-bold text-green-600 dark:text-green-400">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* B2B Orders List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">B2B Orders</h2>
            {meta && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{meta.total} total orders</p>
            )}
          </div>
          <select
            value={orderStatusFilter}
            onChange={(e) => { setOrderStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {ordersLoading ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-4 w-28 bg-gray-100 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 dark:text-gray-500">
            <ClockIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No orders found{orderStatusFilter ? ' for this status' : ''}.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salesperson</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dealer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery Est.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Update Status</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      updating={updateStatusMutation.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page <span className="font-medium text-gray-900 dark:text-white">{meta.current_page}</span> of{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{meta.last_page}</span>
                  {' '}· {meta.total} orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === meta.last_page}
                    className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
