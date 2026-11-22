/**
 * RAIWAVE Premium Design System Tokens
 * Defines the core color palette, typography scale, spacing, border radii,
 * shadows, and transitions for the futuristic music application.
 */

export const colors = {
  // Primary Backgrounds
  background: {
    primary: '#0B0D13',         // Deep charcoal / near-black
    secondary: '#12141D',       // Dark surface
    tertiary: '#181B27',        // Elevated surface / modal
    elevated: '#1F2333',        // Dropdown / popover surface
    card: '#151824',            // Surface card
    glass: 'rgba(18, 20, 29, 0.72)', // Frosted glass surface
  },

  // Surfaces & Ambient Tints
  surface: {
    dark: '#131520',
    purple: '#1B172B',          // Deep purple subtle tint
    border: 'rgba(255, 255, 255, 0.07)',
    borderHover: 'rgba(168, 85, 247, 0.35)',
    borderActive: 'rgba(168, 85, 247, 0.60)',
    divider: 'rgba(255, 255, 255, 0.05)',
  },

  // Accent & Brand Colors (Futuristic Purple / Violet)
  accent: {
    primary: '#8B5CF6',         // Violet 500
    hover: '#9D6DF8',           // Violet 400
    active: '#7C3AED',          // Violet 600
    subtle: 'rgba(139, 92, 246, 0.12)', // Subtle purple wash
    border: 'rgba(139, 92, 246, 0.28)', // Soft purple border
    glow: 'rgba(139, 92, 246, 0.20)',   // Ambient soft glow
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    gradientSubtle: 'linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 100%)',
  },

  // Typography Colors
  text: {
    primary: '#F8FAFC',         // Crisp clean white
    secondary: '#94A3B8',       // Muted slate gray
    muted: '#64748B',           // Deep muted gray for captions
    accent: '#A78BFA',          // Soft violet for highlights
    contrast: '#0B0D13',        // Dark text on bright accents
  },

  // Status & Utility Colors
  status: {
    success: '#10B981',         // Subtle emerald
    warning: '#F59E0B',         // Subtle amber
    error: '#EF4444',           // Soft coral red
    info: '#38BDF8',            // Ocean sky
  },
} as const

export const typography = {
  fonts: {
    heading: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    base: '0.875rem', // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

export const radii = {
  sm: '0.5rem',      // 8px
  md: '0.75rem',     // 12px
  lg: '1rem',        // 16px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  full: '9999px',
} as const

export const shadows = {
  subtle: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
  elevated: '0 12px 36px -6px rgba(0, 0, 0, 0.65)',
  accent: '0 8px 28px -4px rgba(139, 92, 246, 0.22)',
  glow: '0 0 35px -5px rgba(139, 92, 246, 0.25)',
} as const

export const transitions = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  base: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  smooth: '350ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const
