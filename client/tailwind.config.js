/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        obsidian: {
          950: 'var(--color-obsidian-950, #080808)', // Root canvas
          900: 'var(--color-obsidian-900, #0D0D0D)', // Code & primary surface
          850: 'var(--color-obsidian-850, #121212)', // Panels & headers
          800: 'var(--color-obsidian-800, #181818)', // Elevated cards & borders
          750: 'var(--color-obsidian-750, #1F1F1F)', // Hover surfaces
          700: 'var(--color-obsidian-700, #262626)', // Structural dividers
          600: 'var(--color-obsidian-600, #383838)', // Muted borders
          500: 'var(--color-obsidian-500, #74716C)',
          400: 'var(--color-obsidian-400, #A6A29B)', // Secondary labels (warm neutral)
          300: 'var(--color-obsidian-300, #D4D0C8)', // Body text (warm off-white)
          200: 'var(--color-obsidian-200, #E6E2DA)', // High contrast
          100: 'var(--color-obsidian-100, #F0ECE4)', // Code text
          50:  'var(--color-obsidian-50, #F5F3EF)',  // Crisp warm off-white text
        },
        graphite: {
          50: '#F5F3EF',
          100: '#F0ECE4',
          200: '#E6E2DA',
          300: '#D4D0C8',
          400: '#A6A29B',
          500: '#74716C',
          600: '#383838',
          700: '#262626',
          750: '#1F1F1F',
          800: '#181818',
          850: '#121212',
          900: '#0D0D0D',
          950: '#080808',
        },
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FFA24D', // Brand highlight
          500: '#FF7A18', // Primary Brand Orange
          600: '#FF8A2A', // Hover Brand
          700: '#E06208', // Active Brand
          800: '#B84C00',
          900: '#7C3200',
          DEFAULT: '#FF7A18',
        },
        amber: {
          400: '#FBBF24',
          500: '#F4B740',
          600: '#D97706',
        },
        severity: {
          critical: '#FF4D4D',
          high: '#FF7A18',
          medium: '#F4B740',
          low: '#74716C',
          resolved: '#38C793',
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
