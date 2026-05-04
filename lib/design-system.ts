/**
 * DESIGN SYSTEM TOKENS - SOMAR.IA
 * Central de constantes para garantir consistência visual em todos os módulos.
 */

export const COLORS = {
  bg: {
    base: '#0A0F1E',
    surface: '#111827',
    elevated: '#1F2937',
  },
  accent: {
    green: '#00E5A0',
    purple: '#6C5DD3',
    amber: '#F59E0B',
    red: '#EF4444',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
  },
  border: {
    base: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.16)',
  },
};

export const TYPOGRAPHY = {
  display: 'var(--font-jakarta)',
  body: 'var(--font-dm-sans)',
  mono: 'var(--font-jetbrains)',
};

export const RADIUS = {
  card: '12px',
  input: '8px',
  button: '8px',
};

export const TRANSITION = '200ms ease-in-out';
export const FOCUS_RING = '0 0 0 3px rgba(0, 229, 160, 0.3)';

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
};

export const SHADOWS = {
  glass: 'backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);',
};
