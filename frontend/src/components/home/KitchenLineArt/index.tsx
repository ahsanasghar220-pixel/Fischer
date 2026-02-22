import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion'
import api from '@/lib/api'
import KitchenSVG from './KitchenSVG'
import ProductPopup from './ProductPopup'
import type { Product, KitchenProduct } from '@/types'

// Mobile detection hook for performance optimization
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return isMobile
}

const kitchenProducts: Omit<KitchenProduct, 'product'>[] = [
  { id: 'hood', name: 'Kitchen Hood', categorySlug: 'kitchen-hoods' },
  { id: 'hob', name: 'Built-in Hob', categorySlug: 'hobs' },
  { id: 'cooler', name: 'Water Cooler', categorySlug: 'water-coolers' },
  { id: 'geyser', name: 'Geyser', categorySlug: 'geysers' },
  { id: 'airfryer', name: 'Air Fryer', categorySlug: 'air-fryers' },
  { id: 'oven', name: 'Oven Toaster', categorySlug: 'oven-toasters' },
]

export default function KitchenLineArt() {
  const [activeProduct, setActiveProduct] = useState<KitchenProduct | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Mouse tracking for parallax - DISABLED on mobile for performance
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mouseXSpring = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const mouseYSpring = useSpring(mouseY, { stiffness: 100, damping: 20 })

  // Scroll progress for scroll-triggered animations - DISABLED on mobile
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  // Parallax transforms - only used on desktop
  const blob1X = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [-100, 100])
  const blob1Y = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, -150])
  const blob2X = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [100, -100])
  const blob2Y = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, 150])

  // Mouse follower glow position - desktop only
  const glowX = useTransform(mouseXSpring, (x) => x - 200)
  const glowY = useTransform(mouseYSpring, (y) => y - 200)

  // Handle mouse move - DISABLED on mobile
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  // Fetch featured products for each category
  const { data: products } = useQuery({
    queryKey: ['kitchen-featured-products'],
    queryFn: async () => {
      // Fetch featured/bestseller products and match by category
      const response = await api.get('/api/products/featured', {
        params: { limit: 20 }
      })
      return response.data.data as Product[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Match products to kitchen positions
  const getProductForCategory = (categorySlug: string): Product | null => {
    if (!products) return null
    return products.find(p =>
      p.category?.slug === categorySlug ||
      p.category?.slug?.includes(categorySlug.replace('s', '')) ||
      categorySlug.includes(p.category?.slug || '')
    ) || null
  }

  const handleProductClick = (productId: string, event: React.MouseEvent) => {
    const kitchenProduct = kitchenProducts.find(p => p.id === productId)
    if (!kitchenProduct) return

    const product = getProductForCategory(kitchenProduct.categorySlug)

    // Get click position for popup placement
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const containerRect = (event.currentTarget as HTMLElement).closest('.kitchen-container')?.getBoundingClientRect()

    if (containerRect) {
      setPopupPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
      })
    }

    setActiveProduct({
      ...kitchenProduct,
      product,
    })
  }

  const handleClosePopup = () => {
    setActiveProduct(null)
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-24 bg-gray-100 dark:bg-dark-900 overflow-hidden"
      onMouseMove={isMobile ? undefined : handleMouseMove}
    >
      {/* Animated morphing background blobs - DESKTOP ONLY */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{
              x: blob1X,
              y: blob1Y,
              background: 'radial-gradient(circle, rgba(149,18,18,0.4) 0%, transparent 70%)',
              top: '10%',
              left: '10%'
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
            style={{
              x: blob2X,
              y: blob2Y,
              background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
              bottom: '10%',
              right: '10%'
            }}
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 5
            }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%'
            }}
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Mouse follower subtle glow - DESKTOP ONLY */}
          <motion.div
            className="absolute w-96 h-96 rounded-full pointer-events-none"
            style={{
              x: glowX,
              y: glowY,
              background: 'radial-gradient(circle, rgba(149,18,18,0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
              mixBlendMode: 'overlay'
            }}
          />

          {/* Animated background gradient - DESKTOP ONLY */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(149,18,18,0.05) 0%, transparent 60%)'
            }}
            animate={{
              background: [
                'radial-gradient(ellipse at 20% 30%, rgba(149,18,18,0.05) 0%, transparent 60%)',
                'radial-gradient(ellipse at 80% 70%, rgba(59,130,246,0.05) 0%, transparent 60%)',
                'radial-gradient(ellipse at 20% 30%, rgba(149,18,18,0.05) 0%, transparent 60%)',
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </>
      )}

      {/* Static background for mobile */}
      {isMobile && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(149,18,18,0.05) 0%, transparent 60%)'
          }}
        />
      )}

      {/* Background Pattern - static on mobile */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating ambient particles - REDUCED on mobile (4 vs 15) */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 2 === 0 ? 'rgba(149,18,18,0.2)' : 'rgba(59,130,246,0.2)',
                boxShadow: '0 0 10px currentColor'
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                delay: Math.random() * 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      <div ref={containerRef} className="container mx-auto px-4 relative">
        {/* Header - simplified animations on mobile */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
            Explore Our Products
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white mb-4">
            {/* Desktop: Letter-by-letter animation, Mobile: Simple fade */}
            {isMobile ? (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Your Kitchen, Elevated
              </motion.span>
            ) : (
              ['Your', 'Kitchen,', 'Elevated'].map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-3">
                  {word.split('').map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      className="inline-block"
                      initial={{ opacity: 0, y: 50, rotateX: -90, scale: 0.5 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + (wordIndex * 0.15) + (letterIndex * 0.03),
                        type: 'spring',
                        stiffness: 200,
                        damping: 12
                      }}
                      whileHover={{
                        y: -5,
                        color: '#951212',
                        transition: { duration: 0.2 }
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))
            )}
          </h2>

          <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
            {isMobile ? 'Tap on any product to explore' : 'Click on any product in our kitchen to discover premium Fischer appliances'}
          </p>
        </motion.div>

        {/* Kitchen Illustration Container with enhanced effects */}
        <motion.div
          className="kitchen-container relative max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            type: 'spring',
            stiffness: 100,
            damping: 15
          }}
        >
          {/* Glow effect behind kitchen */}
          <motion.div
            className="absolute inset-0 -z-10 rounded-3xl"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(149,18,18,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <KitchenSVG
            onProductClick={handleProductClick}
            activeProductId={activeProduct?.id || null}
          />

          {/* Product Popup */}
          <AnimatePresence mode="wait">
            {activeProduct && (
              <ProductPopup
                product={activeProduct.product}
                productName={activeProduct.name}
                categorySlug={activeProduct.categorySlug}
                position={popupPosition}
                onClose={handleClosePopup}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Hint Text */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <motion.p className="inline-flex items-center gap-2 text-dark-400 dark:text-dark-500 text-sm">
            <motion.span
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  '0 0 0 0 rgba(149,18,18,0.4)',
                  '0 0 0 8px rgba(149,18,18,0)',
                  '0 0 0 0 rgba(149,18,18,0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.span
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Click on the highlighted products to explore
            </motion.span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
