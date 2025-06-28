/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e61a39', // BookMyShow red
        secondary: '#0f172a', // Dark slate
        accent: '#facc15', // Yellow for highlights
      },
    },
  },
  plugins: [],
};
