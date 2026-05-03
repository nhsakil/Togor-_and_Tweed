import { z } from 'zod'

const orderStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])

describe('Order Validation', () => {
  it('accepts valid order statuses', () => {
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
    validStatuses.forEach(status => {
      expect(orderStatusSchema.safeParse(status).success).toBe(true)
    })
  })

  it('rejects invalid status', () => {
    expect(orderStatusSchema.safeParse('INVALID').success).toBe(false)
    expect(orderStatusSchema.safeParse('').success).toBe(false)
    expect(orderStatusSchema.safeParse('pending').success).toBe(false) // case sensitive
  })
})
