import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, useRef } from 'react'
import { TruckIcon, PrinterIcon, ShareIcon, SparklesIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Order {
  id: number
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  created_at: string
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  items: {
    id: number
    product: {
      name: string
      primary_image?: string
    }
    variant?: {
      name: string
    }
    quantity: number
    price: number
  }[]
}

// Confetti particle component
function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#f4b42c', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316']
    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
      rotation: number
      rotationSpeed: number
      type: 'rect' | 'circle'
    }[] = []

    // Create initial particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        type: Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let activeParticles = 0

      particles.forEach((p) => {
        if (p.y < canvas.height + 50) {
          activeParticles++
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.05 // gravity
          p.rotation += p.rotationSpeed

          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color

          if (p.type === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2)
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.restore()
        }
      })

      if (activeParticles > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 0.9 }}
    />
  )
}

// Animated check mark
function AnimatedCheckmark() {
  return (
    <div className="relative w-28 h-28 mx-auto mb-8">
      {/* Outer glow rings */}
      <div className="absolute inset-0 animate-ping rounded-full bg-green-400/20" style={{ animationDuration: '2s' }} />
      <div className="absolute inset-2 animate-ping rounded-full bg-green-400/30" style={{ animationDuration: '2s', animationDelay: '0.2s' }} />

      {/* Main circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30 animate-scale-in">
        <svg className="w-full h-full p-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-check"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 24,
              animation: 'draw-check 0.6s ease-out 0.3s forwards',
            }}
          />
        </svg>
      </div>

      {/* Sparkles */}
      <SparklesIcon className="absolute -top-2 -right-2 w-8 h-8 text-primary-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
      <SparklesIcon className="absolute -bottom-1 -left-2 w-6 h-6 text-primary-400 animate-bounce" style={{ animationDelay: '0.7s' }} />
    </div>
  )
}

// Staggered text animation
function AnimatedText({ children, delay = 0 }: { children: string; delay?: number }) {
  const words = children.split(' ')

  return (
    <span className="inline-block">
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block animate-fade-in-up opacity-0"
          style={{ animationDelay: `${delay + index * 0.1}s`, animationFillMode: 'forwards' }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  )
}

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [showConfetti, setShowConfetti] = useState(true)

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderNumber}`)
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
      {showConfetti && <Confetti />}

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 text-center mb-8 border border-white/20 dark:border-dark-700/50">
            {/* Animated Checkmark */}
            <AnimatedCheckmark />

            {/* Animated Title */}
            <h1 className="text-3xl md:text-4xl font-black text-dark-900 dark:text-white mb-4">
              <AnimatedText delay={0.4}>Thank You for Your Order!</AnimatedText>
            </h1>

            <p className="text-lg text-dark-500 dark:text-dark-400 mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              Your order has been placed successfully. We'll send you an email confirmation shortly.
            </p>

            {/* Order Number Badge */}
            <div
              className="inline-block bg-gradient-to-r from-dark-100 to-dark-50 dark:from-dark-700 dark:to-dark-800 rounded-2xl px-8 py-4 animate-scale-in opacity-0 border border-dark-200/50 dark:border-dark-600/50"
              style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
            >
              <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Order Number</p>
              <p className="text-3xl font-black bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
                {order.order_number}
              </p>
            </div>

            {/* Share Button */}
            {'share' in navigator && (
              <button
                onClick={handleShare}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm text-dark-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors animate-fade-in-up opacity-0"
                style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}
              >
                <ShareIcon className="w-4 h-4" />
                Share your order
              </button>
            )}
          </div>

          {/* Order Details */}
          <div
            className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/20 dark:border-dark-700/50 animate-fade-in-up opacity-0"
            style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
          >
            <div className="p-5 bg-dark-50/50 dark:bg-dark-700/50 border-b border-dark-200/50 dark:border-dark-600/50 flex items-center justify-between">
              <h2 className="font-bold text-dark-900 dark:text-white text-lg">Order Details</h2>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-600 rounded-xl transition-colors"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
            </div>

            {/* Items */}
            <div className="p-5 divide-y divide-dark-200/50 dark:divide-dark-700/50">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${0.8 + index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className="w-20 h-20 bg-dark-100 dark:bg-dark-700 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.primary_image ? (
                      <img
                        src={item.product.primary_image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-400 dark:text-dark-500 text-2xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark-900 dark:text-white truncate">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-sm text-dark-500 dark:text-dark-400">{item.variant.name}</p>
                    )}
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-dark-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-5 bg-dark-50/50 dark:bg-dark-700/50 border-t border-dark-200/50 dark:border-dark-600/50">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-500 dark:text-dark-400">Subtotal</span>
                  <span className="text-dark-900 dark:text-white">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-dark-500 dark:text-dark-400">Shipping</span>
                  <span className="text-dark-900 dark:text-white">
                    {order.shipping_cost === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                    ) : formatPrice(order.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-dark-200/50 dark:border-dark-600/50">
                  <span className="font-bold text-dark-900 dark:text-white">Total</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div
            className="grid md:grid-cols-2 gap-6 mb-8 animate-fade-in-up opacity-0"
            style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
          >
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-dark-700/50">
              <h3 className="font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Shipping Address
              </h3>
              <p className="text-dark-900 dark:text-white font-semibold">{order.shipping_name}</p>
              <p className="text-dark-600 dark:text-dark-400">{order.shipping_phone}</p>
              <p className="text-dark-600 dark:text-dark-400 mt-2">{order.shipping_address}</p>
              <p className="text-dark-600 dark:text-dark-400">{order.shipping_city}</p>
            </div>
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 dark:border-dark-700/50">
              <h3 className="font-bold text-dark-900 dark:text-white mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-500 dark:text-dark-400">Method</span>
                  <span className="text-dark-900 dark:text-white font-medium capitalize">{order.payment_method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500 dark:text-dark-400">Status</span>
                  <span className={`font-semibold capitalize px-2 py-0.5 rounded-lg ${
                    order.payment_status === 'paid'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500 dark:text-dark-400">Order Date</span>
                  <span className="text-dark-900 dark:text-white">{formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div
            className="bg-gradient-to-r from-primary-500/10 via-amber-500/10 to-primary-500/10 dark:from-primary-900/30 dark:via-amber-900/30 dark:to-primary-900/30 rounded-2xl p-6 mb-8 border border-primary-500/20 dark:border-primary-500/30 animate-fade-in-up opacity-0"
            style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}
          >
            <h3 className="font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              What's Next?
            </h3>
            <div className="space-y-3">
              {[
                'You will receive an order confirmation email shortly.',
                'Once your order is shipped, we\'ll send you tracking details.',
                'For COD orders, please have exact change ready at delivery.',
              ].map((text, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500 text-dark-900 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-dark-600 dark:text-dark-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0"
            style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}
          >
            <Link
              to="/account/orders"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-400 hover:to-amber-400 text-dark-900 font-bold rounded-2xl text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30"
            >
              Track Order
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-dark-700 hover:bg-dark-50 dark:hover:bg-dark-600 text-dark-900 dark:text-white font-bold rounded-2xl text-center border border-dark-200 dark:border-dark-600 transition-all hover:scale-105"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
