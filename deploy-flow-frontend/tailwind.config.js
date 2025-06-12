/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#df5f35',
        secondary: '#df5f35',
        background: {
          light: '#FFFFFF',
          dark: '#18181B',
        },
        text: {
          light: '#18181B',
          dark: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}