import { z } from 'zod'
import { BANGLADESH_DIVISIONS } from '@/lib/constants'

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z
    .string()
    .regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number'),
  line1: z.string().min(5, 'Address is required (min 5 characters)'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.enum(BANGLADESH_DIVISIONS as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a division' }),
  }),
  postalCode: z.string().regex(/^\d{4}$/, 'Enter a valid 4-digit postal code'),
  country: z.literal('BD').default('BD'),
  saveAddress: z.boolean().default(false),
})

export const paymentSchema = z.object({
  method: z.enum(['cod', 'bkash', 'nagad'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
})

export const checkoutSchema = z.object({
  address: addressSchema,
  payment: paymentSchema,
})

export type AddressInput = z.infer<typeof addressSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
