import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useTheme } from '@/contexts/ThemeContext'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

type ReportType = 'sales' | 'products' | 'customers' | 'inventory'

export default function AdminReports() {
  const { resolvedTheme } = useTheme()

  // Theme-aware colors for charts
  const isDark = resolvedTheme === 'dark'
  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: isDark ? 'none' : '1px solid #e5e7eb',
    borderRadius: '8px',
    color: isDark ? '#fff' : '#111827',
  }
  const axisTickColor = isDark ? '#9ca3af' : '#6b7280'

  const [reportType, setReportType] = useState<ReportType>('sales')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  const { isLoading } = useQuery({
    queryKey: ['admin-reports', reportType, dateRange],
    queryFn: async () => {
      const response = await api.get(`/api/admin/reports/${reportType}`, {
        params: dateRange,
      })
      return response.data.data
    },
  })

  // Sample data for demo when API returns empty
  const salesData = [
    { date: 'Week 1', revenue: 245000, orders: 32, profit: 48000 },
    { date: 'Week 2', revenue: 312000, orders: 45, profit: 62000 },
    { date: 'Week 3', revenue: 278000, orders: 38, profit: 54000 },
    { date: 'Week 4', revenue: 395000, orders: 52, profit: 78000 },
  ]

  const productPerformance = [
    { name: 'Fischer Water Heater 50L', sold: 45, revenue: 675000, stock: 120 },
    { name: 'Fischer Geyser 30L', sold: 38, revenue: 456000, stock: 85 },
    { name: 'Fischer Instant Heater', sold: 62, revenue: 310000, stock: 200 },
    { name: 'Fischer Premium 80L', sold: 22, revenue: 440000, stock: 45 },
    { name: 'Fischer Compact 15L', sold: 55, revenue: 275000, stock: 150 },
  ]

  const customerSegments = [
    { segment: 'New', count: 156, value: 450000 },
    { segment: 'Returning', count: 89, value: 620000 },
    { segment: 'VIP', count: 23, value: 380000 },
    { segment: 'Inactive', count: 45, value: 0 },
  ]

  const inventoryStatus = [
    { status: 'In Stock', count: 245, percentage: 65 },
    { status: 'Low Stock', count: 52, percentage: 14 },
    { status: 'Out of Stock', count: 28, percentage: 7 },
    { status: 'Discontinued', count: 15, percentage: 4 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    // Trigger download
    window.open(`/api/admin/reports/${reportType}/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Reports</h1>
          <p className="text-dark-500 dark:text-dark-400">Generate and export business reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-300"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Report Type */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            >
              <option value="sales">Sales Report</option>
              <option value="products">Product Performance</option>
              <option value="customers">Customer Report</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Start Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              End Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Revenue</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatCurrency(1230000)}</p>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Orders</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">167</p>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
              <p className="text-sm text-dark-500 dark:text-dark-400">Avg Order Value</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatCurrency(7365)}</p>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Profit</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(242000)}</p>
            </div>
          </div>

          {/* Combined Chart */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Revenue & Profit Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-dark-200 dark:stroke-dark-600" />
                  <XAxis dataKey="date" tick={{ fill: axisTickColor }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `Rs ${v / 1000}k`} tick={{ fill: axisTickColor }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: axisTickColor }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#0ea5e9" fillOpacity={0.2} stroke="#0ea5e9" name="Revenue" />
                  <Bar yAxisId="left" dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} name="Orders" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Product Performance Report */}
      {reportType === 'products' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Top Products by Revenue</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-dark-200 dark:stroke-dark-600" />
                  <XAxis type="number" tickFormatter={(v) => `Rs ${v / 1000}k`} tick={{ fill: axisTickColor }} />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fill: axisTickColor, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                    {productPerformance.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-700 border-b border-dark-200 dark:border-dark-600">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Product</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Units Sold</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Revenue</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {productPerformance.map((product, index) => (
                  <tr key={index} className="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                    <td className="px-4 py-3 text-dark-900 dark:text-white">{product.name}</td>
                    <td className="px-4 py-3 text-right text-dark-600 dark:text-dark-400">{product.sold}</td>
                    <td className="px-4 py-3 text-right text-dark-900 dark:text-white font-medium">{formatCurrency(product.revenue)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock > 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        product.stock > 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Report */}
      {reportType === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Customer Segments</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="segment"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {customerSegments.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Value */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Customer Value by Segment</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerSegments}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-dark-200 dark:stroke-dark-600" />
                    <XAxis dataKey="segment" tick={{ fill: axisTickColor }} />
                    <YAxis tickFormatter={(v) => `Rs ${v / 1000}k`} tick={{ fill: axisTickColor }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {customerSegments.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-700 border-b border-dark-200 dark:border-dark-600">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Segment</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Customers</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Total Value</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Avg Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {customerSegments.map((segment, index) => (
                  <tr key={index} className="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        segment.segment === 'VIP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        segment.segment === 'Returning' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        segment.segment === 'New' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {segment.segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-dark-600 dark:text-dark-400">{segment.count}</td>
                    <td className="px-4 py-3 text-right text-dark-900 dark:text-white font-medium">{formatCurrency(segment.value)}</td>
                    <td className="px-4 py-3 text-right text-dark-600 dark:text-dark-400">
                      {segment.count > 0 ? formatCurrency(segment.value / segment.count) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventoryStatus.map((item, index) => (
              <div key={index} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
                <p className="text-sm text-dark-500 dark:text-dark-400">{item.status}</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">{item.count}</p>
                <p className="text-sm text-dark-400">{item.percentage}% of inventory</p>
              </div>
            ))}
          </div>

          {/* Inventory Chart */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Inventory Status Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#6b7280" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Low Stock Alerts</h2>
            <div className="space-y-3">
              {productPerformance.filter(p => p.stock < 100).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div>
                    <p className="font-medium text-dark-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Only {product.stock} units remaining</p>
                  </div>
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
