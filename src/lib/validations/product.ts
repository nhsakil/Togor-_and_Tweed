import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Please select a rating')
    .max(5, 'Rating cannot exceed 5'),
  title: z.string().max(100, 'Title is too long').optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(1000),
})

export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  category: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(['newest', 'price-asc', 'price-desc', 'popular'])
    .default('newest'),
  page: z.coerce.number().min(1).default(1),
})

export type ReviewInput = z.infer<typeof reviewSchema>
export type SearchInput = z.infer<typeof searchSchema>
