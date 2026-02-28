import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, CurrencyDollarIcon,
  ShoppingCartIcon, UsersIcon, ArrowTrendingUpIcon, BanknotesIcon,
  DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon,
  ShoppingBagIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ── Types ──────────────────────────────────────────────────────────────────────

interface KpiMetric {
  value: number
  previous: number
  change: number
}

interface DashboardData {
  kpis: {
    revenue: KpiMetric
    orders: KpiMetric
    aov: KpiMetric
    conversion_rate: KpiMetric
    visitors: KpiMetric
  }
  chart_data: Array<{ date: string; revenue: number; orders: number; visitors: number }>
  by_source: Array<{ source: string; visitors: number; orders: number; revenue: number; conversion_rate: number }>
  funnel: { visitors: number; product_views: number; add_to_cart: number; checkout: number; purchase: number }
  top_campaigns: Array<{ campaign: string; source: string; visitors: number; orders: number; revenue: number; conversion_rate: number }>
  abandoned_carts: { total: number; recovered: number; recovery_rate: number; lost_revenue: number; recovered_revenue: number }
  device_breakdown: Array<{ device: string; visitors: number; orders: number; revenue: number }>
}

// ── Helpers ────────────────────────────────────────────────────────────────────

type Preset = '7d' | '30d' | '90d' | 'custom'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const today = () => new Date().toISOString().split('T')[0]

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toLocaleString()
}

const SOURCE_COLORS: Record<string, string> = {
  direct: '#64748b',
  facebook: '#1877F2',
  google: '#34A853',
  tiktok: '#00F2EA',
  instagram: '#E4405F',
  others: '#94a3b8',
}

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source.toLowerCase()] || SOURCE_COLORS.others
}

