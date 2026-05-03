import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        /* Plus Jakarta Sans is the primary font — matches Snitch's NewHeroTRIAL geometric sans */
        sans:     ['var(--font-jakarta)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        jakarta:  ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        /* Remap playfair → jakarta so all existing font-playfair classes switch automatically */
        playfair: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        serif:    ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // shadcn/ui CSS variable-based colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Brand colors
        brand: {
          black: '#1a1a1a',
          gold: '#c8a96e',
          'gold-light': '#d9bf96',
          'gold-dark': '#a8863f',
          cream: '#f9f5ef',
        },
      },
      maxWidth: {
        'mobile': '480px',
        'desktop': '1500px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-33.333%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'marquee': 'marquee 20s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
