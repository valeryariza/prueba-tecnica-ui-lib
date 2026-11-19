/** @type {import('tailwindcss').Config} */
module.exports = {
  // La demo-app escanea también el código fuente de la librería para que
  // Tailwind genere las clases que usan sus componentes.
  content: ['./projects/demo-app/src/**/*.{html,ts}', './projects/ui-lib/src/**/*.{html,ts}'],
  presets: [require('./projects/ui-lib/tailwind-preset.js')],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Luckiest Guy"', 'cursive'],
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        portal: {
          50: '#f3fbe8',
          300: '#b9e67e',
          400: '#97ce4c',
          500: '#7fb53a',
          700: '#4d7a1d',
        },
        rick: '#9be7f4',
        morty: '#f0e14a',
        space: {
          900: '#070a13',
          800: '#0b101c',
          700: '#121a2b',
        },
      },
      keyframes: {
        'portal-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'portal-spin': 'portal-spin 6s linear infinite',
        'fade-in': 'fade-in 250ms ease-out both',
        'pop-in': 'pop-in 180ms ease-out both',
      },
    },
  },
  plugins: [],
};
