/**
 * Extracts H2 headings from an HTML string and returns TOC entries.
 * Also returns the content with id attributes injected into each h2.
 */

export interface TocEntry {
  id: string
  text: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function extractToc(html: string): { toc: TocEntry[]; content: string } {
  const toc: TocEntry[] = []

  // Match all <h2>...</h2> tags (non-greedy, handles attributes)
  const content = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, inner) => {
    // Strip any existing HTML tags from inner text for the slug
    const text = inner.replace(/<[^>]+>/g, '').trim()
    const id = slugify(text)
    toc.push({ id, text })
    return `<h2 id="${id}"${attrs}>${inner}</h2>`
  })

  return { toc, content }
}
