import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export interface GeneralSettings {
  site_name: string
  site_tagline: string
  contact_email: string
  contact_phone: string
  whatsapp_number: string
  address: string
  logo_url: string
  favicon_url: string
  footer_text: string
}

export interface PaymentSettings {
  cod_enabled: boolean
  cod_extra_charges: number
  jazzcash_enabled: boolean
  jazzcash_sandbox: boolean
  jazzcash_merchant_id: string
  jazzcash_password: string
  jazzcash_integrity_salt: string
  jazzcash_return_url: string
  easypaisa_enabled: boolean
  easypaisa_sandbox: boolean
  easypaisa_store_id: string
  easypaisa_hash_key: string
  easypaisa_return_url: string
  card_enabled: boolean
  stripe_sandbox: boolean
  stripe_publishable_key: string
  stripe_secret_key: string
  stripe_webhook_secret: string
  bank_transfer_enabled: boolean
  bank_name: string
  bank_account_title: string
  bank_account_number: string
  bank_iban: string
}

export interface ShippingSettings {
  free_shipping_threshold: number
  default_shipping_cost: number
  express_shipping_cost: number
  same_day_cost: number
  delivery_time_standard: string
  delivery_time_express: string
  delivery_time_same_day: string
}

export interface EmailSettings {
  smtp_host: string
  smtp_port: string
  smtp_username: string
  smtp_password: string
  smtp_encryption: string
  from_email: string
  from_name: string
  order_confirmation_enabled: boolean
  shipping_notification_enabled: boolean
  welcome_email_enabled: boolean
}

export interface SeoSettings {
  meta_title: string
  meta_description: string
  meta_keywords: string
  google_analytics_id: string
  facebook_pixel_id: string
  og_image: string
  robots_txt: string
  sitemap_enabled: boolean
}

export interface NotificationSettings {
  order_notification_emails: string
  order_notification_enabled: boolean
  order_confirmation_to_customer: boolean
}

export interface SocialSettings {
  facebook_url: string
  instagram_url: string
  youtube_url: string
  twitter_url: string
  linkedin_url: string
  tiktok_url: string
}

export interface LoyaltySettings {
  enabled: boolean
  points_per_amount: number
  point_value: number
  review_bonus: number
  referral_bonus: number
  birthday_bonus: number
  min_redeem_points: number
}

export interface AppearanceSettings {
  brand_color: string
}

export function useSettingsData() {
  const queryClient = useQueryClient()

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
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

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cod_enabled: true,
    cod_extra_charges: 0,
    jazzcash_enabled: false,
    jazzcash_sandbox: true,
    jazzcash_merchant_id: '',
    jazzcash_password: '',
    jazzcash_integrity_salt: '',
    jazzcash_return_url: '',
    easypaisa_enabled: false,
    easypaisa_sandbox: true,
    easypaisa_store_id: '',
    easypaisa_hash_key: '',
    easypaisa_return_url: '',
    card_enabled: false,
    stripe_sandbox: true,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    bank_transfer_enabled: true,
    bank_name: '',
    bank_account_title: '',
    bank_account_number: '',
    bank_iban: '',
  })

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    free_shipping_threshold: 10000,
    default_shipping_cost: 250,
    express_shipping_cost: 500,
    same_day_cost: 1000,
    delivery_time_standard: '3-5 business days',
    delivery_time_express: '1-2 business days',
    delivery_time_same_day: 'Same day delivery',
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
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

  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    meta_title: 'Fischer Pakistan - Quality Home Appliances',
    meta_description: 'Shop premium quality water heaters, geysers, and home appliances from Fischer Pakistan.',
    meta_keywords: 'fischer, water heater, geyser, pakistan, home appliances',
    google_analytics_id: '',
    facebook_pixel_id: '',
    og_image: '',
    robots_txt: '',
    sitemap_enabled: true,
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    order_notification_emails: 'fischer.few@gmail.com',
    order_notification_enabled: true,
    order_confirmation_to_customer: true,
  })

  const [socialSettings, setSocialSettings] = useState<SocialSettings>({
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    linkedin_url: '',
    tiktok_url: '',
  })

  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>({
    enabled: true,
    points_per_amount: 100,
    point_value: 1,
    review_bonus: 10,
    referral_bonus: 50,
    birthday_bonus: 100,
    min_redeem_points: 0,
  })

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    brand_color: '#951212',
  })

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/api/admin/settings')
      return response.data.data
    },
  })

  useEffect(() => {
    if (settings) {
      if (settings.general) setGeneralSettings((prev) => ({ ...prev, ...settings.general }))
      if (settings.payment) setPaymentSettings((prev) => ({ ...prev, ...settings.payment }))
      if (settings.shipping) setShippingSettings((prev) => ({ ...prev, ...settings.shipping }))
      if (settings.email) setEmailSettings((prev) => ({ ...prev, ...settings.email }))
      if (settings.seo) setSeoSettings((prev) => ({ ...prev, ...settings.seo }))
      if (settings.notifications) setNotificationSettings((prev) => ({ ...prev, ...settings.notifications }))
      if (settings.social) setSocialSettings((prev) => ({ ...prev, ...settings.social }))
      if (settings.loyalty) setLoyaltySettings((prev) => ({ ...prev, ...settings.loyalty }))
      if (settings.appearance) setAppearanceSettings((prev) => ({ ...prev, ...settings.appearance }))
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

  return {
    isLoading,
    saveMutation,
    generalSettings,
    setGeneralSettings,
    paymentSettings,
    setPaymentSettings,
    shippingSettings,
    setShippingSettings,
    emailSettings,
    setEmailSettings,
    seoSettings,
    setSeoSettings,
    notificationSettings,
    setNotificationSettings,
    socialSettings,
    setSocialSettings,
    loyaltySettings,
    setLoyaltySettings,
    appearanceSettings,
    setAppearanceSettings,
  }
}
