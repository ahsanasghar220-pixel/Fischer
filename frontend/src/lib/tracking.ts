/**
 * Fischer Marketing Tracking Utility
 * Fires events to all enabled pixel/analytics platforms
 */

interface ProductData {
  id: string | number
  name: string
  price: number
  category?: string
  brand?: string
  quantity?: number
}

interface PurchaseData {
  orderId: string | number
  total: number
  currency?: string
  items: ProductData[]
}

// Declare pixel globals
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    ttq?: { track: (...args: unknown[]) => void }
    snaptr?: (...args: unknown[]) => void
    pintrk?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function safeCall(fn: () => void): void {
  try { fn() } catch (e) { /* silently ignore tracking errors */ }
}

export function trackPageView(): void {
  safeCall(() => window.fbq?.('track', 'PageView'))
  safeCall(() => window.gtag?.('event', 'page_view'))
  safeCall(() => window.ttq?.track('ViewContent'))
}

export function trackViewContent(product: ProductData): void {
  safeCall(() => window.fbq?.('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'PKR',
  }))
  safeCall(() => window.gtag?.('event', 'view_item', {
    items: [{ item_id: product.id, item_name: product.name, price: product.price, item_category: product.category }],
  }))
  safeCall(() => window.ttq?.track('ViewContent', { content_id: product.id, content_name: product.name, value: product.price, currency: 'PKR' }))
}

export function trackAddToCart(product: ProductData): void {
  safeCall(() => window.fbq?.('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    value: product.price * (product.quantity ?? 1),
    currency: 'PKR',
  }))
  safeCall(() => window.gtag?.('event', 'add_to_cart', {
    items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: product.quantity ?? 1 }],
    value: product.price * (product.quantity ?? 1),
    currency: 'PKR',
  }))
  safeCall(() => window.ttq?.track('AddToCart', { content_id: product.id, value: product.price, currency: 'PKR' }))
}

export function trackInitiateCheckout(total: number, items: ProductData[]): void {
  safeCall(() => window.fbq?.('track', 'InitiateCheckout', {
    value: total,
    currency: 'PKR',
    num_items: items.length,
  }))
  safeCall(() => window.gtag?.('event', 'begin_checkout', {
    value: total,
    currency: 'PKR',
    items: items.map(p => ({ item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 })),
  }))
}

export function trackPurchase(data: PurchaseData): void {
  safeCall(() => window.fbq?.('track', 'Purchase', {
    value: data.total,
    currency: data.currency ?? 'PKR',
    content_ids: data.items.map(i => i.id),
    contents: data.items.map(i => ({ id: i.id, quantity: i.quantity ?? 1 })),
    content_type: 'product',
  }))
  safeCall(() => window.gtag?.('event', 'purchase', {
    transaction_id: data.orderId,
    value: data.total,
    currency: data.currency ?? 'PKR',
    items: data.items.map(p => ({ item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 })),
  }))
  safeCall(() => window.ttq?.track('CompletePayment', { value: data.total, currency: data.currency ?? 'PKR' }))
}
