import { z } from 'zod'

const addToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
})

describe('Cart Validation', () => {
  it('validates cart item correctly', () => {
    expect(addToCartSchema.safeParse({ variantId: 'var-123', quantity: 2 }).success).toBe(true)
  })

  it('rejects zero quantity', () => {
    expect(addToCartSchema.safeParse({ variantId: 'var-123', quantity: 0 }).success).toBe(false)
  })

  it('rejects negative quantity', () => {
    expect(addToCartSchema.safeParse({ variantId: 'var-123', quantity: -1 }).success).toBe(false)
  })

  it('rejects quantity over 99', () => {
    expect(addToCartSchema.safeParse({ variantId: 'var-123', quantity: 100 }).success).toBe(false)
  })

  it('rejects missing variantId', () => {
    expect(addToCartSchema.safeParse({ variantId: '', quantity: 1 }).success).toBe(false)
  })
})
