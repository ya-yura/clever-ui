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
    extend: {
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'sans-serif'],
      },
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
        
        // Brand colors (consistent across themes)
        brand: {
          primary: 'var(--color-brand-primary)',
          dark: 'var(--color-brand-dark)',
          secondary: 'var(--color-brand-secondary)',
        },
        
        // Status colors (consistent across themes)
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        
        // Legacy Modules (using brand colors)
        modules: {
          receiving: { 
            bg: designSystem.dna.colors.brand.primary, 
            text: designSystem.dna.colors.brand.primaryDark 
          },
          inventory: { 
            bg: '#fea079', 
            text: '#8c533b' 
          },
          picking: { 
            bg: designSystem.dna.colors.status.warning, 
            text: '#8b5931' 
          },
          placement: { 
            bg: designSystem.dna.colors.brand.secondary, 
            text: '#2d7a6b' 
          },
          shipment: { 
            bg: designSystem.dna.colors.status.success, 
            text: '#2d6b2d' 
          },
          return: { 
            bg: designSystem.dna.colors.status.error, 
            text: '#6b3d3c' 
          },
        },
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
