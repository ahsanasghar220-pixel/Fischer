import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

export default function Layout() {
  const fetchCart = useCartStore((state) => state.fetchCart)
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    fetchCart()
    if (isAuthenticated) {
      fetchUser()
    }
  }, [fetchCart, fetchUser, isAuthenticated])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
