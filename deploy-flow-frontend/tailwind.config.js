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
        primary: '#3B82F6',
        secondary: '#10B981',
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