export interface ProductImage {
  id: string
  url: string
  publicId: string
  altText: string | null
  isDefault: boolean
  sortOrder: number
}

export interface ProductVariant {
  id: string
  sku: string
  size: string | null
  color: string | null
  colorHex: string | null
  price: number | null
  salePrice: number | null
  stock: number
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  description: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  salePrice: number | null
  isFeatured: boolean
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
  _count?: {
    reviews: number
  }
  avgRating?: number
}

export interface ProductCardData {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice: number | null
  image: ProductImage | null
  variants: Pick<ProductVariant, 'id' | 'size' | 'color' | 'colorHex' | 'stock'>[]
}
