/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070D16',
          900: '#0B1524',
          800: '#122033',
          700: '#1A2D45'
        },
        line: '#24364F',
        teal: {
          DEFAULT: '#2DD4BF',
          dim: '#0F766E'
        },
        gold: '#E8C547'
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 40px rgba(45, 212, 191, 0.12)'
      }
    }
  },
  plugins: []
};
