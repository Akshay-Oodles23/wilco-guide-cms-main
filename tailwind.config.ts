import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        blue: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
          dark: '#1D4ED8',
        },
        orange: {
          DEFAULT: '#EA580C',
          light: '#FFF7ED',
        },
        green: {
          DEFAULT: '#16A34A',
          light: '#ECFDF5',
        },
        pink: {
          DEFAULT: '#DB2777',
          light: '#FCE7F3',
        },
        red: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        yellow: {
          DEFAULT: '#CA8A04',
          light: '#FEF3C7',
        },
        purple: {
          DEFAULT: '#9333EA',
          light: '#F5F3FF',
        },
        bg: '#FAFAFA',
        'bg-white': '#FFFFFF',
        border: '#E5E7EB',
        'border-light': '#F3F4F6',
        'text-primary': '#111827',
        'text-secondary': '#374151',
        'text-muted': '#9CA3AF',
        partner: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
          badge: '#F59E0B',
        },
      },
      borderRadius: {
        card: '12px',
        badge: '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        nav: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}

export default config
