/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Primary Brand Color - Navy Blue
        primary: {
          50: '#f0f3f9',
          100: '#d9e1f1',
          200: '#b3c3e3',
          300: '#8da5d5',
          400: '#6687c7',
          500: '#1a365d', // Main brand color - Navy Blue
          600: '#152c4a',
          700: '#102238',
          800: '#0a1725',
          900: '#050b13',
        },
        // Background Colors - Light
        surface: {
          50: '#ffffff',
          100: '#f9fafb',
          200: '#f3f4f6',
          300: '#e5e7eb',
          400: '#d1d5db',
          500: '#9ca3af',
          600: '#6b7280',
          700: '#4b5563',
          800: '#1f2937',
          900: '#111827',
        }
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};