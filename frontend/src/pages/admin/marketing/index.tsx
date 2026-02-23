import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface DashboardData {
  revenue: number
  orders: number
  aov: number
  abandoned_carts: number
  recovered_carts: number
  recovery_rate: number
  by_source: Array<{ source: string; orders: number; revenue: number }>
}

export default function MarketingDashboard() {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['marketing-dashboard', from, to],
    queryFn: async () => {
      const res = await api.get(`/api/admin/marketing/dashboard?from=${from}&to=${to}`)
      return res.data
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Marketing Dashboard</h1>
        <div className="flex gap-3">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-dark-500">Loading...</div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: `Rs. ${data.revenue.toLocaleString()}` },
              { label: 'Orders', value: data.orders },
              { label: 'Avg Order Value', value: `Rs. ${data.aov.toLocaleString()}` },
              { label: 'Cart Recovery', value: `${data.recovery_rate}%` },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-400">{kpi.label}</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue by Source */}
          {data.by_source.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-dark-200 dark:border-dark-700">
              <h2 className="font-semibold text-dark-900 dark:text-white mb-4">Revenue by Source</h2>
              <div className="space-y-2">
                {data.by_source.map(row => (
                  <div key={row.source} className="flex items-center justify-between py-2 border-b border-dark-100 dark:border-dark-700 last:border-0">
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300 capitalize">{row.source || 'direct'}</span>
                    <div className="flex gap-6 text-sm text-dark-600 dark:text-dark-400">
                      <span>{row.orders} orders</span>
                      <span className="font-semibold text-dark-900 dark:text-white">Rs. {row.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
