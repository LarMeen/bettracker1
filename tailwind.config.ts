import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cs: {
          bg: '#090d16',
          card: '#111827',
          surface: '#1a2234',
          border: '#1f293d',
          accent: '#f59e0b', // CS2 gold / orange
          cyan: '#06b6d4',
          win: '#10b981',
          loss: '#ef4444',
          push: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;