const DEVICE_META: Record<string, { icon: typeof DevicePhoneMobileIcon; color: string; bg: string }> = {
  mobile: { icon: DevicePhoneMobileIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500' },
  desktop: { icon: ComputerDesktopIcon, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500' },
  tablet: { icon: DeviceTabletIcon, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
}

// ── Custom Chart Tooltip ───────────────────────────────────────────────────────

function RevenueOrdersTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-500 dark:text-dark-400 capitalize">{entry.dataKey}:</span>
          <span className="font-bold text-dark-900 dark:text-white">
            {entry.dataKey === 'revenue' ? formatPrice(entry.value) : entry.value.toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  )
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-dark-100 dark:bg-dark-700 rounded-xl ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-9 w-20 rounded-lg" />)}
        </div>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-72 rounded-2xl" />
        <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
      </div>
      {/* Funnel */}
      <Skeleton className="h-40 rounded-2xl" />
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MarketingDashboard() {
  const queryClient = useQueryClient()

  // Date range state
  const [preset, setPreset] = useState<Preset>('30d')
  const [customFrom, setCustomFrom] = useState(daysAgo(30))
  const [customTo, setCustomTo] = useState(today())

  const { from, to } = useMemo(() => {
    if (preset === 'custom') return { from: customFrom, to: customTo }
    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90
    return { from: daysAgo(days), to: today() }
  }, [preset, customFrom, customTo])

  // Campaign sort state
  const [sortCol, setSortCol] = useState<'orders' | 'revenue' | 'conversion_rate'>('revenue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['marketing-dashboard', from, to],
    queryFn: async () => {
      const res = await api.get(`/api/admin/marketing/dashboard?from=${from}&to=${to}`)
      return res.data.data ?? res.data
    },
  })

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['marketing-dashboard'] })

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortCol(col); setSortDir('desc') }
  }

  // Sorted campaigns
  const sortedCampaigns = useMemo(() => {
    if (!data?.top_campaigns) return []
    return [...data.top_campaigns].sort((a, b) => {
      const mult = sortDir === 'desc' ? -1 : 1
      return (a[sortCol] - b[sortCol]) * mult
    })
  }, [data?.top_campaigns, sortCol, sortDir])

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  // ── Empty state ──
  if (!data || (!data.kpis.visitors.value && !data.kpis.orders.value)) {
    return (
      <div className="space-y-5">
        <Header preset={preset} setPreset={setPreset} customFrom={customFrom} customTo={customTo}
          setCustomFrom={setCustomFrom} setCustomTo={setCustomTo} onRefresh={handleRefresh} from={from} to={to} />
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-16 text-center">
          <ShoppingBagIcon className="w-12 h-12 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
          <p className="text-lg font-semibold text-dark-900 dark:text-white mb-1">No marketing data yet</p>
          <p className="text-sm text-dark-500 dark:text-dark-400">
            Data will appear once visitors start browsing your store.
          </p>
        </div>
      </div>
    )
  }

  // ── KPI card definitions ──
  const kpiCards = [
    {
      key: 'revenue', label: 'Revenue', metric: data.kpis.revenue,
      format: (v: number) => formatPrice(v),
      icon: CurrencyDollarIcon,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
    },
    {
      key: 'orders', label: 'Orders', metric: data.kpis.orders,
      format: (v: number) => v.toLocaleString(),
      icon: ShoppingCartIcon,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
    },
    {
      key: 'aov', label: 'Avg. Order Value', metric: data.kpis.aov,
      format: (v: number) => formatPrice(v),
      icon: BanknotesIcon,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-200 dark:border-violet-800/50',
    },
    {
      key: 'conversion_rate', label: 'Conversion Rate', metric: data.kpis.conversion_rate,
      format: (v: number) => `${v.toFixed(2)}%`,
      icon: ArrowTrendingUpIcon,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
    },
    {
      key: 'visitors', label: 'Visitors', metric: data.kpis.visitors,
      format: (v: number) => formatCompact(v),
      icon: UsersIcon,
      iconBg: 'bg-sky-100 dark:bg-sky-900/30', iconColor: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-200 dark:border-sky-800/50',
    },
  ]

  // ── Funnel steps ──
  const funnelSteps = [
    { label: 'Visitors', value: data.funnel.visitors, color: 'bg-sky-500' },
    { label: 'Product Views', value: data.funnel.product_views, color: 'bg-blue-500' },
    { label: 'Add to Cart', value: data.funnel.add_to_cart, color: 'bg-indigo-500' },
    { label: 'Checkout', value: data.funnel.checkout, color: 'bg-violet-500' },
    { label: 'Purchase', value: data.funnel.purchase, color: 'bg-emerald-500' },
  ]
  const maxFunnel = Math.max(data.funnel.visitors, 1)

  // ── Pie chart data ──
  const totalSourceVisitors = data.by_source.reduce((s, r) => s + r.visitors, 0)
  const totalDeviceVisitors = data.device_breakdown.reduce((s, r) => s + r.visitors, 0)

  const chartData = data.chart_data ?? []
  const hasChartData = chartData.some(d => d.revenue > 0 || d.orders > 0)

  // ── Render ──
  return (
    <div className="space-y-5">

      {/* ── 1. Header ── */}
      <Header preset={preset} setPreset={setPreset} customFrom={customFrom} customTo={customTo}
        setCustomFrom={setCustomFrom} setCustomTo={setCustomTo} onRefresh={handleRefresh} from={from} to={to} />

      {/* ── 2. KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          const positive = card.metric.change >= 0
          return (
            <div key={card.key}
              className={`bg-white dark:bg-dark-800 rounded-2xl border ${card.border} shadow-sm p-5 flex flex-col gap-3`}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                  ${positive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                  {positive ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {Math.abs(card.metric.change).toFixed(1)}%
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-dark-900 dark:text-white">{card.format(card.metric.value)}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{card.label}</p>
                <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">
                  vs prev: {card.format(card.metric.previous)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 3. Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue & Orders AreaChart */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-dark-900 dark:text-white">Revenue & Orders</h2>
              <p className="text-xs text-dark-400 dark:text-dark-500">{from} to {to}</p>
            </div>
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="mktRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-dark-100 dark:text-dark-700" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-dark-400 dark:text-dark-500"
                  tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis yAxisId="revenue" tickFormatter={formatYAxis} tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-dark-400 dark:text-dark-500" tickLine={false} axisLine={false} width={45} />
                <YAxis yAxisId="orders" orientation="right" allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'currentColor' }} className="text-dark-400 dark:text-dark-500"
                  tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<RevenueOrdersTooltip />} />
                <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
                  fill="url(#mktRevenueGrad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2}
                  fill="transparent" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(val: string) => <span className="text-xs text-dark-500 dark:text-dark-400 capitalize ml-1">{val}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-dark-400 dark:text-dark-600 text-sm">
              No chart data for this period
            </div>
          )}
        </div>

        {/* Traffic Sources PieChart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
          <h2 className="text-base font-semibold text-dark-900 dark:text-white mb-1">Traffic Sources</h2>
          <p className="text-xs text-dark-400 dark:text-dark-500 mb-4">Visitors by source</p>
          {data.by_source.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.by_source} dataKey="visitors" nameKey="source" cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                    {data.by_source.map((entry) => (
                      <Cell key={entry.source} fill={getSourceColor(entry.source)} />
                    ))}
                  </Pie>
                  <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="50%"
                    innerRadius={0} outerRadius={0} fill="none">
                    <Cell fill="none" />
                    <Legend content={() => null} />
                  </Pie>
                  <Tooltip formatter={((value: number) => value.toLocaleString()) as any}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }} />
                  {/* Center label via custom label */}
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central"
                    className="fill-dark-900 dark:fill-white text-lg font-black">
                    {formatCompact(totalSourceVisitors)}
                  </text>
                  <text x="50%" y="55%" textAnchor="middle" dominantBaseline="central"
                    className="fill-dark-400 dark:fill-dark-500 text-[10px]">
                    visitors
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {data.by_source.map((s) => (
                  <div key={s.source} className="flex items-center gap-1.5 text-xs text-dark-600 dark:text-dark-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSourceColor(s.source) }} />
                    <span className="capitalize">{s.source || 'direct'}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-dark-400 dark:text-dark-600 text-sm">
              No traffic source data
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Conversion Funnel ── */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-dark-900 dark:text-white mb-4">Conversion Funnel</h2>
        <div className="space-y-3">
          {funnelSteps.map((step, i) => {
            const pct = maxFunnel > 0 ? (step.value / maxFunnel) * 100 : 0
            const prevValue = i > 0 ? funnelSteps[i - 1].value : null
            const dropPct = prevValue && prevValue > 0 ? ((1 - step.value / prevValue) * 100).toFixed(1) : null
            return (
              <div key={step.label} className="flex items-center gap-2 sm:gap-4">
                <span className="w-20 sm:w-28 text-xs sm:text-sm font-medium text-dark-700 dark:text-dark-300 shrink-0 text-right">
                  {step.label}
                </span>
                <div className="flex-1 relative h-8 bg-dark-50 dark:bg-dark-700/50 rounded-lg overflow-hidden">
                  <div className={`h-full ${step.color} rounded-lg transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 2)}%` }} />
                  <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-white mix-blend-difference">
                    {step.value.toLocaleString()}
                  </span>
                </div>
                <span className="w-12 sm:w-16 text-xs text-dark-400 dark:text-dark-500 shrink-0">
                  {dropPct !== null ? (
                    <span className="text-rose-500 dark:text-rose-400">-{dropPct}%</span>
                  ) : (
                    <span className="text-dark-300 dark:text-dark-600">--</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 5. Campaigns + Abandoned Cart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Campaigns */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-dark-100 dark:border-dark-700">
            <h2 className="text-base font-semibold text-dark-900 dark:text-white">Top Campaigns</h2>
          </div>
          {sortedCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-dark-500 dark:text-dark-400 border-b border-dark-100 dark:border-dark-700">
                    <th className="px-5 py-3 font-medium">Campaign</th>
                    <th className="px-3 py-3 font-medium">Source</th>
                    <th className="px-3 py-3 font-medium cursor-pointer select-none hover:text-dark-900 dark:hover:text-white"
                      onClick={() => handleSort('orders')}>
                      Orders {sortCol === 'orders' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-3 py-3 font-medium cursor-pointer select-none hover:text-dark-900 dark:hover:text-white"
                      onClick={() => handleSort('revenue')}>
                      Revenue {sortCol === 'revenue' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-3 py-3 font-medium cursor-pointer select-none hover:text-dark-900 dark:hover:text-white"
                      onClick={() => handleSort('conversion_rate')}>
                      Conv. {sortCol === 'conversion_rate' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50 dark:divide-dark-700/50">
                  {sortedCampaigns.slice(0, 10).map((c, i) => (
                    <tr key={c.campaign} className={i % 2 === 0 ? 'bg-white dark:bg-dark-800' : 'bg-dark-50/50 dark:bg-dark-750/30'}>
                      <td className="px-5 py-3 font-medium text-dark-900 dark:text-white truncate max-w-[180px]">{c.campaign}</td>
                      <td className="px-3 py-3 text-dark-500 dark:text-dark-400 capitalize">{c.source}</td>
                      <td className="px-3 py-3 text-dark-700 dark:text-dark-300">{c.orders}</td>
                      <td className="px-3 py-3 font-semibold text-dark-900 dark:text-white">{formatPrice(c.revenue)}</td>
                      <td className="px-3 py-3 text-dark-600 dark:text-dark-400">{c.conversion_rate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.top_campaigns.length > 10 && (
                <div className="p-3 text-center border-t border-dark-100 dark:border-dark-700">
                  <Link to="/admin/marketing/campaigns"
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
                    View all {data.top_campaigns.length} campaigns <ChevronRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-dark-400 dark:text-dark-600">No campaign data for this period</p>
            </div>
          )}
        </div>

        {/* Abandoned Cart Recovery */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
          <h2 className="text-base font-semibold text-dark-900 dark:text-white mb-5">Abandoned Cart Recovery</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-black text-dark-900 dark:text-white">{data.abandoned_carts.total}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Abandoned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.abandoned_carts.recovered}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Recovered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-dark-900 dark:text-white">{data.abandoned_carts.recovery_rate.toFixed(1)}%</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Recovery Rate</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-dark-500 dark:text-dark-400 mb-1.5">
              <span>Recovery progress</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{data.abandoned_carts.recovery_rate.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(data.abandoned_carts.recovery_rate, 100)}%` }} />
            </div>
          </div>

          {/* Revenue comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 text-center">
              <p className="text-lg font-black text-rose-600 dark:text-rose-400">{formatPrice(data.abandoned_carts.lost_revenue)}</p>
              <p className="text-xs text-rose-500 dark:text-rose-400/80 mt-1">Lost Revenue</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatPrice(data.abandoned_carts.recovered_revenue)}</p>
              <p className="text-xs text-emerald-500 dark:text-emerald-400/80 mt-1">Recovered Revenue</p>
            </div>
          </div>

          <Link to="/admin/marketing/abandoned-carts"
            className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-dark-50 dark:bg-dark-700 text-sm font-medium text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-600 transition-colors">
            View Abandoned Carts <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── 6. Device Breakdown ── */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-dark-900 dark:text-white mb-4">Device Breakdown</h2>
        <div className="space-y-4">
          {data.device_breakdown.map((d) => {
            const meta = DEVICE_META[d.device.toLowerCase()] || DEVICE_META.desktop
            const Icon = meta.icon
            const pct = totalDeviceVisitors > 0 ? (d.visitors / totalDeviceVisitors) * 100 : 0
            return (
              <div key={d.device} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-dark-50 dark:bg-dark-700 flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <span className="text-sm font-medium text-dark-900 dark:text-white capitalize shrink-0">{d.device}</span>
                    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 text-xs text-dark-500 dark:text-dark-400">
                      <span>{d.visitors.toLocaleString()} visitors</span>
                      <span>{d.orders} orders</span>
                      <span className="font-semibold text-dark-900 dark:text-white">{formatPrice(d.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full ${meta.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">{pct.toFixed(1)}% of traffic</p>
                </div>
              </div>
            )
          })}
          {data.device_breakdown.length === 0 && (
            <p className="text-sm text-dark-400 dark:text-dark-600 text-center py-6">No device data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Header Sub-component ───────────────────────────────────────────────────────

interface HeaderProps {
  preset: Preset
  setPreset: (p: Preset) => void
  customFrom: string
  customTo: string
  setCustomFrom: (v: string) => void
  setCustomTo: (v: string) => void
  onRefresh: () => void
  from: string
  to: string
}

const presetButtons: { key: Preset; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'custom', label: 'Custom' },
]

function Header({ preset, setPreset, customFrom, customTo, setCustomFrom, setCustomTo, onRefresh, from, to }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Marketing Dashboard</h1>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{from} to {to}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {presetButtons.map((p) => (
          <button key={p.key} onClick={() => setPreset(p.key)}
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              preset === p.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
            }`}>
            {p.label}
          </button>
        ))}
        {preset === 'custom' && (
          <>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white" />
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white" />
          </>
        )}
        <button onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-sm font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors shadow-sm">
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  )
}
