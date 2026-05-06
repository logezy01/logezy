/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#1A6B3C',
          dark: '#0F4A28',
          light: '#E8F5EE',
          mid: '#2D9A5F',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        dark: '#0F172A',
        slate: '#334155',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.04)',
        float: '0 4px 16px rgba(0,0,0,0.08)',
        cta: '0 6px 20px rgba(26,107,60,0.40)',
      },
      borderRadius: {
        btn: '12px',
        card: '16px',
      }
    },
  },
  plugins: [],
}