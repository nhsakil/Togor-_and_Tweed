export interface Address {
  id: string
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean
}

export interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: Date
}
