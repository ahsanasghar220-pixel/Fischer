import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PhotoIcon, GlobeAltIcon, EnvelopeIcon, TruckIcon, CreditCardIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('general')

  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'Fischer Pakistan',
    site_tagline: 'Quality Home Appliances',
    contact_email: 'info@fischerpk.com',
    contact_phone: '+92 300 1234567',
    whatsapp_number: '+92 300 1234567',
    address: '123 Industrial Area, Lahore, Pakistan',
    logo_url: '',
    favicon_url: '',
    footer_text: '',
  })

  const [paymentSettings, setPaymentSettings] = useState({
    cod_enabled: true,
    jazzcash_enabled: true,
    easypaisa_enabled: true,
    card_enabled: true,
    cod_extra_charges: 0,
    bank_transfer_enabled: true,
    bank_name: '',
    bank_account_title: '',
    bank_account_number: '',
    bank_iban: '',
  })

  const [shippingSettings, setShippingSettings] = useState({
    free_shipping_threshold: 10000,
    default_shipping_cost: 250,
    express_shipping_cost: 500,
    same_day_cost: 1000,
    delivery_time_standard: '3-5 business days',
    delivery_time_express: '1-2 business days',
    delivery_time_same_day: 'Same day delivery',
  })

  const [emailSettings, setEmailSettings] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: '',
    from_name: 'Fischer Pakistan',
    order_confirmation_enabled: true,
    shipping_notification_enabled: true,
    welcome_email_enabled: true,
  })

  const [seoSettings, setSeoSettings] = useState({
    meta_title: 'Fischer Pakistan - Quality Home Appliances',
    meta_description: 'Shop premium quality water heaters, geysers, and home appliances from Fischer Pakistan.',
    meta_keywords: 'fischer, water heater, geyser, pakistan, home appliances',
    google_analytics_id: '',
    facebook_pixel_id: '',
    og_image: '',
    robots_txt: '',
    sitemap_enabled: true,
  })

  const [socialSettings, setSocialSettings] = useState({
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    linkedin_url: '',
    tiktok_url: '',
  })

  // Fetch settings on load
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings')
      return response.data.data
    },
  })

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      if (settings.general) setGeneralSettings({ ...generalSettings, ...settings.general })
      if (settings.payment) setPaymentSettings({ ...paymentSettings, ...settings.payment })
      if (settings.shipping) setShippingSettings({ ...shippingSettings, ...settings.shipping })
      if (settings.email) setEmailSettings({ ...emailSettings, ...settings.email })
      if (settings.seo) setSeoSettings({ ...seoSettings, ...settings.seo })
      if (settings.social) setSocialSettings({ ...socialSettings, ...settings.social })
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await api.put('/admin/settings', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => {
      toast.error('Failed to save settings')
    },
  })

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'payment', label: 'Payment', icon: CreditCardIcon },
    { id: 'shipping', label: 'Shipping', icon: TruckIcon },
    { id: 'email', label: 'Email', icon: EnvelopeIcon },
    { id: 'seo', label: 'SEO', icon: GlobeAltIcon },
    { id: 'social', label: 'Social Media', icon: PhotoIcon },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Settings</h1>
        <p className="text-dark-500 dark:text-dark-400">Configure your store settings</p>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-dark-200 dark:border-dark-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
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
              className="space-y-6 max-w-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={generalSettings.site_name}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={generalSettings.site_tagline}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, site_tagline: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={generalSettings.contact_email}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={generalSettings.contact_phone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={generalSettings.whatsapp_number}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, whatsapp_number: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-dark-500 mt-1">Include country code (e.g., +923001234567)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address</label>
                <textarea
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={generalSettings.logo_url}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, logo_url: e.target.value })}
                    placeholder="/images/logo.png"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Favicon URL</label>
                  <input
                    type="text"
                    value={generalSettings.favicon_url}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, favicon_url: e.target.value })}
                    placeholder="/favicon.ico"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Footer Text</label>
                <textarea
                  value={generalSettings.footer_text}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, footer_text: e.target.value })}
                  rows={2}
                  placeholder="Copyright text or additional footer information"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
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
              className="space-y-6 max-w-2xl"
            >
              <div className="space-y-3">
                <h3 className="font-medium text-dark-900 dark:text-white">Payment Methods</h3>
                <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700">
                  <div>
                    <span className="font-medium text-dark-900 dark:text-white">Cash on Delivery</span>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Allow customers to pay when they receive</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.cod_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700">
                  <div>
                    <span className="font-medium text-dark-900 dark:text-white">JazzCash</span>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Mobile wallet payment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.jazzcash_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700">
                  <div>
                    <span className="font-medium text-dark-900 dark:text-white">EasyPaisa</span>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Mobile wallet payment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.easypaisa_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700">
                  <div>
                    <span className="font-medium text-dark-900 dark:text-white">Credit/Debit Cards</span>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Visa, Mastercard</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.card_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, card_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700">
                  <div>
                    <span className="font-medium text-dark-900 dark:text-white">Bank Transfer</span>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Direct bank transfer</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.bank_transfer_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_transfer_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  COD Extra Charges (PKR)
                </label>
                <input
                  type="number"
                  value={paymentSettings.cod_extra_charges}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_extra_charges: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {paymentSettings.bank_transfer_enabled && (
                <div className="space-y-4 p-4 bg-dark-50 dark:bg-dark-700 rounded-lg">
                  <h4 className="font-medium text-dark-900 dark:text-white">Bank Account Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={paymentSettings.bank_name}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_name: e.target.value })}
                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Account Title</label>
                      <input
                        type="text"
                        value={paymentSettings.bank_account_title}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_account_title: e.target.value })}
                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={paymentSettings.bank_account_number}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_account_number: e.target.value })}
                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">IBAN</label>
                      <input
                        type="text"
                        value={paymentSettings.bank_iban}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_iban: e.target.value })}
                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
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
              className="space-y-6 max-w-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Free Shipping Threshold (PKR)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.free_shipping_threshold}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, free_shipping_threshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Default Shipping Cost (PKR)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.default_shipping_cost}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, default_shipping_cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Express Shipping Cost (PKR)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.express_shipping_cost}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, express_shipping_cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Same Day Delivery Cost (PKR)
                  </label>
                  <input
                    type="number"
                    value={shippingSettings.same_day_cost}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, same_day_cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-dark-900 dark:text-white">Delivery Time Estimates</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Standard</label>
                    <input
                      type="text"
                      value={shippingSettings.delivery_time_standard}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, delivery_time_standard: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Express</label>
                    <input
                      type="text"
                      value={shippingSettings.delivery_time_express}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, delivery_time_express: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Same Day</label>
                    <input
                      type="text"
                      value={shippingSettings.delivery_time_same_day}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, delivery_time_same_day: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </form>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ email: emailSettings })
              }}
              className="space-y-6 max-w-2xl"
            >
              <div className="space-y-4">
                <h3 className="font-medium text-dark-900 dark:text-white">SMTP Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSettings.smtp_host}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">SMTP Port</label>
                    <input
                      type="text"
                      value={emailSettings.smtp_port}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={emailSettings.smtp_username}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={emailSettings.smtp_password}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Encryption</label>
                  <select
                    value={emailSettings.smtp_encryption}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_encryption: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-dark-900 dark:text-white">Sender Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">From Email</label>
                    <input
                      type="email"
                      value={emailSettings.from_email}
                      onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">From Name</label>
                    <input
                      type="text"
                      value={emailSettings.from_name}
                      onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-dark-900 dark:text-white">Email Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Order Confirmation</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Send email when order is placed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailSettings.order_confirmation_enabled}
                      onChange={(e) => setEmailSettings({ ...emailSettings, order_confirmation_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Shipping Notifications</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Send email when order is shipped</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailSettings.shipping_notification_enabled}
                      onChange={(e) => setEmailSettings({ ...emailSettings, shipping_notification_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Welcome Email</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Send email when user registers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailSettings.welcome_email_enabled}
                      onChange={(e) => setEmailSettings({ ...emailSettings, welcome_email_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-primary-500"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </form>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ seo: seoSettings })
              }}
              className="space-y-6 max-w-2xl"
            >
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Default Meta Title</label>
                <input
                  type="text"
                  value={seoSettings.meta_title}
                  onChange={(e) => setSeoSettings({ ...seoSettings, meta_title: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Default Meta Description</label>
                <textarea
                  value={seoSettings.meta_description}
                  onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  value={seoSettings.meta_keywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={seoSettings.google_analytics_id}
                    onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={seoSettings.facebook_pixel_id}
                    onChange={(e) => setSeoSettings({ ...seoSettings, facebook_pixel_id: e.target.value })}
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Default OG Image URL</label>
                <input
                  type="text"
                  value={seoSettings.og_image}
                  onChange={(e) => setSeoSettings({ ...seoSettings, og_image: e.target.value })}
                  placeholder="/images/og-image.jpg"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                />
              </div>

              <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
                <div>
                  <span className="font-medium text-dark-900 dark:text-white">Enable Sitemap</span>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Auto-generate XML sitemap</p>
                </div>
                <input
                  type="checkbox"
                  checked={seoSettings.sitemap_enabled}
                  onChange={(e) => setSeoSettings({ ...seoSettings, sitemap_enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-primary-500"
                />
              </label>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </form>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ social: socialSettings })
              }}
              className="space-y-6 max-w-2xl"
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={socialSettings.facebook_url}
                    onChange={(e) => setSocialSettings({ ...socialSettings, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={socialSettings.instagram_url}
                    onChange={(e) => setSocialSettings({ ...socialSettings, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/yourpage"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={socialSettings.youtube_url}
                    onChange={(e) => setSocialSettings({ ...socialSettings, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/yourchannel"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Twitter/X URL</label>
                  <input
                    type="url"
                    value={socialSettings.twitter_url}
                    onChange={(e) => setSocialSettings({ ...socialSettings, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={socialSettings.linkedin_url}
                    onChange={(e) => setSocialSettings({ ...socialSettings, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">TikTok URL</label>
                  <input
                    type="url"
                    value={socialSettings.tiktok_url}
                    onChange={(e) => setSocialSettings({ ...socialSettings, tiktok_url: e.target.value })}
                    placeholder="https://tiktok.com/@yourhandle"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
