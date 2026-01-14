import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, fetchUser } = useAuthStore()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const profileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      await api.put('/account/profile', data)
    },
    onSuccess: () => {
      fetchUser()
      toast.success('Profile updated successfully')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      await api.put('/account/password', data)
    },
    onSuccess: () => {
      setPasswordData({ current_password: '', password: '', password_confirmation: '' })
      toast.success('Password updated successfully')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update password')
    },
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    profileMutation.mutate(profileData)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    passwordMutation.mutate(passwordData)
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Profile Settings</h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Update your personal information</p>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="03XX-XXXXXXX"
                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="btn btn-primary flex items-center gap-2"
            >
              {profileMutation.isPending && <LoadingSpinner size="sm" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Change Password</h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Update your password</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6">
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Confirm New Password</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="btn btn-primary flex items-center gap-2"
            >
              {passwordMutation.isPending && <LoadingSpinner size="sm" />}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Email Preferences */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Email Preferences</h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Manage your email notifications</p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Order Updates</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Receive updates about your orders</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Promotional Emails</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Receive special offers and discounts</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Newsletter</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Get updates on new products and tips</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
            />
          </label>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800">
        <div className="p-4 border-b border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>
        <div className="p-6">
          <p className="text-dark-600 dark:text-dark-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="btn bg-red-600 text-white hover:bg-red-700">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
