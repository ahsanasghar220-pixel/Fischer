import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/types'
import ProductCardActions from './ProductCardActions'

interface ProductCardImageProps {
  product: Product
  allImages: string[]
  currentImageIndex: number
  imageLoaded: boolean
  imageError: boolean
  isHovered: boolean
  isInWishlist: boolean
  isAddingToCart: boolean
  isTouchDevice: boolean
  discountPercentage: number | null
  showNew: boolean
  swipeHandlers: Record<string, unknown>
  onImageLoad: () => void
  onImageError: () => void
  onToggleWishlist: (e: React.MouseEvent) => void
  onAddToCart: (e: React.MouseEvent) => void
  onQuickView: (e: React.MouseEvent) => void
}

export default function ProductCardImage({
  product,
  allImages,
  currentImageIndex,
  imageLoaded,
  imageError,
  isHovered,
  isInWishlist,
  isAddingToCart,
  isTouchDevice,
  discountPercentage,
  showNew,
  swipeHandlers,
  onImageLoad,
  onImageError,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}: ProductCardImageProps) {
  const hasMultipleImages = allImages.length > 1

  return (
    <div className="product-image" {...(isTouchDevice ? swipeHandlers : {})}>
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      {allImages.length > 0 && !imageError ? (
        <>
          {/* Enhanced image animation with fade + slide */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={allImages[currentImageIndex]}
              src={allImages[currentImageIndex]}
              alt={currentImageIndex === 0 ? product.name : `${product.name} - view ${currentImageIndex + 1}`}
              width={300}
              height={300}
              className="absolute inset-0 w-full h-full object-contain p-2"
              loading="lazy"
              decoding="async"
              onLoad={currentImageIndex === 0 ? onImageLoad : undefined}
              onError={currentImageIndex === 0 ? onImageError : undefined}
              initial={{
                opacity: 0,
                x: 20,
                scale: 1
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: isHovered ? 1.05 : 1
              }}
              exit={{
                opacity: 0,
                x: -20,
                scale: 1
              }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
            />
          </AnimatePresence>

          {/* Enhanced dot indicators with animation - always visible on touch */}
          {hasMultipleImages && (isHovered || isTouchDevice) && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {allImages.map((_, index) => (
                <motion.span
                  key={index}
                  className={`rounded-full transition-all duration-300
                            ${currentImageIndex === index
                              ? 'bg-white'
                              : 'bg-white/50 hover:bg-white/70'}`}
                  animate={{
                    width: currentImageIndex === index ? 12 : 6,
                    height: currentImageIndex === index ? 6 : 6,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-dark-50 dark:bg-dark-800 flex items-center justify-center">
          <span className="text-sm font-medium text-dark-400 dark:text-dark-500 text-center px-4">{product.name}</span>
        </div>
      )}

      {/* Gradient overlay on hover */}
      <div className="product-overlay" />

      {/* Badges - CSS transitions */}
      <div className="product-badge flex flex-col gap-2">
        {discountPercentage && (
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg
                       bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg
                       transition-transform duration-300 ease-out
                       ${isHovered ? 'scale-110' : 'scale-100'}`}
          >
            -{discountPercentage}%
          </span>
        )}
        {(product.is_new || showNew) && (
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg
                       bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg
                       transition-transform duration-300 ease-out
                       ${isHovered ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}
          >
            NEW
          </span>
        )}
        {product.is_bestseller && (
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg
                       bg-primary-700 dark:bg-primary-600 text-white shadow-lg
                       transition-transform duration-300 ease-out
                       ${isHovered ? 'scale-105' : 'scale-100'}`}
          >
            BEST
          </span>
        )}
      </div>

      {/* Out of Stock Overlay */}
      {product.stock_status === 'out_of_stock' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/75 dark:bg-dark-900/75 backdrop-blur-sm flex items-center justify-center z-20"
        >
          <div className="text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-6 py-3 bg-dark-900 dark:bg-dark-700 rounded-xl shadow-lg"
            >
              <span className="text-base font-bold text-white uppercase tracking-wide">
                Out of Stock
              </span>
            </motion.div>
            <p className="mt-2 text-xs text-dark-700 dark:text-white/90 font-medium">
              Currently unavailable
            </p>
          </div>
        </motion.div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={onToggleWishlist}
        className="product-wishlist transition-transform duration-200 hover:scale-110"
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isInWishlist ? (
          <HeartSolidIcon className="w-5 h-5 text-primary-500" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
      </button>

      {/* Quick Actions on Hover (always visible on touch via CSS) */}
      <ProductCardActions
        product={product}
        isAddingToCart={isAddingToCart}
        isTouchDevice={isTouchDevice}
        onAddToCart={onAddToCart}
        onQuickView={onQuickView}
      />
    </div>
  )
}
