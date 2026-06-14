/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF1F0',
          100: '#FFDED9',
          200: '#FFB7AD',
          300: '#FF8F81',
          400: '#FF6855',
          500: '#E63946',
          600: '#C42836',
          700: '#A21D29',
          800: '#801620',
          900: '#5E0F17',
        },
        accent: {
          gold: '#FFB703',
          peach: '#F4A261',
          coral: '#E76F51',
        },
        warm: {
          50: '#FFF8F0',
          100: '#FFEFD9',
          200: '#FFDDB3',
          300: '#FFCB8D',
        },
        reminder: {
          urgent: {
            from: '#FF6B6B',
            to: '#E63946',
          },
          normal: {
            from: '#FFB86B',
            to: '#F4A261',
          },
          safe: {
            from: '#6BCB77',
            to: '#4D9655',
          },
        },
      },
      fontFamily: {
        display: ['"Ma Shan Zheng"', '"LXGW WenKai"', 'cursive'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.02)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
