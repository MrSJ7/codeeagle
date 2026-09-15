/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        shell: '#F5F7F6',
        surface: '#FFFFFF',
        code: {
          DEFAULT: '#171A19',
          gutter: '#121514',
          text: '#E8EEE9',
          border: '#242826',
        },
        brand: {
          50: '#F0FDF8',
          100: '#DDF7EC',
          200: '#B8EED5',
          500: '#10B981',
          600: '#0F9F6E',
          700: '#087A54',
          800: '#065F42',
          900: '#044430',
        },
        severity: {
          critical: '#D92D20',
          high: '#E87B21',
          medium: '#C58B00',
          low: '#4D78A8',
        },
      },
    },
  },
  plugins: [],
}
