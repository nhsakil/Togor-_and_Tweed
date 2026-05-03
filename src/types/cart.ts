export interface CartItem {
  variantId: string
  productId: string
  name: string        // product name
  slug?: string       // product slug (optional, for links)
  image?: string | null  // image URL
  size?: string | null
  color?: string | null
  price: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
}
