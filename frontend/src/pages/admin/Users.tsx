import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface AdminUser {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string | null
  status: string
  roles: string[]
  last_login_at: string | null
  created_at: string
}

interface UsersResponse {
  data: AdminUser[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

interface UserForm {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  role: string
  status: string
}

const emptyForm: UserForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'order-manager',
  status: 'active',
}

const roleLabels: Record<string, string> = {
  'super-admin': 'Super Admin',
  'admin': 'Admin',
  'order-manager': 'Order Manager',
  'content-manager': 'Content Manager',
}

const roleBadge = (role: string) => {
  switch (role) {
    case 'super-admin':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'admin':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'order-manager':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'content-manager':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-dark-100 text-dark-600 dark:bg-dark-700 dark:text-dark-400'
  }
}

export default function AdminUsers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      const res = await api.get(`/api/admin/users?${params}`)
      return res.data.data
    },
  })

  const validateForm = (data: UserForm): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!data.first_name.trim()) errors.first_name = 'First name is required'
    if (!data.last_name.trim()) errors.last_name = 'Last name is required'
    if (!data.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email address'
    if (!editingId) {
      if (!data.password) errors.password = 'Password is required'
      else if (data.password.length < 8) errors.password = 'Password must be at least 8 characters'
    } else if (data.password && data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (data.password && data.password !== data.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match'
    }
    return errors
  }

  const saveMutation = useMutation({
    mutationFn: async (data: UserForm) => {
      if (editingId) {
        // Strip empty password fields so backend 'sometimes' rule skips them
        const payload: Record<string, any> = { ...data }
        if (!payload.password) {
          delete payload.password
          delete payload.password_confirmation
        }
        return api.put(`/api/admin/users/${editingId}`, payload)
      }
      return api.post('/api/admin/users', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(editingId ? 'User updated' : 'User created')
      closeModal()
    },
    onError: (err: any) => {
      const data = err?.response?.data
      if (data?.errors) {
        // Map server validation errors to inline field errors
        const mapped: Record<string, string> = {}
        for (const [field, messages] of Object.entries(data.errors)) {
          mapped[field] = (messages as string[])[0]
        }
        setFieldErrors(mapped)
        toast.error('Please fix the errors below')
      } else {
        toast.error(data?.message || 'Failed to save user')
      }
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (user: AdminUser) =>
      api.put(`/api/admin/users/${user.id}`, {
        status: user.status === 'active' ? 'inactive' : 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setFieldErrors({})
  }

  const openEdit = (user: AdminUser) => {
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.roles?.[0] || 'order-manager',
      status: user.status,
    })
    setEditingId(user.id)
    setShowModal(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const users = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">User Management</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm">Manage admin users and roles</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-dark-900 dark:bg-dark-700 text-white rounded-lg hover:bg-dark-800 dark:hover:bg-dark-600 transition-colors">
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-dark-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-dark-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Last Login</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                            {user.first_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-dark-900 dark:text-white">
                          {user.full_name || `${user.first_name} ${user.last_name}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ShieldCheckIcon className="w-4 h-4 text-dark-400" />
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge(user.roles?.[0] || '')}`}>
                          {roleLabels[user.roles?.[0] || ''] || user.roles?.[0] || 'No role'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatusMutation.mutate(user)}
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 whitespace-nowrap">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 dark:border-dark-700">
            <p className="text-sm text-dark-500">
              Page {meta.current_page} of {meta.last_page} ({meta.total} users)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-800 rounded-xl w-full max-w-lg my-8 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
                {editingId ? 'Edit User' : 'Add User'}
              </h2>
              <button onClick={closeModal} className="text-dark-400 hover:text-dark-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const errors = validateForm(form)
                setFieldErrors(errors)
                if (Object.keys(errors).length > 0) return
                saveMutation.mutate(form)
              }}
              className="p-6 space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={e => { setForm({ ...form, first_name: e.target.value }); setFieldErrors(prev => { const { first_name, ...rest } = prev; return rest }) }}
                    placeholder="e.g. Ahmed"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${fieldErrors.first_name ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-600'}`}
                  />
                  {fieldErrors.first_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={e => { setForm({ ...form, last_name: e.target.value }); setFieldErrors(prev => { const { last_name, ...rest } = prev; return rest }) }}
                    placeholder="e.g. Khan"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${fieldErrors.last_name ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-600'}`}
                  />
                  {fieldErrors.last_name && <p className="text-xs text-red-500 mt-1">{fieldErrors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setFieldErrors(prev => { const { email, ...rest } = prev; return rest }) }}
                  placeholder="e.g. user@fischer.com.pk"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${fieldErrors.email ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-600'}`}
                />
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Password {editingId ? '(leave empty to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value, password_confirmation: '' }); setFieldErrors(prev => { const { password, password_confirmation, ...rest } = prev; return rest }) }}
                  placeholder={editingId ? 'Leave empty to keep current password' : 'Minimum 8 characters'}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${fieldErrors.password ? 'border-red-400 dark:border-red-500' : 'border-dark-200 dark:border-dark-600'}`}
                />
                {fieldErrors.password ? (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                ) : form.password ? (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {form.password.length >= 8 ? (
                      <><CheckCircleIcon className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-green-600 dark:text-green-400">Password length is good</span></>
                    ) : (
                      <><ExclamationCircleIcon className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs text-amber-600 dark:text-amber-400">{8 - form.password.length} more character{8 - form.password.length !== 1 ? 's' : ''} needed</span></>
                    )}
                  </div>
                ) : (
                  !editingId && <p className="text-xs text-dark-400 mt-1">Must be at least 8 characters</p>
                )}
              </div>

              {form.password && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={form.password_confirmation}
                    onChange={e => { setForm({ ...form, password_confirmation: e.target.value }); setFieldErrors(prev => { const { password_confirmation, ...rest } = prev; return rest }) }}
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                      fieldErrors.password_confirmation ? 'border-red-400 dark:border-red-500'
                        : form.password_confirmation && form.password === form.password_confirmation ? 'border-green-400 dark:border-green-500'
                        : form.password_confirmation && form.password !== form.password_confirmation ? 'border-red-400 dark:border-red-500'
                        : 'border-dark-200 dark:border-dark-600'
                    }`}
                  />
                  {fieldErrors.password_confirmation ? (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password_confirmation}</p>
                  ) : form.password_confirmation ? (
                    form.password === form.password_confirmation ? (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-xs text-red-500">Passwords do not match</span>
                      </div>
                    )
                  ) : null}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="order-manager">Order Manager</option>
                  <option value="content-manager">Content Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-dark-400 mt-1">
                  {form.role === 'order-manager' && 'Can manage orders, customers, and service requests'}
                  {form.role === 'content-manager' && 'Can manage products, categories, bundles, pages, reviews, and sales'}
                  {form.role === 'admin' && 'Full access to all admin features except user management'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
