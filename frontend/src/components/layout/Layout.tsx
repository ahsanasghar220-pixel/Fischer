import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton'
import PageTransition from '@/components/ui/PageTransition'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

export default function Layout() {
  const fetchCart = useCartStore((state) => state.fetchCart)
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    fetchCart()
    if (isAuthenticated) {
      fetchUser()
    }
  }, [fetchCart, fetchUser, isAuthenticated])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Spacer for fixed header - only on non-homepage (homepage hero is full viewport) */}
      {!isHomePage && <div className="h-16 lg:h-20 flex-shrink-0" />}
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}
