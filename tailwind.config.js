/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem' },
      screens: { '2xl': '1200px' },
    },
    extend: {
      fontFamily: { sans: ['Montserrat', 'system-ui', 'sans-serif'] },
      // WebMart brand tokens — change the palette here, not in components.
      colors: {
        // Brand teal, also the full stop in the logo. Fills and markers only — never text on white.
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
        },
        ink: { DEFAULT: '#000000', 800: '#18181B', 700: '#27272A' },
        graphite: '#52525B',
        mist: '#F4F4F5',
        line: '#E4E4E7',
      },
      letterSpacing: { display: '-0.03em' },
    },
  },
  plugins: [],
};
