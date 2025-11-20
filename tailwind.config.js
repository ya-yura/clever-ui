import { readFileSync } from 'fs';
import { join } from 'path';

// Читаем Design System DNA напрямую из файла источника
const designSystemPath = join(process.cwd(), 'src/theme/design-system.json');
const designSystem = JSON.parse(readFileSync(designSystemPath, 'utf-8'));
const { colors } = designSystem.dna;

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
        // Подключаем цвета динамически из design-system.json
        surface: colors.surface,
        content: colors.content,
        brand: {
          ...colors.brand,
          dark: colors.brand.primaryDark // Mapping для совместимости
        },
        status: colors.status,
        
        // Алиасы для совместимости с легаси кодом, если нужно
        success: colors.status.success,
        warning: colors.status.warning,
        error: colors.status.error,
        info: colors.status.info,
        
        // Legacy Modules (Preserved but mapped to new palette where possible)
        modules: {
          receiving: { bg: colors.brand.primary, text: colors.brand.primaryDark },
          inventory: { bg: '#fea079', text: '#8c533b' }, // Пока оставим, если нет в палитре
          picking: { bg: colors.status.warning, text: '#8b5931' },
          placement: { bg: colors.brand.secondary, text: '#2d7a6b' },
          shipment: { bg: colors.status.success, text: '#2d6b2d' },
          return: { bg: colors.status.error, text: '#6b3d3c' },
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
