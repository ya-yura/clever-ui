import { readFileSync } from 'fs';
import { join } from 'path';

// Читаем Design System DNA напрямую из файла источника
const designSystemPath = join(process.cwd(), 'src/theme/design-system.json');
const designSystem = JSON.parse(readFileSync(designSystemPath, 'utf-8'));

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
        },
        content: {
          primary: 'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          tertiary: 'var(--color-content-tertiary)',
          inverse: 'var(--color-content-inverse)',
        },
        
        // Brand colors (base palette from mockup)
        brand: {
          primary: 'var(--color-brand-primary)',
          dark: 'var(--color-brand-dark)',
          secondary: 'var(--color-brand-secondary)',
          tertiary: 'var(--color-brand-tertiary)',
        },
        
        // Status colors (consistent across themes)
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        
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
        DEFAULT: designSystem.dna.borderRadius.md,
        lg: designSystem.dna.borderRadius.lg,
        sm: designSystem.dna.borderRadius.sm,
        full: designSystem.dna.borderRadius.full,
      },
      boxShadow: {
        soft: designSystem.dna.shadows.md,
        card: designSystem.dna.shadows.lg,
      }
    },
  },
  plugins: [],
}
