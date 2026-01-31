/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0f5841', // Debo Green
          blue: '#194f87',  // Debo Blue
        }
      },
    },
  },
  plugins: [],
}