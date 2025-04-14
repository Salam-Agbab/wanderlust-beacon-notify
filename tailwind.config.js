
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4ECDC4',
          DEFAULT: '#1A7A74',
          dark: '#05386B',
        },
        secondary: {
          light: '#FFE66D',
          DEFAULT: '#FF8A47',
          dark: '#F76F32',
        },
        background: {
          light: '#F7F9FB',
          DEFAULT: '#EDF5E1',
          dark: '#292F36',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
