/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#3d1209',
          dark:    '#2d0d07',
          light:   '#f5ede9',
        },
        accent: {
          DEFAULT: '#f59e0b',
          dark:    '#d97706',
        },
      },
    },
  },
  plugins: [],
};
