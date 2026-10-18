import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette from user reference image:
        // #051F20, #0B2B26, #163832, #235347, #8EB69B, #DAF1DE
        palette: {
          950: '#020e0e', // ultra deep dark background
          900: '#051F20', // darkest pine obsidian base
          800: '#0B2B26', // card surface level 1
          700: '#163832', // elevated surface level 2 / dark accents
          600: '#235347', // medium pine / active buttons & pills
          400: '#8EB69B', // muted sage / secondary text & icons
          200: '#DAF1DE', // pale mint foam / primary text & highlights
          100: '#EEF9F1', // crisp white-mint
        },
        // Semantic aliases:
        forest: {
          darkest: '#051F20',
          dark: '#0B2B26',
          medium: '#163832',
          accent: '#235347',
          sage: '#8EB69B',
          mint: '#DAF1DE',
        },
        // Outcome status colors harmonized with the green palette:
        status: {
          win: '#34D399',      // bright emerald mint
          loss: '#FB7185',     // soft rose coral
          push: '#8EB69B',     // sage slate
          pending: '#FDE68A',  // warm pale amber
        }
      },
      boxShadow: {
        'glow-mint': '0 0 30px -4px rgba(218, 241, 222, 0.18)',
        'glow-forest': '0 0 25px -4px rgba(35, 83, 71, 0.4)',
        'glow-emerald': '0 0 25px -4px rgba(52, 211, 153, 0.25)',
        'glow-rose': '0 0 25px -4px rgba(251, 113, 133, 0.25)',
        'inner-light': 'inset 0 1px 0 0 rgba(218, 241, 222, 0.12)',
        'glass': '0 8px 32px 0 rgba(2, 14, 14, 0.55)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;
