import {heroui} from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        'doku': {
          50: '#f0f5ff',
          100: '#c5daff',
          200: '#9bbeff',
          300: '#6fa1ff',
          400: '#4282ff',
          500: '#1d63ed',
          600: '#004cd7',
          700: '#0037a2',
          800: '#00236e',
          900: '#001244',
        }
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
