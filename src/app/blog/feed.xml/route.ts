import { getAllArticles } from '@/lib/blog/articles'
import { NextResponse } from 'next/server'

export const revalidate = 86400 // revalidate once per day

export function GET() {
  const siteUrl  = process.env.NEXTAUTH_URL ?? 'https://togorandtweed.com'
  const articles = getAllArticles()
  const buildDate = new Date().toUTCString()

  const items = articles.map(a => {
    const pubDate = new Date(a.publishedAt).toUTCString()
    const link    = `${siteUrl}/blog/${a.slug}`
    // Strip HTML tags from content for RSS description
    const plainExcerpt = a.excerpt.replace(/<[^>]+>/g, '')
    return `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${plainExcerpt}]]></description>
      <category><![CDATA[${a.category}]]></category>
      <author>editorial@togorandtweed.com (Togor &amp; Tweed)</author>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Togor &amp; Tweed Style Journal</title>
    <link>${siteUrl}/blog</link>
    <description>Men's fashion guides, style tips, and clothing advice for Bangladesh — from Togor &amp; Tweed.</description>
    <language>en-BD</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/og?title=Style+Journal&amp;subtitle=Togor+%26+Tweed+Bangladesh</url>
      <title>Togor &amp; Tweed Style Journal</title>
      <link>${siteUrl}/blog</link>
    </image>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  })
}
