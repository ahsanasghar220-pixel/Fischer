import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Link } from 'react-router-dom'
import ConfettiEffect from './ConfettiEffect'
import OrderSummaryCard, { type Order } from './OrderSummaryCard'

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [showConfetti, setShowConfetti] = useState(true)

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      // Use public endpoint that works for guest checkout
      const response = await api.get(`/api/orders/${orderNumber}/view`)
      return response.data.data
    },
  })

  // Stop confetti after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Order from Fischer Pakistan',
          text: `I just placed an order at Fischer Pakistan! Order #${order?.order_number}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 via-white to-dark-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 transition-colors">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 via-white to-dark-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 transition-colors">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Order not found</h1>
          <p className="text-dark-500 dark:text-dark-400 mb-4">We couldn't find this order.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-dark-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-12 transition-colors overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <OrderSummaryCard order={order} onShare={handleShare} />
        </div>
      </div>
    </div>
  )
}
