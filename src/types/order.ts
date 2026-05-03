export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED'

export interface OrderItem {
  id: string
  productName: string
  variantSku: string
  size: string | null
  color: string | null
  imageUrl: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string | null
  subtotal: number
  discountAmount: number
  shippingCost: number
  taxAmount: number
  total: number
  createdAt: Date
  items: OrderItem[]
}
