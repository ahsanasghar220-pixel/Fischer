import type { Stat, Feature, Testimonial } from './types'

// Fallback Statistics for the stats section
export const defaultStats: Stat[] = [
  { label: 'Years Experience', value: '35+', icon: 'StarIcon' },
  { label: 'Happy Customers', value: '500K+', icon: 'CheckCircleIcon' },
  { label: 'Dealers Nationwide', value: '500+', icon: 'CubeIcon' },
  { label: 'Products Sold', value: '1M+', icon: 'FireIcon' },
]

// Fallback Features for the USP section
export const defaultFeatures: Feature[] = [
  {
    title: 'Free Delivery in Lahore',
    description: 'Standard delivery charges apply for other cities',
    icon: 'TruckIcon',
    color: 'blue',
  },
  {
    title: '1 Year Warranty',
    description: 'Official warranty on all products with dedicated support',
    icon: 'ShieldCheckIcon',
    color: 'emerald',
  },
  {
    title: 'Flexible Payment',
    description: 'Multiple payment options including COD & Easy Installments',
    icon: 'CreditCardIcon',
    color: 'purple',
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer service and technical support',
    icon: 'PhoneIcon',
    color: 'orange',
  },
]

// Fallback Testimonials
export const defaultTestimonials: Testimonial[] = [
  {
    name: 'Ahmed Khan',
    role: 'Homeowner, Lahore',
    content: 'Fischer water cooler has been serving our office for 3 years without any issues. Excellent build quality and after-sales service.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Sara Malik',
    role: 'Restaurant Owner',
    content: 'We installed Fischer cooking ranges in our restaurant. The performance is outstanding and very fuel efficient.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Usman Ali',
    role: 'Dealer, Karachi',
    content: 'Being a Fischer dealer for 10 years, I can vouch for their product quality and excellent dealer support program.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
]

// Default category videos mapping (fallback)
// Videos are in frontend/public/videos/categories/ and copied during build
export const defaultCategoryVideos: Record<string, string> = {
  // Kitchen Hoods variations
  'kitchen-hoods': '/videos/categories/built-in-hoods.mp4?v=3',
  'built-in-hoods': '/videos/categories/built-in-hoods.mp4?v=3',
  'hoods': '/videos/categories/built-in-hoods.mp4?v=3',

  // Kitchen Hobs variations
  'kitchen-hobs': '/videos/categories/built-in-hobs.mp4?v=3',
  'built-in-hobs': '/videos/categories/built-in-hobs.mp4?v=3',
  'hobs': '/videos/categories/built-in-hobs.mp4?v=3',

  // Oven Toasters variations
  'oven-toasters': '/videos/categories/oven-toasters.mp4?v=3',
  'oven-toaster': '/videos/categories/oven-toasters.mp4?v=3',
  'toaster-ovens': '/videos/categories/oven-toasters.mp4?v=3',
  'toasters': '/videos/categories/oven-toasters.mp4?v=3',

  // Air Fryers variations
  'air-fryers': '/videos/categories/air-fryers.mp4?v=3',
  'air-fryer': '/videos/categories/air-fryers.mp4?v=3',
  'fryers': '/videos/categories/air-fryers.mp4?v=3',

  // Water Coolers
  'water-coolers': '/videos/categories/water-coolers.mp4',
  'water-cooler': '/videos/categories/water-coolers.mp4',
  'coolers': '/videos/categories/water-coolers.mp4',
}
