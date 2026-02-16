import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ShippingZone {
  id: number
  name: string
  cities: string[]
  is_active: boolean
  rates?: ShippingZoneRate[]
}

interface ShippingMethod {
  id: number
  name: string
  description?: string
  base_cost: number
  free_shipping_threshold?: number
  estimated_days?: string
  min_delivery_days?: number
  max_delivery_days?: number
  is_active: boolean
}

interface ShippingZoneRate {
  id: number
  shipping_zone_id: number
  shipping_method_id: number
  rate: number
  free_shipping_threshold?: number
  min_delivery_days?: number
  max_delivery_days?: number
}

type ActiveTab = 'zones' | 'methods'

export default function AdminShipping() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('zones')
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [showMethodModal, setShowMethodModal] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null)
  const queryClient = useQueryClient()

  // Zone form state
  const [zoneName, setZoneName] = useState('')
  const [zoneCities, setZoneCities] = useState('')
  const [zoneActive, setZoneActive] = useState(true)

  // Method form state
  const [methodName, setMethodName] = useState('')
  const [methodDesc, setMethodDesc] = useState('')
  const [methodCost, setMethodCost] = useState('')
  const [methodThreshold, setMethodThreshold] = useState('')
  const [methodDays, setMethodDays] = useState('')
  const [methodActive, setMethodActive] = useState(true)

  const { data: zonesData, isLoading: zonesLoading } = useQuery({
    queryKey: ['admin-shipping-zones'],
    queryFn: async () => {
      const res = await api.get('/api/admin/shipping-zones')
      return res.data.data?.data || []
    },
  })

  const { data: methodsData, isLoading: methodsLoading } = useQuery({
    queryKey: ['admin-shipping-methods'],
    queryFn: async () => {
      const res = await api.get('/api/admin/shipping-methods')
      return res.data.data?.data || []
    },
  })

  const zones: ShippingZone[] = zonesData || []
  const methods: ShippingMethod[] = methodsData || []

  // Zone mutations
  const saveZoneMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingZone) {
        return api.put(`/api/admin/shipping-zones/${editingZone.id}`, data)
      }
      return api.post('/api/admin/shipping-zones', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] })
      toast.success(editingZone ? 'Zone updated' : 'Zone created')
      closeZoneModal()
    },
    onError: () => toast.error('Failed to save zone'),
  })

  const deleteZoneMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/shipping-zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] })
      toast.success('Zone deleted')
    },
    onError: () => toast.error('Failed to delete zone'),
  })

  // Method mutations
  const saveMethodMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingMethod) {
        return api.put(`/api/admin/shipping-methods/${editingMethod.id}`, data)
      }
      return api.post('/api/admin/shipping-methods', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-methods'] })
      toast.success(editingMethod ? 'Method updated' : 'Method created')
      closeMethodModal()
    },
    onError: () => toast.error('Failed to save method'),
  })

  const deleteMethodMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/shipping-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-methods'] })
      toast.success('Method deleted')
    },
    onError: () => toast.error('Failed to delete method'),
  })

  const openZoneModal = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone)
      setZoneName(zone.name)
      setZoneCities((zone.cities || []).join(', '))
      setZoneActive(zone.is_active)
    } else {
      setEditingZone(null)
      setZoneName('')
      setZoneCities('')
      setZoneActive(true)
    }
    setShowZoneModal(true)
  }

  const closeZoneModal = () => {
    setShowZoneModal(false)
    setEditingZone(null)
  }

  const openMethodModal = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method)
      setMethodName(method.name)
      setMethodDesc(method.description || '')
      setMethodCost(String(method.base_cost))
      setMethodThreshold(method.free_shipping_threshold ? String(method.free_shipping_threshold) : '')
      setMethodDays(method.estimated_days || '')
      setMethodActive(method.is_active)
    } else {
      setEditingMethod(null)
      setMethodName('')
      setMethodDesc('')
      setMethodCost('')
      setMethodThreshold('')
      setMethodDays('')
      setMethodActive(true)
    }
    setShowMethodModal(true)
  }

  const closeMethodModal = () => {
    setShowMethodModal(false)
    setEditingMethod(null)
  }

  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault()
    saveZoneMutation.mutate({
      name: zoneName,
      cities: zoneCities.split(',').map(c => c.trim()).filter(Boolean),
      is_active: zoneActive,
    })
  }

  const handleSaveMethod = (e: React.FormEvent) => {
    e.preventDefault()
    saveMethodMutation.mutate({
      name: methodName,
      description: methodDesc || null,
      base_cost: parseFloat(methodCost) || 0,
      free_shipping_threshold: methodThreshold ? parseFloat(methodThreshold) : null,
      estimated_days: methodDays || null,
      is_active: methodActive,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Shipping</h1>
        <button
          onClick={() => activeTab === 'zones' ? openZoneModal() : openMethodModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Add {activeTab === 'zones' ? 'Zone' : 'Method'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-100 dark:bg-dark-800 rounded-lg p-1">
        {(['zones', 'methods'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm'
                : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
            }`}
          >
            Shipping {tab}
          </button>
        ))}
      </div>

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
          {zonesLoading ? (
            <div className="p-8 text-center text-dark-500">Loading...</div>
          ) : zones.length === 0 ? (
            <div className="p-8 text-center text-dark-500">No shipping zones yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Zone Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Cities</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {zones.map(zone => (
                  <tr key={zone.id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50">
                    <td className="px-4 py-3 font-medium text-dark-900 dark:text-white">{zone.name}</td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">
                      {(zone.cities || []).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        zone.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-dark-100 text-dark-500 dark:bg-dark-700 dark:text-dark-400'
                      }`}>
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openZoneModal(zone)} className="p-1.5 text-dark-400 hover:text-primary-500 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this zone?')) deleteZoneMutation.mutate(zone.id) }}
                          className="p-1.5 text-dark-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Methods Tab */}
      {activeTab === 'methods' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
          {methodsLoading ? (
            <div className="p-8 text-center text-dark-500">Loading...</div>
          ) : methods.length === 0 ? (
            <div className="p-8 text-center text-dark-500">No shipping methods yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Base Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Free Threshold</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Est. Days</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {methods.map(method => (
                  <tr key={method.id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-dark-900 dark:text-white">{method.name}</div>
                      {method.description && <div className="text-xs text-dark-400 mt-0.5">{method.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">Rs. {Number(method.base_cost).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">
                      {method.free_shipping_threshold ? `Rs. ${Number(method.free_shipping_threshold).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">{method.estimated_days || method.min_delivery_days ? `${method.min_delivery_days || '?'}-${method.max_delivery_days || '?'} days` : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        method.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-dark-100 text-dark-500 dark:bg-dark-700 dark:text-dark-400'
                      }`}>
                        {method.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openMethodModal(method)} className="p-1.5 text-dark-400 hover:text-primary-500 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this method?')) deleteMethodMutation.mutate(method.id) }}
                          className="p-1.5 text-dark-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-900 dark:text-white">
                {editingZone ? 'Edit Zone' : 'Create Zone'}
              </h2>
              <button onClick={closeZoneModal} className="text-dark-400 hover:text-dark-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveZone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Zone Name *</label>
                <input type="text" value={zoneName} onChange={e => setZoneName(e.target.value)} required
                  className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Cities (comma-separated)</label>
                <textarea value={zoneCities} onChange={e => setZoneCities(e.target.value)} rows={3} placeholder="Lahore, Islamabad, Karachi"
                  className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={zoneActive} onChange={e => setZoneActive(e.target.checked)}
                  className="rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-dark-700 dark:text-dark-300">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveZoneMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium">
                  {saveZoneMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={closeZoneModal}
                  className="px-4 py-2.5 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-900 dark:text-white">
                {editingMethod ? 'Edit Method' : 'Create Method'}
              </h2>
              <button onClick={closeMethodModal} className="text-dark-400 hover:text-dark-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMethod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Method Name *</label>
                <input type="text" value={methodName} onChange={e => setMethodName(e.target.value)} required
                  className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
                <input type="text" value={methodDesc} onChange={e => setMethodDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Base Cost (Rs.) *</label>
                  <input type="number" value={methodCost} onChange={e => setMethodCost(e.target.value)} required min="0" step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Free Threshold (Rs.)</label>
                  <input type="number" value={methodThreshold} onChange={e => setMethodThreshold(e.target.value)} min="0" step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Estimated Days</label>
                <input type="text" value={methodDays} onChange={e => setMethodDays(e.target.value)} placeholder="3-5 days"
                  className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={methodActive} onChange={e => setMethodActive(e.target.checked)}
                  className="rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-dark-700 dark:text-dark-300">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMethodMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium">
                  {saveMethodMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={closeMethodModal}
                  className="px-4 py-2.5 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
