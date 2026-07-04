/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: {
          50: '#f6f3ed',
          100: '#e5d9c5',
          200: '#d5c2a3',
          300: '#c2a878',
          400: '#a68658',
          500: '#8c6239', // soil brown
          600: '#754d2a',
          700: '#5c3a21',
          800: '#472b15',
          900: '#38200d',
        },
        field: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // field green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        sun: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // sun ochre
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Noto Sans Tamil', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
