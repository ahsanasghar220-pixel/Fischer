import { useState } from 'react'
import {
  PhotoIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  TruckIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  BellIcon,
  GiftIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useSettingsData } from './useSettingsData'
import GeneralSettingsTab from './GeneralSettingsTab'
import AppearanceSettingsTab from './AppearanceSettingsTab'
import PaymentSettingsTab from './PaymentSettingsTab'
import ShippingSettingsTab from './ShippingSettingsTab'
import EmailSettingsTab from './EmailSettingsTab'
import SeoSettingsTab from './SeoSettingsTab'
import NotificationSettingsTab from './NotificationSettingsTab'
import LoyaltySettingsTab from './LoyaltySettingsTab'
import SocialSettingsTab from './SocialSettingsTab'

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

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')

  const {
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
  } = useSettingsData()

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
        {/* Tab navigation */}
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

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralSettingsTab
              generalSettings={generalSettings}
              setGeneralSettings={setGeneralSettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceSettingsTab
              appearanceSettings={appearanceSettings}
              setAppearanceSettings={setAppearanceSettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'payment' && (
            <PaymentSettingsTab
              paymentSettings={paymentSettings}
              setPaymentSettings={setPaymentSettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'shipping' && (
            <ShippingSettingsTab
              shippingSettings={shippingSettings}
              setShippingSettings={setShippingSettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'email' && (
            <EmailSettingsTab
              emailSettings={emailSettings}
              setEmailSettings={setEmailSettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'seo' && (
            <SeoSettingsTab
              seoSettings={seoSettings}
              setSeoSettings={setSeoSettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettingsTab
              notificationSettings={notificationSettings}
              setNotificationSettings={setNotificationSettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'loyalty' && (
            <LoyaltySettingsTab
              loyaltySettings={loyaltySettings}
              setLoyaltySettings={setLoyaltySettings}
              saveMutation={saveMutation}
            />
          )}
          {activeTab === 'social' && (
            <SocialSettingsTab
              socialSettings={socialSettings}
              setSocialSettings={setSocialSettings}
              saveMutation={saveMutation}
            />
          )}
        </div>
      </div>
    </div>
  )
}
