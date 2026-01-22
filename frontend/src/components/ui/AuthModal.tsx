import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultTab?: 'login' | 'register'
  message?: string
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login',
  message = 'Please sign in to continue'
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuthStore()

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(loginForm.email, loginForm.password)
      toast.success('Welcome back!')
      onClose()
      onSuccess?.()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerForm.password !== registerForm.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await register({
        first_name: registerForm.first_name,
        last_name: registerForm.last_name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.password_confirmation
      })
      toast.success('Account created successfully!')
      onClose()
      onSuccess?.()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : err.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForms = () => {
    setLoginForm({ email: '', password: '' })
    setRegisterForm({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '' })
    setShowPassword(false)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          resetForms()
          onClose()
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-dark-800 shadow-2xl transition-all">
                {/* Header */}
                <div className="relative p-6 pb-0">
                  <button
                    onClick={() => {
                      resetForms()
                      onClose()
                    }}
                    className="absolute right-4 top-4 p-2 rounded-lg text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>

                  <div className="text-center mb-6">
                    <Link to="/" onClick={onClose}>
                      <img src="/images/logo-dark.png" alt="Fischer" className="h-10 mx-auto dark:hidden" />
                      <img src="/images/logo-light.png" alt="Fischer" className="h-10 mx-auto hidden dark:block" />
                    </Link>
                    <p className="mt-4 text-dark-600 dark:text-dark-400">{message}</p>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 bg-dark-100 dark:bg-dark-700 rounded-xl">
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        activeTab === 'login'
                          ? 'bg-white dark:bg-dark-600 text-dark-900 dark:text-white shadow-sm'
                          : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setActiveTab('register')}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        activeTab === 'register'
                          ? 'bg-white dark:bg-dark-600 text-dark-900 dark:text-white shadow-sm'
                          : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <Link
                          to="/forgot-password"
                          onClick={onClose}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary-500 hover:bg-primary-400 text-dark-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            required
                            value={registerForm.first_name}
                            onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                            className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            required
                            value={registerForm.last_name}
                            onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })}
                            className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                            placeholder="Min 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={registerForm.password_confirmation}
                          onChange={(e) => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
                          className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Confirm your password"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary-500 hover:bg-primary-400 text-dark-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>

                      <p className="text-xs text-center text-dark-500 dark:text-dark-400">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" onClick={onClose} className="text-primary-600 dark:text-primary-400 hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" onClick={onClose} className="text-primary-600 dark:text-primary-400 hover:underline">
                          Privacy Policy
                        </Link>
                      </p>
                    </form>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
