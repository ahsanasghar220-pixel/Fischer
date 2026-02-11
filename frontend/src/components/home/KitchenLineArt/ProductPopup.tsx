import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'

// CSS animations for smooth, GPU-accelerated effects
const popupAnimationStyles = `
@keyframes popup-enter {
  0% { opacity: 0; transform: scale(0.9) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes popup-exit {
  0% { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(0.95) translateY(10px); }
}
@keyframes backdrop-enter {
  0% { opacity: 0; backdrop-filter: blur(0px); }
  100% { opacity: 1; backdrop-filter: blur(4px); }
}
@keyframes float-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes shimmer-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 20px rgba(114,47,55,0.15); }
  50% { box-shadow: 0 20px 50px rgba(0,0,0,0.25), 0 0 30px rgba(114,47,55,0.25); }
}
@keyframes fade-slide-up {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
`

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number
  primary_image?: string
  category?: { name: string; slug: string }
  short_description?: string
}

interface ProductPopupProps {
  product: Product | null
  productName: string
  categorySlug: string
  position: { x: number; y: number }
  onClose: () => void
}

export default function ProductPopup({
  product,
  productName,
  categorySlug,
  position,
  onClose
}: ProductPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHoveringButton, setIsHoveringButton] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    // Small delay for smoother entrance
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Calculate popup position (keep within viewport)
  const popupStyle = {
    left: Math.min(Math.max(position.x - 140, 20), window.innerWidth - 320),
    top: position.y - 10,
  }

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Format price
  const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`

  // Calculate discount
  const discountPercent = product?.compare_price && product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  return (
    <>
      {/* Inject CSS animations */}
      <style>{popupAnimationStyles}</style>

      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 z-40 cursor-pointer"
        onClick={handleBackdropClick}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(114,47,55,0.08) 0%, rgba(0,0,0,0.3) 100%)',
          animation: 'backdrop-enter 0.3s ease-out forwards',
        }}
      />

      {/* Popup container */}
      <div
        className="absolute z-50"
        style={{
          ...popupStyle,
          animation: isVisible ? 'popup-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
        }}
      >
        {/* Floating animation wrapper */}
        <div
          style={{
            animation: 'float-subtle 3s ease-in-out infinite',
          }}
        >
          {/* Arrow pointing to hotspot */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-dark-800 rotate-45 border-r border-b border-gray-200 dark:border-dark-700"
          />

          {/* Main popup card */}
          <div
            className="w-72 bg-white dark:bg-dark-800 rounded-xl overflow-hidden relative"
            style={{
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-gray-100 dark:bg-dark-700
                        hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-200
                        hover:scale-110 active:scale-95"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-dark-400" />
            </button>

            {product ? (
              <>
                {/* Product Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-800 relative overflow-hidden">
                  {/* Shimmer overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{
                        animation: 'shimmer-sweep 3s ease-in-out infinite',
                      }}
                    />
                  </div>

                  {product.primary_image ? (
                    <img
                      src={product.primary_image}
                      alt={product.name}
                      className={`w-full h-full object-contain p-4 transition-all duration-500
                                ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                                hover:scale-105`}
                      style={{
                        filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
                      }}
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-500">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}

                  {/* Discount badge */}
                  {discountPercent && (
                    <div
                      className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded
                                transition-transform duration-300 hover:scale-105"
                      style={{
                        animation: 'fade-slide-up 0.4s ease-out 0.2s both',
                      }}
                    >
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 bg-white dark:bg-dark-800 relative z-10">
                  {/* Category */}
                  <p
                    className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wide mb-1"
                    style={{
                      animation: 'fade-slide-up 0.3s ease-out 0.15s both',
                    }}
                  >
                    {product.category?.name || productName}
                  </p>

                  {/* Product name */}
                  <h3
                    className="font-semibold text-dark-900 dark:text-white text-lg leading-tight mb-2"
                    style={{
                      animation: 'fade-slide-up 0.3s ease-out 0.2s both',
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Key specs */}
                  <div
                    className="space-y-1 mb-3"
                    style={{
                      animation: 'fade-slide-up 0.3s ease-out 0.25s both',
                    }}
                  >
                    {['Premium Quality', '1 Year Warranty'].map((spec, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400"
                      >
                        <span className="text-green-500">✓</span>
                        {spec}
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div
                    className="flex items-baseline gap-2 mb-4"
                    style={{
                      animation: 'fade-slide-up 0.3s ease-out 0.3s both',
                    }}
                  >
                    <span className="text-xl font-bold text-dark-900 dark:text-white">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-sm text-dark-400 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>

                  {/* View Details button */}
                  <div
                    style={{
                      animation: 'fade-slide-up 0.3s ease-out 0.35s both',
                    }}
                  >
                    <Link to={`/product/${product.slug}`}>
                      <div
                        className={`flex items-center justify-center gap-2 w-full py-2.5 bg-primary-500 text-dark-900
                                  font-medium rounded-lg overflow-hidden relative
                                  transition-all duration-300 ease-out
                                  ${isHoveringButton ? 'scale-[1.03] shadow-lg shadow-primary-500/30' : 'scale-100'}`}
                        onMouseEnter={() => setIsHoveringButton(true)}
                        onMouseLeave={() => setIsHoveringButton(false)}
                      >
                        {/* Shimmer effect on hover */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                                    transition-transform duration-500 ease-out
                                    ${isHoveringButton ? 'translate-x-full' : '-translate-x-full'}`}
                        />
                        <span className="relative z-10">View Details</span>
                        <ArrowRightIcon
                          className={`w-4 h-4 relative z-10 transition-transform duration-300
                                    ${isHoveringButton ? 'translate-x-1' : 'translate-x-0'}`}
                        />
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* No product available - show category link */
              <div className="p-6 text-center bg-white dark:bg-dark-800 relative z-10">
                <div
                  className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center"
                  style={{
                    animation: 'fade-slide-up 0.3s ease-out 0.1s both',
                  }}
                >
                  <span className="text-3xl">🔍</span>
                </div>

                <h3
                  className="font-semibold text-dark-900 dark:text-white text-lg mb-2"
                  style={{
                    animation: 'fade-slide-up 0.3s ease-out 0.15s both',
                  }}
                >
                  {productName}
                </h3>

                <p
                  className="text-sm text-dark-500 dark:text-dark-400 mb-4"
                  style={{
                    animation: 'fade-slide-up 0.3s ease-out 0.2s both',
                  }}
                >
                  Explore our range of premium {productName.toLowerCase()} products
                </p>

                <div
                  style={{
                    animation: 'fade-slide-up 0.3s ease-out 0.25s both',
                  }}
                >
                  <Link to={`/category/${categorySlug}`}>
                    <div
                      className={`flex items-center justify-center gap-2 w-full py-2.5 bg-dark-900 dark:bg-white
                                text-white dark:text-dark-900 font-medium rounded-lg overflow-hidden relative
                                transition-all duration-300 ease-out
                                ${isHoveringButton ? 'scale-[1.03] shadow-lg' : 'scale-100'}`}
                      onMouseEnter={() => setIsHoveringButton(true)}
                      onMouseLeave={() => setIsHoveringButton(false)}
                    >
                      <span className="relative z-10">Browse Category</span>
                      <ArrowRightIcon
                        className={`w-4 h-4 relative z-10 transition-transform duration-300
                                  ${isHoveringButton ? 'translate-x-1' : 'translate-x-0'}`}
                      />
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
