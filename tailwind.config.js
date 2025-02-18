/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#131B29',
        'text-default': '#F0F4F8',
        'text-secondary': '#8698aa',
        'price-buy': '#00b15d',
        'price-sell': '#FF5B5A',
        'hover-bg': '#1E3059',
        'flash-green': 'rgba(0, 177, 93, 0.5)',
        'flash-green-bg': 'rgba(16, 186, 104, 0.12)',
        'flash-red-bg': 'rgba(255, 90, 90, 0.12)',
      },
    },
  },
  plugins: [],
}
