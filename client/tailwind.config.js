/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        graphite: {
          950: '#0A0D12', // App canvas root
          900: '#111620', // Surface 1 (panels, editor, cards)
          850: '#161E2B', // Surface 2 (headers, toolbars, elevated cards)
          800: '#1E2838', // Surface 3 (raised items, active states)
          750: '#263346', // Hover highlight
          700: '#2D394E', // Strong borders & strokes
          600: '#3E4D67', // Subtle accents
          500: '#64748B', // Muted text & gutter numbers
          400: '#94A3B8', // Secondary text
          300: '#CBD5E1', // Primary labels
          100: '#F1F5F9', // Primary high-contrast text
        },
        surface: {
          app: '#0A0D12',
          panel: '#111620',
          elevated: '#161E2B',
          raised: '#1E2838',
        },
        border: {
          subtle: '#1E2636',
          strong: '#2D394E',
          active: '#10B981',
        },
        code: {
          DEFAULT: '#0D1117',
          gutter: '#090D12',
          text: '#E6EDF3',
          border: '#1E2636',
          highlight: '#161F2E',
          lineHover: '#131A24',
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        cyan: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        severity: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#FBBF24',
          low: '#38BDF8',
        },
      },
      boxShadow: {
        'dev-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'dev': '0 4px 12px 0 rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'dev-lg': '0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glow-emerald': '0 0 20px -4px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 20px -4px rgba(56, 189, 248, 0.25)',
      },
    },
  },
  plugins: [],
}
