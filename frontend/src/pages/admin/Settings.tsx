import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PhotoIcon, GlobeAltIcon, EnvelopeIcon, TruckIcon, CreditCardIcon, Cog6ToothIcon, BellIcon, GiftIcon, SwatchIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { applyBrandColor, generateColorScale } from '@/lib/colorTheme'

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
    cod_extra_charges: 0,
    // JazzCash settings
    jazzcash_enabled: false,
    jazzcash_sandbox: true,
    jazzcash_merchant_id: '',
    jazzcash_password: '',
    jazzcash_integrity_salt: '',
    jazzcash_return_url: '',
    // EasyPaisa settings
    easypaisa_enabled: false,
    easypaisa_sandbox: true,
    easypaisa_store_id: '',
    easypaisa_hash_key: '',
    easypaisa_return_url: '',
    // Card/Stripe settings
    card_enabled: false,
    stripe_sandbox: true,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    // Bank transfer settings
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

  const [notificationSettings, setNotificationSettings] = useState({
    order_notification_emails: 'fischer.few@gmail.com',
    order_notification_enabled: true,
    order_confirmation_to_customer: true,
  })

  const [socialSettings, setSocialSettings] = useState({
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    linkedin_url: '',
    tiktok_url: '',
  })

  const [loyaltySettings, setLoyaltySettings] = useState({
    enabled: true,
    points_per_amount: 100,
    point_value: 1,
    review_bonus: 10,
    referral_bonus: 50,
    birthday_bonus: 100,
    min_redeem_points: 0,
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    brand_color: '#951212',
  })

  // Fetch settings on load
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/api/admin/settings')
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
      if (settings.notifications) setNotificationSettings({ ...notificationSettings, ...settings.notifications })
      if (settings.social) setSocialSettings({ ...socialSettings, ...settings.social })
      if (settings.loyalty) setLoyaltySettings({ ...loyaltySettings, ...settings.loyalty })
      if (settings.appearance) setAppearanceSettings({ ...appearanceSettings, ...settings.appearance })
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await api.put('/api/admin/settings', data)
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
    { id: 'appearance', label: 'Appearance', icon: SwatchIcon },
    { id: 'payment', label: 'Payment', icon: CreditCardIcon },
    { id: 'shipping', label: 'Shipping', icon: TruckIcon },
    { id: 'email', label: 'Email', icon: EnvelopeIcon },
    { id: 'seo', label: 'SEO', icon: GlobeAltIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'loyalty', label: 'Loyalty', icon: GiftIcon },
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
          <div
            className="flex overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
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
                    placeholder="/images/logo.webp"
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

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ appearance: appearanceSettings })
                // Apply the color immediately in the browser
                applyBrandColor(appearanceSettings.brand_color)
              }}
              className="space-y-8 max-w-xl"
            >
              <div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">Brand Color</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
                  Choose your brand's primary color. All buttons, links, highlights, and accents across the entire store will update instantly.
                </p>

                {/* Color picker + hex input row */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <input
                      type="color"
                      value={appearanceSettings.brand_color}
                      onChange={(e) => {
                        setAppearanceSettings({ ...appearanceSettings, brand_color: e.target.value })
                        applyBrandColor(e.target.value)
                      }}
                      className="w-16 h-16 rounded-xl border-2 border-dark-200 dark:border-dark-600 cursor-pointer p-1 bg-white dark:bg-dark-700"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Hex Color</label>
                    <input
                      type="text"
                      value={appearanceSettings.brand_color}
                      onChange={(e) => {
                        const val = e.target.value
                        setAppearanceSettings({ ...appearanceSettings, brand_color: val })
                        if (/^#[0-9a-fA-F]{6}$/.test(val)) applyBrandColor(val)
                      }}
                      placeholder="#951212"
                      maxLength={7}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Shade preview */}
                <div>
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-2 uppercase tracking-wide">Generated shade scale</p>
                  <div className="flex rounded-lg overflow-hidden h-10 border border-dark-200 dark:border-dark-700">
                    {Object.entries(generateColorScale(appearanceSettings.brand_color)).map(([shade, channels]) => {
                      const [r, g, b] = channels.split(' ').map(Number)
                      return (
                        <div
                          key={shade}
                          className="flex-1 group relative"
                          style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                          title={shade}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 text-white mix-blend-difference transition-opacity">
                            {shade}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-dark-400">50</span>
                    <span className="text-[10px] text-dark-400">950</span>
                  </div>
                </div>

                {/* Preset colors */}
                <div className="mt-6">
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-3 uppercase tracking-wide">Quick presets</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Fischer Red', color: '#951212' },
                      { label: 'Royal Blue', color: '#1d4ed8' },
                      { label: 'Emerald', color: '#059669' },
                      { label: 'Violet', color: '#7c3aed' },
                      { label: 'Amber', color: '#d97706' },
                      { label: 'Rose', color: '#e11d48' },
                      { label: 'Slate', color: '#475569' },
                      { label: 'Indigo', color: '#4338ca' },
                    ].map(({ label, color }) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setAppearanceSettings({ ...appearanceSettings, brand_color: color })
                          applyBrandColor(color)
                        }}
                        title={label}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          appearanceSettings.brand_color === color
                            ? 'border-dark-900 dark:border-white scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-4">
                  Changes apply live in your browser. Click "Save" to persist the color for all visitors.
                </p>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {saveMutation.isPending && <LoadingSpinner size="sm" />}
                  Save Brand Color
                </button>
              </div>
            </form>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ payment: paymentSettings })
              }}
              className="space-y-6 max-w-3xl"
            >
              {/* Cash on Delivery */}
              <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
                <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-xl">💵</span>
                    </div>
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Cash on Delivery</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Allow customers to pay when they receive</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.cod_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                {paymentSettings.cod_enabled && (
                  <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                        Extra Charges (PKR)
                      </label>
                      <input
                        type="number"
                        value={paymentSettings.cod_extra_charges}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_extra_charges: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full max-w-xs px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Additional fee charged for COD orders (set to 0 for no extra charges)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* JazzCash */}
              <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
                <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-red-600">JC</span>
                    </div>
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">JazzCash</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Mobile wallet & online banking</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.jazzcash_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                {paymentSettings.jazzcash_enabled && (
                  <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-300">
                        <input
                          type="checkbox"
                          checked={paymentSettings.jazzcash_sandbox}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_sandbox: e.target.checked })}
                          className="w-4 h-4 rounded text-primary-500"
                        />
                        Sandbox Mode (Testing)
                      </label>
                      <span className={`px-2 py-1 text-xs rounded-full ${paymentSettings.jazzcash_sandbox ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {paymentSettings.jazzcash_sandbox ? 'Test Mode' : 'Live Mode'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Merchant ID *</label>
                        <input
                          type="text"
                          value={paymentSettings.jazzcash_merchant_id}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_merchant_id: e.target.value })}
                          placeholder="MC12345"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Password *</label>
                        <input
                          type="password"
                          value={paymentSettings.jazzcash_password}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Integrity Salt *</label>
                        <input
                          type="password"
                          value={paymentSettings.jazzcash_integrity_salt}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_integrity_salt: e.target.value })}
                          placeholder="Enter your integrity salt from JazzCash portal"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Found in JazzCash Merchant Portal under Security Settings</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Return URL</label>
                        <input
                          type="text"
                          value={paymentSettings.jazzcash_return_url}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_return_url: e.target.value })}
                          placeholder="https://yoursite.com/payment/jazzcash/callback"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Setup Guide:</strong> Register at{' '}
                        <a href="https://www.jazzcash.com.pk/business" target="_blank" rel="noopener noreferrer" className="underline">
                          JazzCash Business Portal
                        </a>
                        {' '}to get your API credentials.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* EasyPaisa */}
              <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
                <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-green-600">EP</span>
                    </div>
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">EasyPaisa</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Mobile wallet & online banking</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.easypaisa_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                {paymentSettings.easypaisa_enabled && (
                  <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-300">
                        <input
                          type="checkbox"
                          checked={paymentSettings.easypaisa_sandbox}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_sandbox: e.target.checked })}
                          className="w-4 h-4 rounded text-primary-500"
                        />
                        Sandbox Mode (Testing)
                      </label>
                      <span className={`px-2 py-1 text-xs rounded-full ${paymentSettings.easypaisa_sandbox ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {paymentSettings.easypaisa_sandbox ? 'Test Mode' : 'Live Mode'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Store ID *</label>
                        <input
                          type="text"
                          value={paymentSettings.easypaisa_store_id}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_store_id: e.target.value })}
                          placeholder="12345"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Hash Key *</label>
                        <input
                          type="password"
                          value={paymentSettings.easypaisa_hash_key}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_hash_key: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Return URL</label>
                        <input
                          type="text"
                          value={paymentSettings.easypaisa_return_url}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_return_url: e.target.value })}
                          placeholder="https://yoursite.com/payment/easypaisa/callback"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Setup Guide:</strong> Apply for merchant account at{' '}
                        <a href="https://www.easypaisa.com.pk/business" target="_blank" rel="noopener noreferrer" className="underline">
                          EasyPaisa Business
                        </a>
                        {' '}to get your Store ID and Hash Key.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Credit/Debit Cards (Stripe) */}
              <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
                <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <span className="text-xl">💳</span>
                    </div>
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Credit/Debit Cards</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Visa, Mastercard via Stripe</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.card_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, card_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                {paymentSettings.card_enabled && (
                  <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-300">
                        <input
                          type="checkbox"
                          checked={paymentSettings.stripe_sandbox}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_sandbox: e.target.checked })}
                          className="w-4 h-4 rounded text-primary-500"
                        />
                        Test Mode
                      </label>
                      <span className={`px-2 py-1 text-xs rounded-full ${paymentSettings.stripe_sandbox ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {paymentSettings.stripe_sandbox ? 'Test Mode' : 'Live Mode'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Publishable Key *</label>
                        <input
                          type="text"
                          value={paymentSettings.stripe_publishable_key}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_publishable_key: e.target.value })}
                          placeholder={paymentSettings.stripe_sandbox ? "pk_test_..." : "pk_live_..."}
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Secret Key *</label>
                        <input
                          type="password"
                          value={paymentSettings.stripe_secret_key}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_secret_key: e.target.value })}
                          placeholder={paymentSettings.stripe_sandbox ? "sk_test_..." : "sk_live_..."}
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Never share this key. Keep it secure on server-side only.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Webhook Secret</label>
                        <input
                          type="password"
                          value={paymentSettings.stripe_webhook_secret}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_webhook_secret: e.target.value })}
                          placeholder="whsec_..."
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Required for payment confirmations. Get it from Stripe Dashboard → Webhooks.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Setup Guide:</strong> Get your API keys from{' '}
                        <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">
                          Stripe Dashboard
                        </a>
                        . Use test keys during development.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
                <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-xl">🏦</span>
                    </div>
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Bank Transfer</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Direct bank account transfer</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.bank_transfer_enabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_transfer_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                  />
                </label>
                {paymentSettings.bank_transfer_enabled && (
                  <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                      Enter your bank account details. These will be shown to customers who choose bank transfer.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Bank Name *</label>
                        <input
                          type="text"
                          value={paymentSettings.bank_name}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_name: e.target.value })}
                          placeholder="HBL, MCB, UBL, etc."
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Account Title *</label>
                        <input
                          type="text"
                          value={paymentSettings.bank_account_title}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_account_title: e.target.value })}
                          placeholder="Fischer Electronics Pvt Ltd"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Account Number *</label>
                        <input
                          type="text"
                          value={paymentSettings.bank_account_number}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_account_number: e.target.value })}
                          placeholder="1234567890123"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">IBAN</label>
                        <input
                          type="text"
                          value={paymentSettings.bank_iban}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_iban: e.target.value })}
                          placeholder="PK36HABB0000000000000000"
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {saveMutation.isPending && <LoadingSpinner size="sm" />}
                  Save Payment Settings
                </button>
              </div>
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
                  placeholder="/images/og-image.webp"
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

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ notifications: notificationSettings })
              }}
              className="space-y-6 max-w-2xl"
            >
              <div className="space-y-4">
                <h3 className="font-medium text-dark-900 dark:text-white">Order Notifications</h3>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Notification Recipient Emails
                  </label>
                  <textarea
                    value={notificationSettings.order_notification_emails}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, order_notification_emails: e.target.value })}
                    rows={3}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                    Comma-separated list of emails that will receive order notifications
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Send Order Notifications</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        Notify recipients above when a new order is placed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.order_notification_enabled}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, order_notification_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
                    <div>
                      <span className="font-medium text-dark-900 dark:text-white">Send Confirmation to Customer</span>
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        Send order confirmation email to the customer
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.order_confirmation_to_customer}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, order_confirmation_to_customer: e.target.checked })}
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

          {/* Loyalty Points Settings */}
          {activeTab === 'loyalty' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate({ loyalty: loyaltySettings })
              }}
              className="space-y-6 max-w-2xl"
            >
              <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
                <div>
                  <span className="font-medium text-dark-900 dark:text-white">Enable Loyalty Program</span>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Allow customers to earn and redeem loyalty points</p>
                </div>
                <input
                  type="checkbox"
                  checked={loyaltySettings.enabled}
                  onChange={(e) => setLoyaltySettings({ ...loyaltySettings, enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                />
              </label>

              <div className="space-y-4">
                <h3 className="font-medium text-dark-900 dark:text-white">Earning Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Points Per Amount Spent (PKR)
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.points_per_amount}
                      onChange={(e) => setLoyaltySettings({ ...loyaltySettings, points_per_amount: parseInt(e.target.value) || 0 })}
                      min="1"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Customer earns 1 point for every this amount spent (e.g., 100 = 1 point per Rs. 100)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Point Value (PKR)
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.point_value}
                      onChange={(e) => setLoyaltySettings({ ...loyaltySettings, point_value: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">How much each point is worth in PKR when redeemed (e.g., 1 = Rs. 1 per point)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-dark-900 dark:text-white">Bonus Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Review Bonus
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.review_bonus}
                      onChange={(e) => setLoyaltySettings({ ...loyaltySettings, review_bonus: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Points for writing a review</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Referral Bonus
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.referral_bonus}
                      onChange={(e) => setLoyaltySettings({ ...loyaltySettings, referral_bonus: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Points for referring a friend</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Birthday Bonus
                    </label>
                    <input
                      type="number"
                      value={loyaltySettings.birthday_bonus}
                      onChange={(e) => setLoyaltySettings({ ...loyaltySettings, birthday_bonus: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Points on customer birthday</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Minimum Points to Redeem
                </label>
                <input
                  type="number"
                  value={loyaltySettings.min_redeem_points}
                  onChange={(e) => setLoyaltySettings({ ...loyaltySettings, min_redeem_points: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full max-w-xs px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Minimum points required before a customer can redeem (0 = no minimum)</p>
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
