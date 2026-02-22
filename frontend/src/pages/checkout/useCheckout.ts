import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import type { ShippingMethod } from '@/types'

export interface Address {
  id: number
  label: string
  name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  is_default: boolean
}

export interface CheckoutForm {
  email: string
  shipping_name: string
  shipping_phone: string
  shipping_address_line_1: string
  shipping_address_line_2: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  billing_same_as_shipping: boolean
  billing_name: string
  billing_phone: string
  billing_address_line_1: string
  billing_address_line_2: string
  billing_city: string
  billing_state: string
  billing_postal_code: string
  shipping_method_id: number | null
  payment_method: string
  transaction_id: string
  notes: string
}

export function useCheckout() {
  const navigate = useNavigate()
  const { items, subtotal, discount, total, couponCode } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const [form, setForm] = useState<CheckoutForm>({
    email: '',
    shipping_name: '',
    shipping_phone: '',
    shipping_address_line_1: '',
    shipping_address_line_2: '',
    shipping_city: '',
    shipping_state: 'Punjab',
    shipping_postal_code: '',
    billing_same_as_shipping: true,
    billing_name: '',
    billing_phone: '',
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state: 'Punjab',
    billing_postal_code: '',
    shipping_method_id: null,
    payment_method: 'cod',
    transaction_id: '',
    notes: '',
  })

  // Fetch saved addresses if authenticated
  const { data: addresses } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await api.get('/api/addresses')
      return response.data.data
    },
    enabled: isAuthenticated,
  })

  // Fetch shipping methods
  const { data: shippingMethods } = useQuery<ShippingMethod[]>({
    queryKey: ['shipping-methods', form.shipping_city],
    queryFn: async () => {
      const response = await api.get('/api/shipping/methods', {
        params: { city: form.shipping_city }
      })
      return response.data.data
    },
    enabled: !!form.shipping_city,
  })

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const response = await api.post('/api/checkout/place-order', {
        ...data,
        shipping_email: data.email,
        items: items.filter(item => item.product || item.bundle).map(item => {
          if (item.bundle) {
            return { bundle_id: item.bundle.id, quantity: item.quantity, price: item.unit_price }
          }
          return { product_id: item.product!.id, variant_id: item.variant?.id, quantity: item.quantity }
        }),
        coupon_code: couponCode,
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.data?.payment?.redirect_url) {
        window.location.href = data.data.payment.redirect_url
      } else {
        const orderNum = data.data?.order?.order_number
        navigate(`/order-success/${orderNum}`)
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to place order')
    },
  })

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email || '',
        shipping_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '',
        shipping_phone: user.phone || '',
      }))
    }
  }, [user])

  // Set default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.is_default) || addresses[0]
      setSelectedAddress(defaultAddress)
      setForm(prev => ({
        ...prev,
        shipping_name: defaultAddress.name,
        shipping_phone: defaultAddress.phone,
        shipping_address_line_1: defaultAddress.address_line_1,
        shipping_address_line_2: defaultAddress.address_line_2 || '',
        shipping_city: defaultAddress.city,
        shipping_state: defaultAddress.state,
        shipping_postal_code: defaultAddress.postal_code,
      }))
    }
  }, [addresses])

  // Set default shipping method
  useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0 && !form.shipping_method_id) {
      setForm(prev => ({ ...prev, shipping_method_id: shippingMethods[0].id }))
    }
  }, [shippingMethods, form.shipping_method_id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
    setForm(prev => ({
      ...prev,
      shipping_name: address.name,
      shipping_phone: address.phone,
      shipping_address_line_1: address.address_line_1,
      shipping_address_line_2: address.address_line_2 || '',
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_postal_code: address.postal_code,
    }))
  }

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!form.shipping_name || !form.shipping_phone || !form.shipping_address_line_1 || !form.shipping_city) {
        toast.error('Please fill in all required shipping fields')
        return false
      }
      if (!isAuthenticated && !form.email) {
        toast.error('Please enter your email address')
        return false
      }
      if (!isAuthenticated && form.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email)) {
          toast.error('Please enter a valid email address')
          return false
        }
      }
    }
    if (stepNum === 2) {
      if (!form.shipping_method_id) {
        toast.error('Please select a shipping method')
        return false
      }
    }
    if (stepNum === 3) {
      if (form.payment_method === 'bank_transfer') {
        if (!form.transaction_id.trim()) {
          toast.error('Please enter your bank transfer transaction ID')
          return false
        }
        // Validate transaction ID format (alphanumeric, 8-30 characters)
        const transactionIdRegex = /^[A-Z0-9]{8,30}$/i
        if (!transactionIdRegex.test(form.transaction_id.trim())) {
          toast.error('Transaction ID must be 8-30 alphanumeric characters')
          return false
        }
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return

    // Normalize phone numbers (remove hyphens and spaces)
    const normalizedForm = {
      ...form,
      shipping_phone: form.shipping_phone.replace(/[-\s]/g, ''),
      billing_phone: form.billing_phone.replace(/[-\s]/g, ''),
    }

    placeOrderMutation.mutate(normalizedForm)
  }

  const selectedShippingMethod = shippingMethods?.find(m => m.id === form.shipping_method_id)
  const shippingCost = selectedShippingMethod?.cost || 0
  const grandTotal = total + shippingCost

  return {
    // State
    step,
    setStep,
    form,
    setForm,
    selectedAddress,
    // Data
    items,
    subtotal,
    discount,
    total,
    couponCode,
    isAuthenticated,
    addresses,
    shippingMethods,
    selectedShippingMethod,
    shippingCost,
    grandTotal,
    // Mutation
    placeOrderMutation,
    // Handlers
    handleInputChange,
    handleAddressSelect,
    nextStep,
    handleSubmit,
  }
}
