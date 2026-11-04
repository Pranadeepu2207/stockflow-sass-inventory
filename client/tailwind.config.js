/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // custom flat palette: sunset orange (#FF5841) and red-violet (#C53678)
        sunset: {
          50: '#fff6f4',
          100: '#ffede9',
          200: '#ffded7',
          300: '#ffc1b5',
          400: '#ff907b',
          500: '#FF5841', // primary action color
          600: '#e8412a',
          700: '#c3301c',
          800: '#a12a1a',
          900: '#84271b',
        },
        redviolet: {
          50: '#fdf2f7',
          100: '#fce7f1',
          200: '#fad0e4',
          300: '#f6a9ce',
          400: '#ee73ae',
          500: '#C53678', // secondary accent
          600: '#b12666',
          700: '#941b52',
          800: '#7c1944',
          900: '#68193a',
        },
      },
    },
  },
  plugins: [],
};
