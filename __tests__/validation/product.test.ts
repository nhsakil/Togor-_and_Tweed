import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  basePrice: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
})

describe('Product Validation', () => {
  it('passes with valid product data', () => {
    const result = productSchema.safeParse({
      name: 'Test Shirt',
      slug: 'test-shirt',
      basePrice: 49.99,
      categoryId: 'cat-123',
    })
    expect(result.success).toBe(true)
  })

  it('fails with missing name', () => {
    const result = productSchema.safeParse({
      name: '',
      slug: 'test-shirt',
      basePrice: 49.99,
      categoryId: 'cat-123',
    })
    expect(result.success).toBe(false)
  })

  it('fails with negative price', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      slug: 'test',
      basePrice: -10,
      categoryId: 'cat-123',
    })
    expect(result.success).toBe(false)
  })

  it('fails with zero price', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      slug: 'test',
      basePrice: 0,
      categoryId: 'cat-123',
    })
    expect(result.success).toBe(false)
  })
})
