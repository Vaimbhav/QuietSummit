/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#b9ddcb',
          300: '#8cc5aa',
          400: '#5fa888',
          500: '#4a8b70',
          600: '#3a6f5a',
          700: '#2f5a49',
          800: '#28483c',
          900: '#233c33',
        },
        accent: {
          50: '#f5f8f7',
          100: '#e8efe d',
          200: '#d4e3df',
          300: '#b3cec6',
          400: '#8db3a8',
          500: '#6d968a',
          600: '#5a7d72',
          700: '#4a655d',
          800: '#3e534d',
          900: '#364642',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
