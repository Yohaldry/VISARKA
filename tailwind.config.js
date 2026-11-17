/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#d4af37',
        darkBg: '#0d0d0d',
        cardBg: '#161616',
      }
    },
  },
  plugins: [],
}