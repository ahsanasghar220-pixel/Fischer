import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  UsersIcon,
  ShoppingCartIcon,
  EyeIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowPathIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Country flag emoji map
const countryFlags: Record<string, string> = {
  PK: '🇵🇰', US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
  DE: '🇩🇪', FR: '🇫🇷', IN: '🇮🇳', AE: '🇦🇪', SA: '🇸🇦',
  CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', SG: '🇸🇬', MY: '🇲🇾',
  BD: '🇧🇩', NP: '🇳🇵', LK: '🇱🇰', QA: '🇶🇦', KW: '🇰🇼',
}

const TRAFFIC_COLORS: Record<string, string> = {
  direct: '#3b82f6',
  organic: '#10b981',
  social: '#ec4899',
  paid: '#f59e0b',
  referral: '#8b5cf6',
  email: '#06b6d4',
}

const FUNNEL_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

interface OverviewData {
  active_visitors: number
  cart_summary: {
    empty: number
    has_items: number
    checkout_started: number
    converted: number
    total_cart_value: number
    avg_cart_value: number
  }
  today: {
    page_views: number
    product_views: number
    add_to_cart: number
    conversions: number
    revenue: number
  }
}

interface Activity {
  id: number
  type: string
  icon: string
  description: string
  value: number | null
  location: {
    city: string | null
    country: string | null
    country_code: string | null
  } | null
  time: string
  timestamp: string
}

interface TrafficSource {
  source: string
  count: number
  percentage: number
  [key: string]: string | number
}

interface FunnelStep {
  step: string
  count: number
  rate: number
}

interface CountryData {
  country: string
  country_code: string
  count: number
}

