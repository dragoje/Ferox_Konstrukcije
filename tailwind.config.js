/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-red': '#9F5255',
        'custom-gray': '#F0F0F0',
      },
    },
  },
  plugins: [],
}

