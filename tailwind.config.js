/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-family-base)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-family-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    extend: {
      colors: {
        // Semantic colors using CSS variables (theme-switchable)
        surface: {
          primary: 'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
          inverse: 'var(--color-surface-inverse)',
          disabled: 'var(--color-surface-disabled)',
          overlay: 'var(--color-surface-overlay)',
        },
        content: {
          primary: 'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          tertiary: 'var(--color-content-tertiary)',
          inverse: 'var(--color-content-inverse)',
          disabled: 'var(--color-content-disabled)',
        },
        
        borders: {
          default: 'var(--color-border-default)',
          light: 'var(--color-border-light)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },

        // Brand colors (base palette from mockup)
        brand: {
          primary: 'var(--color-brand-primary)',
          dark: 'var(--color-brand-dark)',
          light: 'var(--color-brand-light)',
          secondary: 'var(--color-brand-secondary)',
          'secondary-dark': 'var(--color-brand-secondary-dark)',
          'secondary-light': 'var(--color-brand-secondary-light)',
          tertiary: 'var(--color-brand-tertiary)',
          'tertiary-dark': 'var(--color-brand-tertiary-dark)',
          'tertiary-light': 'var(--color-brand-tertiary-light)',
        },
        
        // Status colors (consistent across themes)
        success: {
          DEFAULT: 'var(--color-success)',
          dark: 'var(--color-success-dark)',
          light: 'var(--color-success-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          dark: 'var(--color-warning-dark)',
          light: 'var(--color-warning-light)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          dark: 'var(--color-error-dark)',
          light: 'var(--color-error-light)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          dark: 'var(--color-info-dark)',
          light: 'var(--color-info-light)',
        },
        
        // Accent colors
        accent: {
          cyan: 'var(--color-accent-cyan)',
          'cyan-dark': 'var(--color-accent-cyan-dark)',
          'cyan-light': 'var(--color-accent-cyan-light)',
          green: 'var(--color-accent-green)',
          'green-dark': 'var(--color-accent-green-dark)',
          'green-light': 'var(--color-accent-green-light)',
          yellow: 'var(--color-accent-yellow)',
          'yellow-dark': 'var(--color-accent-yellow-dark)',
          'yellow-light': 'var(--color-accent-yellow-light)',
        },

        // Module colors (using CSS variables for consistency)
        'module-receiving-bg': 'var(--color-module-receiving-bg)',
        'module-receiving-text': 'var(--color-module-receiving-text)',
        'module-picking-bg': 'var(--color-module-picking-bg)',
        'module-picking-text': 'var(--color-module-picking-text)',
        'module-shipment-bg': 'var(--color-module-shipment-bg)',
        'module-shipment-text': 'var(--color-module-shipment-text)',
        'module-placement-bg': 'var(--color-module-placement-bg)',
        'module-placement-text': 'var(--color-module-placement-text)',
        'module-inventory-bg': 'var(--color-module-inventory-bg)',
        'module-inventory-text': 'var(--color-module-inventory-text)',
        'module-return-bg': 'var(--color-module-return-bg)',
        'module-return-text': 'var(--color-module-return-text)',
        'module-transfer-bg': 'var(--color-module-transfer-bg)',
        'module-transfer-text': 'var(--color-module-transfer-text)',
        'module-marking-bg': 'var(--color-module-marking-bg)',
        'module-marking-text': 'var(--color-module-marking-text)',
      },
      borderRadius: {
        DEFAULT: '8px', // designSystem.dna.borderRadius.md
        lg: '12px',     // designSystem.dna.borderRadius.lg
        sm: '4px',      // designSystem.dna.borderRadius.sm
        full: '9999px', // designSystem.dna.borderRadius.full
      },
      boxShadow: {
        soft: '0 2px 3px rgba(0, 0, 0, 0.5)', // designSystem.dna.shadows.md
        card: '0 4px 6px rgba(0, 0, 0, 0.5)', // designSystem.dna.shadows.lg
      }
    },
  },
  plugins: [],
}
