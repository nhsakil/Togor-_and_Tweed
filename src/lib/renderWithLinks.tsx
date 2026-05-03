import type { ReactNode } from 'react'

/**
 * Parses [link text](url) markdown syntax in a string and returns
 * an array of strings and <a> elements for React rendering.
 *
 * Usage:
 *   <p>{renderWithLinks(body, 'text-[#c26b47] hover:underline')}</p>
 */
export function renderWithLinks(text: string, linkCls = 'text-[#c26b47] hover:underline'): ReactNode[] {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    nodes.push(
      <a key={match.index} href={match[2]} className={linkCls}>
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}
