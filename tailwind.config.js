/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'sans-serif'],
      },
      colors: {
        // Surface Colors
        surface: {
          primary: '#242424',
          secondary: '#343436',
          tertiary: '#474747',
          inverse: '#ffffff',
        },
        // Content Colors
        content: {
          primary: '#ffffff',
          secondary: '#e3e3dd',
          tertiary: '#a7a7a7',
          inverse: '#242424',
        },
        // Brand Colors
        brand: {
          primary: '#daa420',
          dark: '#725a1e',
          secondary: '#86e0cb',
        },
        // Status Colors (Legacy & New)
        success: '#91ed91',
        warning: '#f3a361',
        error: '#ba8f8e',
        info: '#86e0cb',
        
        // Legacy Modules (Preserved but mapped to new palette where possible)
        modules: {
          receiving: { bg: '#daa420', text: '#725a1e' },
          inventory: { bg: '#fea079', text: '#8c533b' },
          picking: { bg: '#f3a361', text: '#8b5931' },
          placement: { bg: '#86e0cb', text: '#2d7a6b' },
          shipment: { bg: '#91ed91', text: '#2d6b2d' },
          return: { bg: '#ba8f8e', text: '#6b3d3c' },
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '18px',
      },
      boxShadow: {
        soft: '0 2px 3px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
