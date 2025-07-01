/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E90FF', // Light Blue
          50: '#e6f2ff',
          100: '#b3d8ff',
          200: '#80bdff',
          300: '#4da3ff',
          400: '#1E90FF',
          500: '#187bcd',
          600: '#136299',
          700: '#0d4966',
          800: '#082033',
          900: '#05101a',
        },
        secondary: {
          DEFAULT: '#0A3D62', // Dark Blue
          50: '#e3eaf2',
          100: '#b8cbe0',
          200: '#8dacce',
          300: '#628dbd',
          400: '#376eab',
          500: '#0A3D62',
          600: '#08314e',
          700: '#06243b',
          800: '#041827',
          900: '#020c14',
        },
        neutral: {
          50: '#F4F4F4', // Soft Gray
          100: '#FFFFFF', // White
        },
        accent: {
          yellow: '#FFEB3B', // Warm Yellow
          green: '#28A745', // Bright Green
        },
        action: {
          orange: '#FF8C00',
          red: '#DC3545',
        },
        text: {
          dark: '#333333',
          medium: '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 20px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 0 25px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
