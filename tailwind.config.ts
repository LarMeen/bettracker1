import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cs: {
          bg: '#070a12',
          card: '#0f172a',
          surface: '#151f32',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.16)',
          accent: '#f59e0b',
          gold: '#fbbf24',
          cyan: '#06b6d4',
          win: '#10b981',
          loss: '#f43f5e',
          push: '#64748b',
        }
      },
      boxShadow: {
        'glow-gold': '0 0 25px -4px rgba(245, 158, 11, 0.25)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.25)',
        'glow-rose': '0 0 25px -4px rgba(244, 63, 94, 0.25)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.25)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;
