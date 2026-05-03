'use client'

import { useEffect } from 'react'
import { trackSearch } from '@/lib/analytics'

interface Props { query: string }

/** Fires a GA4 search event when the search results page renders with a query. */
export default function SearchTracker({ query }: Props) {
  useEffect(() => {
    if (query) trackSearch(query)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])
  return null
}
