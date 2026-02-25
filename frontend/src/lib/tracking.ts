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
  safeCall(() => window.snaptr?.('track', 'PAGE_VIEW'))
  safeCall(() => window.pintrk?.('track', 'pagevisit'))
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
  safeCall(() => window.snaptr?.('track', 'VIEW_CONTENT', {
    item_ids: [String(product.id)],
    item_category: product.category ?? '',
    price: product.price,
    currency: 'PKR',
  }))
  safeCall(() => window.pintrk?.('track', 'viewcategory', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    product_category: product.category ?? '',
  }))
}

export function trackAddToCart(product: ProductData): void {
  const value = product.price * (product.quantity ?? 1)

  safeCall(() => window.fbq?.('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    value,
    currency: 'PKR',
  }))
  safeCall(() => window.gtag?.('event', 'add_to_cart', {
    items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: product.quantity ?? 1 }],
    value,
    currency: 'PKR',
  }))
  safeCall(() => window.ttq?.track('AddToCart', { content_id: product.id, value: product.price, currency: 'PKR' }))
  safeCall(() => window.snaptr?.('track', 'ADD_CART', {
    item_ids: [String(product.id)],
    item_category: product.category ?? '',
    price: value,
    currency: 'PKR',
  }))
  safeCall(() => window.pintrk?.('track', 'addtocart', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    product_quantity: product.quantity ?? 1,
    value,
    order_quantity: product.quantity ?? 1,
    currency: 'PKR',
  }))
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
  safeCall(() => window.snaptr?.('track', 'START_CHECKOUT', {
    price: total,
    currency: 'PKR',
    number_items: items.length,
    item_ids: items.map(i => String(i.id)),
  }))
  safeCall(() => window.pintrk?.('track', 'checkout', {
    value: total,
    order_quantity: items.length,
    currency: 'PKR',
    line_items: items.map(p => ({
      product_id: p.id,
      product_name: p.name,
      product_price: p.price,
      product_quantity: p.quantity ?? 1,
    })),
  }))
}

export function trackPurchase(data: PurchaseData): void {
  const currency = data.currency ?? 'PKR'

  safeCall(() => window.fbq?.('track', 'Purchase', {
    value: data.total,
    currency,
    content_ids: data.items.map(i => i.id),
    contents: data.items.map(i => ({ id: i.id, quantity: i.quantity ?? 1 })),
    content_type: 'product',
  }))
  safeCall(() => window.gtag?.('event', 'purchase', {
    transaction_id: data.orderId,
    value: data.total,
    currency,
    items: data.items.map(p => ({ item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 })),
  }))
  safeCall(() => window.ttq?.track('CompletePayment', { value: data.total, currency }))

  // Google Ads conversion tracking — the send_to target is automatically
  // determined by the AW-CONVERSION_ID configured via gtag('config', ...) in
  // MarketingPixels. If a specific conversion label is needed, the backend
  // config should include google_ads.conversion_label and it can be appended
  // as send_to: 'AW-ID/LABEL'. For now we fire a generic conversion event.
  safeCall(() => window.gtag?.('event', 'conversion', {
    value: data.total,
    currency,
    transaction_id: String(data.orderId),
  }))

  safeCall(() => window.snaptr?.('track', 'PURCHASE', {
    price: data.total,
    currency,
    transaction_id: String(data.orderId),
    item_ids: data.items.map(i => String(i.id)),
    number_items: data.items.length,
  }))
  safeCall(() => window.pintrk?.('track', 'checkout', {
    value: data.total,
    order_quantity: data.items.length,
    currency,
    order_id: String(data.orderId),
    line_items: data.items.map(p => ({
      product_id: p.id,
      product_name: p.name,
      product_price: p.price,
      product_quantity: p.quantity ?? 1,
    })),
  }))
}
