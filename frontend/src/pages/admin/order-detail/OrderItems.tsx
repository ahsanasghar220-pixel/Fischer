import { formatPrice } from '@/lib/utils'
import type { Order } from './types'

interface OrderItemsProps {
  order: Order
}

export default function OrderItems({ order }: OrderItemsProps) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-dark-200 dark:border-dark-700">
        <h2 className="font-semibold text-dark-900 dark:text-white">Order Items</h2>
      </div>
      <div className="divide-y divide-dark-200 dark:divide-dark-700">
        {order.items?.map((item) => (
          <div key={item.id} className="p-4 flex gap-4">
            <div className="w-16 h-16 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark-900 dark:text-white">
                {item.product_name || item.product?.name}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                SKU: {item.product_sku || item.product?.sku || '-'}
              </p>
              {item.variant_attributes && (
                <p className="text-sm text-dark-500 dark:text-dark-400">{item.variant_attributes}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-dark-900 dark:text-white">
                {formatPrice(parseFloat(item.unit_price))} x {item.quantity}
              </p>
              <p className="font-semibold text-dark-900 dark:text-white">
                {formatPrice(parseFloat(item.total_price))}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Totals */}
      <div className="p-4 border-t border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900/50">
        <div className="max-w-xs ml-auto space-y-2">
          <div className="flex justify-between text-dark-600 dark:text-dark-400">
            <span>Subtotal</span>
            <span>{formatPrice(parseFloat(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-dark-600 dark:text-dark-400">
            <span>Shipping</span>
            <span>{formatPrice(parseFloat(order.shipping_cost))}</span>
          </div>
          {parseFloat(order.discount) > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount</span>
              <span>-{formatPrice(parseFloat(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-dark-900 dark:text-white pt-2 border-t border-dark-200 dark:border-dark-700">
            <span>Total</span>
            <span>{formatPrice(parseFloat(order.total))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
