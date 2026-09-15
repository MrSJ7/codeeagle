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
        shell: '#F8F9FA',
        surface: '#FFFFFF',
        code: {
          DEFAULT: '#16191D',
          gutter: '#111316',
          text: '#E6EDF3',
          border: '#21262D',
          highlight: '#262C36',
        },
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#10B981',
          600: '#0F9F6E',
          700: '#087A54',
          800: '#065F42',
          900: '#044430',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        severity: {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#D97706',
          low: '#2563EB',
        },
      },
    },
  },
  plugins: [],
}