export default function RealTimeAnalytics() {
  const [refreshInterval, setRefreshInterval] = useState(10000) // 10 seconds
  const [, setLastRefresh] = useState(new Date())

  // Overview data
  const { data: overview, isLoading: loadingOverview, refetch: refetchOverview } = useQuery<OverviewData>({
    queryKey: ['realtime-overview'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/realtime/overview')
      return response.data.data
    },
    refetchInterval: refreshInterval,
  })

  // Activity feed
  const { data: activityData, refetch: refetchActivity } = useQuery<{ activities: Activity[] }>({
    queryKey: ['realtime-activity'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/realtime/activity-feed')
      return response.data.data
    },
    refetchInterval: refreshInterval,
  })

  // Traffic sources
  const { data: trafficData } = useQuery<{ sources: TrafficSource[]; total: number }>({
    queryKey: ['realtime-traffic'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/realtime/traffic-sources')
      return response.data.data
    },
    refetchInterval: 30000, // 30 seconds
  })

  // Conversion funnel
  const { data: funnelData } = useQuery<{ funnel: FunnelStep[]; conversion_rate: number }>({
    queryKey: ['realtime-funnel'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/realtime/conversion-funnel')
      return response.data.data
    },
    refetchInterval: 30000,
  })

  // Geographic data
  const { data: geoData } = useQuery<{ by_country: CountryData[] }>({
    queryKey: ['realtime-geo'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/realtime/geographic')
      return response.data.data
    },
    refetchInterval: 30000,
  })

  // Cart analytics
  const { data: cartData } = useQuery({
    queryKey: ['realtime-cart'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/realtime/cart-analytics')
      return response.data.data
    },
    refetchInterval: 30000,
  })

  // Manual refresh
  const handleRefresh = () => {
    refetchOverview()
    refetchActivity()
    setLastRefresh(new Date())
  }

  // Update last refresh time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loadingOverview) {
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
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            Real-Time Analytics
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            Live visitor tracking and activity monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
            <ClockIcon className="w-4 h-4" />
            <span>Auto-refresh: {refreshInterval / 1000}s</span>
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg text-sm"
          >
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-dark-900 rounded-lg font-medium hover:bg-primary-400 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Live Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Visitors */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Active Now</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">
                {overview?.active_visitors ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-600 dark:text-green-400">Live</span>
          </div>
        </div>

        {/* Carts with Items */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Carts with Items</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">
                {overview?.cart_summary?.has_items ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-500 dark:text-dark-400">
            Total value: {formatCurrency(overview?.cart_summary?.total_cart_value ?? 0)}
          </div>
        </div>

        {/* Today's Conversions */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Today's Orders</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">
                {overview?.today?.conversions ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-500 dark:text-dark-400">
            Revenue: {formatCurrency(overview?.today?.revenue ?? 0)}
          </div>
        </div>

        {/* Page Views Today */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-dark-200 dark:border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <EyeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Page Views Today</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">
                {overview?.today?.page_views ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-500 dark:text-dark-400">
            Product views: {overview?.today?.product_views ?? 0}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700">
          <div className="p-6 border-b border-dark-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Live Activity Feed
            </h2>
          </div>
          <div className="divide-y divide-dark-200 dark:divide-dark-700 max-h-[500px] overflow-y-auto">
            {activityData?.activities?.length ? (
              activityData.activities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-900 dark:text-white">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-dark-500 dark:text-dark-400">
                        {activity.location?.city && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3" />
                            {activity.location.city}, {activity.location.country}
                            {activity.location.country_code && (
                              <span className="ml-1">
                                {countryFlags[activity.location.country_code] || '🌍'}
                              </span>
                            )}
                          </span>
                        )}
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    {activity.value && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(activity.value)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-dark-500 dark:text-dark-400">
                <UserGroupIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm mt-1">Activity will appear here as visitors browse your store</p>
              </div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700">
          <div className="p-6 border-b border-dark-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5" />
              Visitors by Country
            </h2>
          </div>
          <div className="p-6 max-h-[450px] overflow-y-auto">
            {geoData?.by_country?.length ? (
              <div className="space-y-3">
                {geoData.by_country.map((country, index) => (
                  <div key={country.country_code || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {countryFlags[country.country_code] || '🌍'}
                      </span>
                      <span className="text-dark-900 dark:text-white">
                        {country.country || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (country.count / (geoData.by_country[0]?.count || 1)) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-dark-700 dark:text-dark-300 w-8 text-right">
                        {country.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-dark-500 dark:text-dark-400 py-8">
                <GlobeAltIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No geographic data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traffic Sources & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700">
          <div className="p-6 border-b border-dark-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
              Traffic Sources (Today)
            </h2>
          </div>
          <div className="p-6">
            {trafficData?.sources?.length ? (
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficData.sources}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="source"
                      >
                        {trafficData.sources.map((entry) => (
                          <Cell
                            key={entry.source}
                            fill={TRAFFIC_COLORS[entry.source] || '#6b7280'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {trafficData.sources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: TRAFFIC_COLORS[source.source] || '#6b7280' }}
                        />
                        <span className="text-dark-900 dark:text-white capitalize">
                          {source.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-dark-500 dark:text-dark-400">
                          {source.count}
                        </span>
                        <span className="text-sm font-medium text-dark-700 dark:text-dark-300 w-12 text-right">
                          {source.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-dark-500 dark:text-dark-400 py-8">
                <p>No traffic data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700">
          <div className="p-6 border-b border-dark-200 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                Conversion Funnel (Today)
              </h2>
              {funnelData?.conversion_rate !== undefined && (
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {funnelData.conversion_rate}% conversion rate
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            {funnelData?.funnel?.length ? (
              <div className="space-y-4">
                {funnelData.funnel.map((step, index) => (
                  <div key={step.step}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-dark-900 dark:text-white">{step.step}</span>
                      <span className="text-dark-500 dark:text-dark-400">
                        {step.count} ({step.rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${step.rate}%`,
                          backgroundColor: FUNNEL_COLORS[index] || '#6b7280',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-dark-500 dark:text-dark-400 py-8">
                <p>No funnel data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Analytics */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700">
        <div className="p-6 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
            Cart Analytics
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-dark-900 dark:text-white">
                {overview?.cart_summary?.empty ?? 0}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Empty Carts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {overview?.cart_summary?.has_items ?? 0}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400">With Items</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {overview?.cart_summary?.checkout_started ?? 0}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Checkout Started</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {overview?.cart_summary?.converted ?? 0}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Converted</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {cartData?.abandonment_rate ?? 0}%
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Abandonment Rate</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Active Cart Value</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">
                  {formatCurrency(overview?.cart_summary?.total_cart_value ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Average Cart Value</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">
                  {formatCurrency(overview?.cart_summary?.avg_cart_value ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
