import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LockClosedIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const mutation = useMutation({
    mutationFn: async (data: { token: string; email: string; password: string; password_confirmation: string }) => {
      const response = await api.post('/api/auth/reset-password', data)
      return response.data
    },
    onSuccess: () => {
      setResetSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    },
    onError: (error: Error & { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
      const errorMessage = error.response?.data?.message || 'Failed to reset password'
      const errors = error.response?.data?.errors

      if (errors) {
        Object.values(errors).flat().forEach(err => toast.error(err))
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !email) {
      toast.error('Invalid or missing reset token')
      return
    }

    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match')
      return
    }

    mutation.mutate({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
  }

  // Check if token and email exist
  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid reset link. Please request a new password reset.')
    }
  }, [token, email])

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 transition-colors">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-8 text-center transition-colors">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-block w-full btn btn-primary py-3"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 transition-colors">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-8 text-center transition-colors">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Invalid Reset Link</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full btn btn-primary py-3"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/images/logo/Fischer-electronics-logo-black.svg" alt="Fischer" width={784} height={465} className="h-12 w-auto mx-auto dark:hidden" />
            <img src="/images/logo/Fischer-electronics-logo-white.svg" alt="Fischer" width={784} height={465} className="h-12 w-auto mx-auto hidden dark:block" />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-dark-900 dark:text-white">Reset Password</h1>
          <p className="mt-2 text-dark-500 dark:text-dark-400">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-8 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-500 dark:text-dark-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>
              <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full btn btn-primary py-3 flex items-center justify-center"
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
