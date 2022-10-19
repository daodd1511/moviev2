/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        'autoFit': 'repeat(auto-fit, minmax(10rem, 18rem))',
      },
      fontFamily: {
        'sans': ['Be Vietnam Pro', ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
