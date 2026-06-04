/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B00',
        marigold: '#F4A623',
        ivory: '#FDF6EC',
        forest: '#2D6A4F',
      },
      fontFamily: {
        tiro: ['"Tiro Devanagari Hindi"', 'serif'],
        noto: ['"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}