/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'power-on': {
          light: '#10b981',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        'power-off': {
          light: '#ef4444',
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'blink': 'blink 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

