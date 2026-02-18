export interface Section {
  id: number
  key: string
  title: string
  subtitle: string | null
  is_enabled: boolean
  sort_order: number
  settings: Record<string, any>
}

export interface Stat {
  id?: number
  label: string
  value: string
  icon: string
  sort_order: number
  is_visible: boolean
}

export interface Feature {
  id?: number
  title: string
  description: string
  icon: string
  color: string
  sort_order: number
  is_visible: boolean
}

export interface Testimonial {
  id?: number
  name: string
  role: string
  content: string
  image: string
  rating: number
  sort_order: number
  is_visible: boolean
}

export interface Banner {
  id?: number
  title: string
  subtitle: string
  image: string
  mobile_image?: string
  button_text: string
  button_link: string
  position: string
  sort_order: number
  is_active: boolean
}

export interface TrustBadge {
  id?: number
  title: string
  image?: string
  sort_order: number
  is_visible: boolean
}

export interface NotableClient {
  id?: number
  name: string
  logo?: string
  website?: string
  sort_order: number
  is_visible: boolean
}

export interface HomepageCategory {
  id: number
  category_id: number
  sort_order: number
  is_visible: boolean
  category: {
    id: number
    name: string
    slug: string
    image?: string
  }
}

export interface Category {
  id: number
  name: string
  slug: string
  image?: string
  products_count: number
}

export interface HomepageProduct {
  id: number
  product_id: number
  section: string
  sort_order: number
  is_visible: boolean
  product: {
    id: number
    name: string
    slug: string
    price: number
    sku: string
    primary_image?: string
    images?: { id: number; image: string }[]
  }
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  sku: string
  primary_image?: string
  images?: { id: number; image: string }[]
}

export interface HomepageData {
  sections: Section[]
  stats: Stat[]
  features: Feature[]
  testimonials: Testimonial[]
  trust_badges: TrustBadge[]
  notable_clients: NotableClient[]
  homepage_categories: HomepageCategory[]
  homepage_products: HomepageProduct[]
  banners: Banner[]
  all_categories: Category[]
  all_products: Product[]
}

export interface SectionMeta {
  key: string
  label: string
  description: string
  editorDescription: string
  icon: string
}

export const SECTION_META: Record<string, SectionMeta> = {
  hero: {
    key: 'hero',
    label: 'Hero Video',
    description: 'Full-screen background video with overlay text at the top of the homepage',
    editorDescription: 'Configure the hero video that plays in the background when visitors first land on your homepage. The video plays muted and loops automatically.',
    icon: 'play',
  },
  brand_statement: {
    key: 'brand_statement',
    label: 'Brand Statement',
    description: 'A centered heading and tagline that appears right below the hero video',
    editorDescription: 'Set the main brand heading and subtitle that appears prominently after the hero section. Keep it short and impactful.',
    icon: 'quote',
  },
  hero_products: {
    key: 'hero_products',
    label: 'Hero Products',
    description: 'Showcase of up to 5 featured products with images and descriptions',
    editorDescription: 'Configure the product showcase section. Each product card shows an image gallery, name, category, and description with a link to explore more.',
    icon: 'star',
  },
  stats: {
    key: 'stats',
    label: 'Statistics',
    description: 'Four animated number counters showing company milestones',
    editorDescription: 'Manage the statistics counters that highlight your company achievements. Each stat shows a large number and a label below it.',
    icon: 'chart',
  },
  categories: {
    key: 'categories',
    label: 'Product Categories',
    description: 'Interactive category browser with video previews and product counts',
    editorDescription: 'Choose which product categories appear on the homepage and assign preview videos to each category.',
    icon: 'grid',
  },
  features: {
    key: 'features',
    label: 'Features / USPs',
    description: 'Feature cards highlighting your unique selling points like free shipping and warranty',
    editorDescription: 'Manage the feature cards that showcase your business benefits. Each card has an icon, title, description, and color theme.',
    icon: 'badge',
  },
  bestsellers: {
    key: 'bestsellers',
    label: 'Best Sellers',
    description: 'Horizontal scrolling product carousel showing your top-selling items',
    editorDescription: 'Configure which products appear in the Best Sellers section. You can manually select products or let the system auto-select based on sales.',
    icon: 'trending',
  },
  bundles: {
    key: 'bundles',
    label: 'Product Bundles',
    description: 'Promotional banner for bundle deals, linking to the bundles page',
    editorDescription: 'This section showcases your product bundles. Bundle products are managed from the dedicated Bundles page.',
    icon: 'gift',
  },
  banner_carousel: {
    key: 'banner_carousel',
    label: 'Banner Carousel',
    description: 'Full-width rotating banner images with call-to-action buttons',
    editorDescription: 'Manage the promotional banners that rotate in a carousel. Each banner can have a title, subtitle, image, and a call-to-action button.',
    icon: 'photo',
  },
  dealer_cta: {
    key: 'dealer_cta',
    label: 'Dealer CTA',
    description: 'Call-to-action section inviting dealers to partner with your business',
    editorDescription: 'Configure the dealer partnership call-to-action section with heading, benefits cards, and action buttons.',
    icon: 'handshake',
  },
  testimonials: {
    key: 'testimonials',
    label: 'Testimonials',
    description: 'Customer reviews displayed as cards with ratings and photos',
    editorDescription: 'Manage customer testimonials. Each testimonial includes a name, role, review text, photo, and star rating.',
    icon: 'chat',
  },
  about: {
    key: 'about',
    label: 'About Company',
    description: 'Company story section with image, text, and feature bullet points',
    editorDescription: 'Configure the about section that tells your company story. Includes an image, descriptive text, and feature bullet points.',
    icon: 'building',
  },
  notable_clients: {
    key: 'notable_clients',
    label: 'Notable Clients',
    description: 'Scrolling strip of client logos building trust and credibility',
    editorDescription: 'Manage the client logos displayed in the trust section. Upload transparent PNG logos for each client.',
    icon: 'users',
  },
}

export const iconOptions = [
  { value: 'star', label: 'Star' },
  { value: 'users', label: 'Users' },
  { value: 'cube', label: 'Cube' },
  { value: 'fire', label: 'Fire' },
  { value: 'truck', label: 'Truck' },
  { value: 'shield', label: 'Shield' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'phone', label: 'Phone' },
  { value: 'clock', label: 'Clock' },
  { value: 'check-circle', label: 'Check Circle' },
  { value: 'gift', label: 'Gift' },
  { value: 'heart', label: 'Heart' },
]

export const colorOptions = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'pink', label: 'Pink' },
  { value: 'cyan', label: 'Cyan' },
]
