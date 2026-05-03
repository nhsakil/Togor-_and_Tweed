import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return {
    rules: [
      // Standard crawlers — full site except private areas
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/', '/track-order'],
      },
      // Google AI (used for AI Overviews / SGE)
      {
        userAgent: 'Googlebot-Extended',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      // OpenAI / ChatGPT crawler
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      // Anthropic / Claude crawler
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      // Perplexity AI crawler
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      // Google Gemini / Bard crawlers
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      // Meta AI crawler
      {
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      // Bing / Microsoft Copilot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
      // Common AI / research crawlers
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/account', '/admin', '/checkout', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
