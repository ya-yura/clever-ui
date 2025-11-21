import designSystem from '../theme/design-system.json';

/**
 * Design Tokens extracted from design-system.json
 * 
 * Single source of truth for the application's design language.
 * Usage: import { tokens } from '@/design/tokens';
 * 
 * Theme switching is handled via CSS variables in index.css.
 * These tokens reference the CSS variables for surface/content colors,
 * which change based on [data-theme='light'|'dark'] attribute.
 */

export const tokens = {
  colors: {
    // Surface: Backgrounds and containers (theme-switchable via CSS variables)
    surface: {
      primary: 'var(--color-surface-primary)',
      secondary: 'var(--color-surface-secondary)',
      tertiary: 'var(--color-surface-tertiary)',
      inverse: 'var(--color-surface-inverse)',
    },
    // Content: Text and icons (theme-switchable via CSS variables)
    content: {
      primary: 'var(--color-content-primary)',
      secondary: 'var(--color-content-secondary)',
      tertiary: 'var(--color-content-tertiary)',
      inverse: 'var(--color-content-inverse)',
    },
    // Brand: Main brand colors
    brand: {
      primary: designSystem.dna.colors.brand.primary,
      dark: designSystem.dna.colors.brand.primaryDark,
      secondary: designSystem.dna.colors.brand.secondary,
    },
    // Status: Semantic feedback colors
    status: {
      success: designSystem.dna.colors.status.success,
      warning: designSystem.dna.colors.status.warning,
      error: designSystem.dna.colors.status.error,
      info: designSystem.dna.colors.status.info,
    }
  },
  
  radii: {
    sm: designSystem.dna.borderRadius.sm,   // 4px
    md: designSystem.dna.borderRadius.md,   // 8px
    lg: designSystem.dna.borderRadius.lg,   // 18px
    full: designSystem.dna.borderRadius.full, // 9999px
  },

  shadows: {
    sm: designSystem.dna.shadows.sm,
    md: designSystem.dna.shadows.md,
    lg: designSystem.dna.shadows.lg,
  },

  typography: {
    family: designSystem.dna.typography.family.primary,
    sizes: designSystem.dna.typography.sizes,
    weights: designSystem.dna.typography.weights,
  },

  spacing: designSystem.dna.spacing.scale,

  /**
   * Motion & Animation
   * Consistent timing and easing for all UI interactions
   */
  motion: {
    durations: {
      instant: '100ms',   // Micro-interactions (hover, focus)
      fast: '200ms',      // UI state changes (menus, tooltips)
      normal: '300ms',    // Standard transitions (modals, slides)
      slow: '500ms',      // Complex animations (page transitions)
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',     // Most UI elements
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',   // Entering elements
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',     // Exiting elements
      sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',        // Quick feedback
    },
  },

  /**
   * Theme-specific values (for reference/documentation)
   * Actual colors are set via CSS variables in index.css
   */
  themes: {
    dark: designSystem.dna.colors.dark,
    light: designSystem.dna.colors.light,
  },
} as const;

export type DesignTokens = typeof tokens;
