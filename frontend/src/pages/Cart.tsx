import { Link } from 'react-router-dom'
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Cart() {
  const {
    items,
    subtotal,
    discount,
    total,
    couponCode,
    isLoading,
    updateItemQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore()

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateItemQuantity(itemId, newQuantity)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBagIcon className="w-24 h-24 mx-auto text-dark-300 mb-6" />
            <h1 className="text-2xl font-bold text-dark-900 mb-2">Your cart is empty</h1>
            <p className="text-dark-500 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-dark-500 mb-4">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <span className="text-dark-900">Shopping Cart</span>
          </div>
          <h1 className="text-3xl font-bold text-dark-900">Shopping Cart</h1>
          <p className="text-dark-500 mt-1">{items.length} item(s) in your cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-dark-50 text-sm font-medium text-dark-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Product */}
                      <div className="col-span-6 flex gap-4">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="w-20 h-20 bg-dark-100 rounded-lg overflow-hidden flex-shrink-0"
                        >
                          {item.product.primary_image ? (
                            <img
                              src={item.product.primary_image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-400 text-sm">
                              No image
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="font-medium text-dark-900 hover:text-primary-600"
                          >
                            {item.product.name}
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-dark-500 mt-0.5">{item.variant.name}</p>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-500 hover:text-red-600 mt-2 flex items-center gap-1 md:hidden"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center hidden md:block">
                        <span className="text-dark-900 font-medium">
                          {formatPrice(item.variant?.price || item.product.price)}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex items-center justify-center mt-4 md:mt-0">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-dark-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-dark-50 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right hidden md:flex md:items-center md:justify-end md:gap-4">
                        <span className="font-semibold text-dark-900">
                          {formatPrice((item.variant?.price || item.product.price) * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Mobile Price & Total */}
                      <div className="flex items-center justify-between mt-4 md:hidden">
                        <span className="text-dark-500">
                          {formatPrice(item.variant?.price || item.product.price)} × {item.quantity}
                        </span>
                        <span className="font-semibold text-dark-900">
                          {formatPrice((item.variant?.price || item.product.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/shop"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-dark-900 mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-6">
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <span className="text-sm text-green-700 font-medium">{couponCode}</span>
                      <span className="text-sm text-green-600 block">Coupon applied</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-700 hover:text-green-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const code = formData.get('coupon') as string
                      if (code) applyCoupon(code)
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      name="coupon"
                      placeholder="Coupon code"
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button type="submit" className="btn btn-dark px-4">
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-600">Subtotal</span>
                  <span className="font-medium text-dark-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-dark-600">Shipping</span>
                  <span className="text-dark-500">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-lg font-semibold text-dark-900">Total</span>
                  <span className="text-xl font-bold text-dark-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="btn btn-primary w-full mt-6 py-3 text-center"
              >
                Proceed to Checkout
              </Link>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-dark-500 text-center mb-3">Secure payment options</p>
                <div className="flex items-center justify-center gap-4 text-dark-400">
                  <span className="text-xs">COD</span>
                  <span className="text-xs">JazzCash</span>
                  <span className="text-xs">EasyPaisa</span>
                  <span className="text-xs">Cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
