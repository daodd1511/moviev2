/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const daisyui = require('daisyui');
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        'autoFit': 'repeat(auto-fit, minmax(0, 16rem))',
        'autoFit-sm': 'repeat(auto-fit, minmax(0, 12rem))',
      },
      fontFamily: {
        'sans': ['Be Vietnam Pro', ...defaultTheme.fontFamily.sans],
      },
      height: {
        'withoutNavbar': 'calc(100vh - 4rem)',
      },
      colors: {
        'cPrimary': '#023246',
      }
    },
  },
    daisyui: {
    themes: false,
  },
  plugins: [daisyui],
}
