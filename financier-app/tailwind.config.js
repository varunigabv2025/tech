/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // TrustFlow Core Palette
        cream: {
          DEFAULT: '#F8F4E1',
          50: '#FAF7EC',
          100: '#F8F4E1',
          200: '#EFE7CB'
        },
        taupe: {
          DEFAULT: '#AF8F6F',
          light: '#C4A98E',
          dark: '#937456'
        },
        brown: {
          DEFAULT: '#74512D',
          light: '#8E673D',
          dark: '#543310'
        },
        deep: {
          DEFAULT: '#543310',
          darker: '#3B230B'
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(84, 51, 16, 0.06), 0 2px 6px -1px rgba(84, 51, 16, 0.04)',
        warmLg: '0 10px 25px -3px rgba(84, 51, 16, 0.08), 0 4px 10px -2px rgba(84, 51, 16, 0.04)'
      }
    }
  },
  plugins: []
};
