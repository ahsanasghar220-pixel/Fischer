import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, MapPinIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Address {
  id: number
  label?: string
  first_name: string
  last_name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state?: string
  postal_code?: string
  is_default_shipping: boolean
  is_default_billing: boolean
}

const pakistanCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad',
  'Bahawalpur', 'Sargodha', 'Sukkur', 'Mardan', 'Sahiwal', 'Sheikhupura'
]

const initialFormState = {
  label: '',
  first_name: '',
  last_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: 'Punjab',
  postal_code: '',
  is_default_shipping: false,
  is_default_billing: false,
}

export default function Addresses() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState(initialFormState)

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await api.get('/api/addresses')
      return response.data.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, data)
      } else {
        await api.post('/api/addresses', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success(editingId ? 'Address updated' : 'Address added')
      resetForm()
    },
    onError: () => {
      toast.error('Failed to save address')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/addresses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address deleted')
    },
    onError: () => {
      toast.error('Failed to delete address')
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/addresses/${id}/default-shipping`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Default address updated')
    },
    onError: () => {
      toast.error('Failed to update default address')
    },
  })

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label || '',
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state || 'Punjab',
      postal_code: address.postal_code || '',
      is_default_shipping: address.is_default_shipping,
      is_default_billing: address.is_default_billing,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setEditingId(null)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white">My Addresses</h2>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Manage your shipping addresses</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Address
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-6 border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900/50">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Home, Office, etc."
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">City *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select city</option>
                  {pakistanCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                  placeholder="Street address, house number"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                  placeholder="Apartment, suite, unit (optional)"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">State/Province</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="AJK">Azad Kashmir</option>
                  <option value="GB">Gilgit-Baltistan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default_shipping}
                    onChange={(e) => setFormData({ ...formData, is_default_shipping: e.target.checked })}
                    className="rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
                  />
                  <span className="text-sm text-dark-600 dark:text-dark-400">Set as default shipping address</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn btn-primary"
              >
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-dark-outline">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Addresses List */}
        {addresses && addresses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4 p-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 border rounded-xl ${
                  address.is_default_shipping
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-dark-900 dark:text-white">
                      {address.label || 'Address'}
                    </span>
                    {address.is_default_shipping && (
                      <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-1.5 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 rounded"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(address.id)}
                      className="p-1.5 text-dark-400 dark:text-dark-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="font-medium text-dark-900 dark:text-white">
                  {address.first_name} {address.last_name}
                </p>
                <p className="text-dark-600 dark:text-dark-400 text-sm mt-1">{address.phone}</p>
                <p className="text-dark-600 dark:text-dark-400 text-sm mt-2">
                  {address.address_line_1}
                  {address.address_line_2 && `, ${address.address_line_2}`}
                </p>
                <p className="text-dark-600 dark:text-dark-400 text-sm">
                  {address.city}
                  {address.state && `, ${address.state}`}
                  {address.postal_code && ` ${address.postal_code}`}
                </p>
                {!address.is_default_shipping && (
                  <button
                    onClick={() => setDefaultMutation.mutate(address.id)}
                    className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-3"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="p-12 text-center">
              <MapPinIcon className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
              <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No addresses saved</h3>
              <p className="text-dark-500 dark:text-dark-400 mb-6">Add an address to speed up checkout</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">
                Add Your First Address
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
