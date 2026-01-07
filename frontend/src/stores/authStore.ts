import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string | null
  avatar: string | null
  email_verified: boolean
  loyalty_points: number
  referral_code: string
  roles: string[]
  is_admin: boolean
  is_dealer: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  referral_code?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const sessionId = localStorage.getItem('session_id')
          const response = await api.post('/auth/login', {
            email,
            password,
            session_id: sessionId,
          })
          const { user, token } = response.data.data
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          const sessionId = localStorage.getItem('session_id')
          const response = await api.post('/auth/register', {
            ...data,
            session_id: sessionId,
          })
          const { user, token } = response.data.data
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          if (get().token) {
            await api.post('/auth/logout')
          }
        } catch {
          // Ignore errors during logout
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },

      fetchUser: async () => {
        if (!get().token) return
        try {
          const response = await api.get('/auth/user')
          set({ user: response.data.data.user })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const response = await api.put('/auth/profile', data)
        set({ user: response.data.data.user })
      },
    }),
    {
      name: 'fischer-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
