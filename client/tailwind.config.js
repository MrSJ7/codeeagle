/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#08090A', // Root canvas
          900: '#0D1117', // Code & primary surface
          850: '#161B22', // Panels & headers
          800: '#21262D', // Elevated cards & borders
          750: '#262C36', // Hover surfaces
          700: '#30363D', // Structural dividers
          600: '#484F58', // Muted borders
          400: '#8B949E', // Secondary labels
          300: '#C9D1D9', // Body text
          100: '#E6EDF3', // Code text
          50: '#F0F6FC',  // Crisp white text
        },
        graphite: {
          50: '#F0F3F6',
          100: '#E6EDF3',
          200: '#C9D1D9',
          300: '#B1BAC4',
          400: '#8B949E',
          500: '#6E7681',
          600: '#484F58',
          700: '#30363D',
          750: '#262C36',
          800: '#21262D',
          850: '#161B22',
          900: '#0D1117',
          950: '#090C10',
        },
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Primary Brand Orange
          600: '#EA580C', // Hover Brand
          700: '#C2410C', // Active Brand
          800: '#9A3412',
          900: '#7C2D12',
          DEFAULT: '#F97316',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        severity: {
          critical: '#F85149',
          high: '#FB8532',
          medium: '#D29922',
          low: '#8B949E',
          resolved: '#3FB950',
        },
      },
      borderRadius: {
        'tight': '4px',
        'btn': '5px',
        'panel': '8px',
        'shell': '10px',
      },
    },
  },
  plugins: [],
}
