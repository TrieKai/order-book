/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        systemGray: '#8698aa',
        systemBlue: '#1E3059',
        systemGreen: {
          DEFAULT: '#00b15d',
          '12': 'rgba(16, 186, 104, 0.12)',
          '50': 'rgba(0, 177, 93, 0.5)'
        },
        systemRed: {
          DEFAULT: '#FF5B5A',
          '12': 'rgba(255, 90, 90, 0.12)',
          '50': 'rgba(255, 90, 90, 0.5)'
        },
      },
      keyframes: {
        'flash-green': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(0, 177, 93, 0.5)' },
        },
        'flash-red': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(255, 90, 90, 0.5)' },
        },
        'new-ask': {
          '0%': { backgroundColor: 'rgba(255, 90, 90, 0.5)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'new-bid': {
          '0%': { backgroundColor: 'rgba(0, 177, 93, 0.5)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'flash-green': 'flash-green 0.5s ease-in-out',
        'flash-red': 'flash-red 0.5s ease-in-out',
        'new-ask': 'new-ask 0.5s ease-in-out',
        'new-bid': 'new-bid 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}
