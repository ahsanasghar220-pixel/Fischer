import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')

  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'Fischer Pakistan',
    site_tagline: 'Quality Home Appliances',
    contact_email: 'info@fischerpk.com',
    contact_phone: '+92 300 1234567',
    address: '123 Industrial Area, Lahore, Pakistan',
  })

  const [paymentSettings, setPaymentSettings] = useState({
    cod_enabled: true,
    jazzcash_enabled: true,
    easypaisa_enabled: true,
    card_enabled: true,
    cod_extra_charges: 0,
  })

  const [shippingSettings, setShippingSettings] = useState({
    free_shipping_threshold: 10000,
    default_shipping_cost: 250,
    express_shipping_cost: 500,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await api.put('/admin/settings', data)
    },
    onSuccess: () => {
      toast.success('Settings saved successfully')
    },
    onError: () => {
      toast.error('Failed to save settings')
    },
  })

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'payment', label: 'Payment' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'email', label: 'Email' },
    { id: 'seo', label: 'SEO' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Settings</h1>
        <p className="text-dark-500">Configure your store settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-dark-500 hover:text-dark-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ general: generalSettings })
              }}
              className="space-y-4 max-w-2xl"
            >
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Site Name</label>
                <input
                  type="text"
                  value={generalSettings.site_name}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={generalSettings.site_tagline}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, site_tagline: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={generalSettings.contact_email}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={generalSettings.contact_phone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Address</label>
                <textarea
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                {saveMutation.isPending && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </form>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ payment: paymentSettings })
              }}
              className="space-y-4 max-w-2xl"
            >
              <div className="space-y-3">
                <h3 className="font-medium text-dark-900">Payment Methods</h3>
                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium text-dark-900">Cash on Delivery</span>
                    <p className="text-sm text-dark-500">Allow customers to pay when they receive</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.cod_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium text-dark-900">JazzCash</span>
                    <p className="text-sm text-dark-500">Mobile wallet payment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.jazzcash_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium text-dark-900">EasyPaisa</span>
                    <p className="text-sm text-dark-500">Mobile wallet payment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.easypaisa_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <span className="font-medium text-dark-900">Credit/Debit Cards</span>
                    <p className="text-sm text-dark-500">Visa, Mastercard</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.card_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, card_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  COD Extra Charges (PKR)
                </label>
                <input
                  type="number"
                  value={paymentSettings.cod_extra_charges}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_extra_charges: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                {saveMutation.isPending && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </form>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ shipping: shippingSettings })
              }}
              className="space-y-4 max-w-2xl"
            >
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  Free Shipping Threshold (PKR)
                </label>
                <input
                  type="number"
                  value={shippingSettings.free_shipping_threshold}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, free_shipping_threshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-dark-500 mt-1">Orders above this amount get free shipping</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  Default Shipping Cost (PKR)
                </label>
                <input
                  type="number"
                  value={shippingSettings.default_shipping_cost}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, default_shipping_cost: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  Express Shipping Cost (PKR)
                </label>
                <input
                  type="number"
                  value={shippingSettings.express_shipping_cost}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, express_shipping_cost: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                {saveMutation.isPending && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </form>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="max-w-2xl">
              <p className="text-dark-500">Email notification settings coming soon...</p>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="max-w-2xl">
              <p className="text-dark-500">SEO settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
