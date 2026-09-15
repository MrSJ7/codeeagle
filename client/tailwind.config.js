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
          950: '#090C10', // Obsidian root
          900: '#0D1117', // Surface 1 (panels, editor canvas)
          850: '#161B22', // Surface 2 (headers, toolbars, elevated cards)
          800: '#1F242C', // Surface 3 (raised items, active items)
          750: '#262D38', // Hover highlight
          700: '#30363D', // Structural borders
          600: '#484F58', // Muted borders & dividers
          500: '#6E7681', // Line numbers & micro-captions
          400: '#8B949E', // Secondary text & descriptions
          300: '#C9D1D9', // Labels & subheadings
          100: '#F0F3F6', // Crisp high-contrast body & titles
        },
        surface: {
          app: '#090C10',
          panel: '#0D1117',
          elevated: '#161B22',
          raised: '#1F242C',
        },
        border: {
          subtle: '#21262D',
          strong: '#30363D',
          active: '#10B981',
        },
        code: {
          DEFAULT: '#0D1117',
          gutter: '#090C10',
          text: '#E6EDF3',
          border: '#21262D',
          highlight: '#1A202C',
          lineHover: '#161B22',
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Vibrant Emerald primary brand
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
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        cyan: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        severity: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#38BDF8',
        },
      },
      boxShadow: {
        'dev-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'dev': '0 4px 12px 0 rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'dev-lg': '0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-brand': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 20px -4px rgba(56, 189, 248, 0.25)',
      },
    },
  },
  plugins: [],
}
