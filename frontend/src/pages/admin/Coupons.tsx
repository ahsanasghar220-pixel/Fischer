import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Coupon {
  id: number
  code: string
  name?: string
  description?: string
  type: 'fixed' | 'percentage' | 'free_shipping'
  value: number
  minimum_order_amount?: number
  maximum_discount?: number
  usage_limit?: number
  usage_limit_per_user?: number
  times_used: number
  applicable_categories?: number[]
  applicable_products?: number[]
  excluded_products?: number[]
  is_active: boolean
  first_order_only: boolean
  starts_at?: string
  expires_at?: string
}

const defaultForm = {
  code: '',
  name: '',
  description: '',
  type: 'percentage' as 'fixed' | 'percentage' | 'free_shipping',
  value: '',
  minimum_order_amount: '',
  maximum_discount: '',
  usage_limit: '',
  usage_limit_per_user: '',
  is_active: true,
  first_order_only: false,
  starts_at: '',
  expires_at: '',
}

export default function AdminCoupons() {
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [form, setForm] = useState(defaultForm)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/api/admin/coupons')
      return res.data.data?.data || res.data.data || []
    },
  })

  const coupons: Coupon[] = data || []

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingCoupon) {
        return api.put(`/api/admin/coupons/${editingCoupon.id}`, payload)
      }
      return api.post('/api/admin/coupons', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created')
      closeModal()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const toggleMutation = useMutation({
    mutationFn: (coupon: Coupon) => api.put(`/api/admin/coupons/${coupon.id}`, { is_active: !coupon.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
  })

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setForm({
        code: coupon.code,
        name: coupon.name || '',
        description: coupon.description || '',
        type: coupon.type,
        value: String(coupon.value),
        minimum_order_amount: coupon.minimum_order_amount ? String(coupon.minimum_order_amount) : '',
        maximum_discount: coupon.maximum_discount ? String(coupon.maximum_discount) : '',
        usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
        usage_limit_per_user: coupon.usage_limit_per_user ? String(coupon.usage_limit_per_user) : '',
        is_active: coupon.is_active,
        first_order_only: coupon.first_order_only,
        starts_at: coupon.starts_at ? coupon.starts_at.split('T')[0] : '',
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      })
    } else {
      setEditingCoupon(null)
      setForm(defaultForm)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCoupon(null)
  }

  const duplicateCoupon = (coupon: Coupon) => {
    openModal()
    setForm(prev => ({
      ...prev,
      code: coupon.code + '-COPY',
      name: coupon.name || '',
      description: coupon.description || '',
      type: coupon.type,
      value: String(coupon.value),
      minimum_order_amount: coupon.minimum_order_amount ? String(coupon.minimum_order_amount) : '',
      maximum_discount: coupon.maximum_discount ? String(coupon.maximum_discount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      usage_limit_per_user: coupon.usage_limit_per_user ? String(coupon.usage_limit_per_user) : '',
      is_active: false,
      first_order_only: coupon.first_order_only,
      starts_at: '',
      expires_at: '',
    }))
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setForm(prev => ({ ...prev, code }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      code: form.code,
      name: form.name || null,
      description: form.description || null,
      type: form.type,
      value: parseFloat(form.value) || 0,
      minimum_order_amount: form.minimum_order_amount ? parseFloat(form.minimum_order_amount) : null,
      maximum_discount: form.maximum_discount ? parseFloat(form.maximum_discount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      usage_limit_per_user: form.usage_limit_per_user ? parseInt(form.usage_limit_per_user) : null,
      is_active: form.is_active,
      first_order_only: form.first_order_only,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
    })
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Percentage'
      case 'fixed': return 'Fixed Amount'
      case 'free_shipping': return 'Free Shipping'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Coupons</h1>
        <button onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm">
          <PlusIcon className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-dark-500">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-dark-500">No coupons yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Expires</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50">
                    <td className="px-4 py-3 font-mono font-medium text-dark-900 dark:text-white">{coupon.code}</td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">{typeLabel(coupon.type)}</td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.type === 'free_shipping' ? 'Free' : `Rs. ${Number(coupon.value).toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">
                      {coupon.times_used || 0}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleMutation.mutate(coupon)}
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          coupon.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-dark-100 text-dark-500'
                        }`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openModal(coupon)} className="p-1.5 text-dark-400 hover:text-primary-500" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => duplicateCoupon(coupon)} className="p-1.5 text-dark-400 hover:text-blue-500" title="Duplicate">
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(coupon.id) }}
                          className="p-1.5 text-dark-400 hover:text-red-500" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-900 dark:text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button onClick={closeModal} className="text-dark-400 hover:text-dark-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Code *</label>
                <div className="flex gap-2">
                  <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. SUMMER20"
                    className="flex-1 px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-primary-500" />
                  <button type="button" onClick={generateCode}
                    className="px-3 py-2 bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 rounded-lg text-sm hover:bg-dark-200 dark:hover:bg-dark-600">
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale 20% Off"
                  className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Internal name to identify this coupon</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. 20% off all kitchen appliances during summer sale" rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Optional notes about this coupon's purpose</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Percentage = % off order, Fixed = flat Rs. discount, Free Shipping = waive delivery fee</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    {form.type === 'percentage' ? 'Discount %' : 'Amount (Rs.)'} *
                  </label>
                  <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required min="0" placeholder="e.g. 20"
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
                    {form.type === 'percentage' ? 'Percentage off the order total (1-100)' : form.type === 'fixed' ? 'Fixed amount in Rs. to discount' : 'Not applicable for free shipping'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Min Order (Rs.)</label>
                  <input type="number" value={form.minimum_order_amount} onChange={e => setForm({ ...form, minimum_order_amount: e.target.value })} min="0" placeholder="e.g. 5000"
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Coupon will only work if the cart total is above this amount</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Max Discount (Rs.)</label>
                  <input type="number" value={form.maximum_discount} onChange={e => setForm({ ...form, maximum_discount: e.target.value })} min="0" placeholder="e.g. 2000"
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Maximum discount cap in Rs. (useful for percentage coupons)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: e.target.value })} min="1" placeholder="e.g. 100"
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Total number of times this coupon can be used across all customers</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Per-User Limit</label>
                  <input type="number" value={form.usage_limit_per_user} onChange={e => setForm({ ...form, usage_limit_per_user: e.target.value })} min="1" placeholder="e.g. 1"
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">How many times a single customer can use this coupon</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Start Date</label>
                  <input type="date" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Coupon becomes active on this date</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Expiry Date</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">Coupon expires after this date</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
                  <span className="text-sm text-dark-700 dark:text-dark-300">Active <span className="text-xs text-dark-400 dark:text-dark-500">(Inactive coupons cannot be applied)</span></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.first_order_only} onChange={e => setForm({ ...form, first_order_only: e.target.checked })}
                    className="rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
                  <span className="text-sm text-dark-700 dark:text-dark-300">First order only <span className="text-xs text-dark-400 dark:text-dark-500">(Only new customers who haven't placed an order can use this)</span></span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium">
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={closeModal}
                  className="px-4 py-2.5 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-600 dark:text-dark-300">
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
