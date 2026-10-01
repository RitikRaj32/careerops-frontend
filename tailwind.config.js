/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: '#0d1526',
        dark2: '#16223c',
        'dark-glow': '#1c3a63',
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--color-ink-soft) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
        blue: '#2f6fed',
        'blue-soft': 'rgb(var(--color-blue-soft) / <alpha-value>)',
        amber: '#f2ab34',
        teal: '#1f9e83',
        'teal-soft': 'rgb(var(--color-teal-soft) / <alpha-value>)',
        rose: '#e0596a',
        'rose-soft': 'rgb(var(--color-rose-soft) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
        landing: ['"Hanken Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(20,24,31,0.06)',
        md: '0 1px 3px rgba(20,24,31,0.06), 0 12px 28px -12px rgba(20,24,31,0.14)',
        lg: '0 20px 50px -18px rgba(13,21,38,0.35)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        }
      }
    },
  },
  plugins: [],
}
