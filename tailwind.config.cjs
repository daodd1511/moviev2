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
      },
      fontFamily: {
        'sans': ['Be Vietnam Pro', ...defaultTheme.fontFamily.sans],
      },
      height: {
        'carousel': 'calc(100vh - 4rem)',
      }
    },
  },
    daisyui: {
    themes: false,
  },
  plugins: [daisyui],
}
