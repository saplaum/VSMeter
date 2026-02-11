/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VSMeter Dark Theme (Mentimeter Style)
        'vs-dark': '#000000',
        'vs-dark-light': '#1a1a1a',
        'vs-border': '#374151',
        'vs-text': '#ffffff',
        'vs-text-muted': '#9CA3AF',
        
        // Bar Gradient Colors
        'vs-bar-base': '#3B82A0',
        'vs-bar-mid': '#5DADE2',
        'vs-bar-top': '#A8E6FF',
        'vs-bar-accent': '#B0E7FF',
      },
      animation: {
        'grow-up': 'growUp 1s ease-out forwards',
      },
      keyframes: {
        growUp: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}

