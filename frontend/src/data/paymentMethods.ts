export interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay cash when your order is delivered (Recommended)', icon: '💵' },
  { id: 'jazzcash', name: 'JazzCash', description: 'Instant payment via JazzCash mobile wallet', icon: '📱' },
  { id: 'easypaisa', name: 'EasyPaisa', description: 'Instant payment via EasyPaisa mobile wallet', icon: '📱' },
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Transfer to our bank account (Requires verification)', icon: '🏦' },
  // Card payment is not yet integrated — no payment gateway configured.
  // Re-add when a gateway (Stripe, 2Checkout, etc.) is fully set up.
]
