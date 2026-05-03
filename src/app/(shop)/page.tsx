// The homepage is handled by the root app/page.tsx
// This empty page prevents Next.js from complaining about a missing route handler for the (shop) group root.
import { redirect } from 'next/navigation'

export default function ShopGroupRoot() {
  redirect('/')
}
