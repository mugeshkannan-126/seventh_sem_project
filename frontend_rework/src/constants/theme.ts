import { COLORS } from './colors';

// ─── Typography ──────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  displayLg: { fontSize: 57, lineHeight: 64, fontWeight: '700' as const, letterSpacing: -1.14 },
  headlineLg: { fontSize: 32, lineHeight: 40, fontWeight: '600' as const, letterSpacing: -0.32 },
  headlineLgMobile: { fontSize: 28, lineHeight: 36, fontWeight: '600' as const },
  titleLg: { fontSize: 22, lineHeight: 28, fontWeight: '500' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  labelLg: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.1 },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  gutter: 16,
  marginMobile: 16,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// ─── Elevation (Shadow) ───────────────────────────────────────────────────────
export const ELEVATION = {
  0: { shadowOpacity: 0, elevation: 0 },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  3: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
} as const;

// ─── Animation ────────────────────────────────────────────────────────────────
export const ANIMATION = {
  durationFast: 150,
  durationBase: 200,
  durationSlow: 400,
  durationVerySlow: 800,
  easingEntrance: [0.22, 1, 0.36, 1] as [number, number, number, number],
  easingExit: [0.4, 0, 0.6, 1] as [number, number, number, number],
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
export const LAYOUT = {
  tabBarHeight: 80,
  topBarHeight: 64,
  bottomNavHeight: 64,
  maxContentWidth: 1280,
  cardMinWidth: 280,
} as const;

export { COLORS };

// ─── Backward-compat aliases (legacy template components) ─────────────────────
export const Colors = {
  light: { text: COLORS.onSurface, background: COLORS.surface, backgroundElement: COLORS.surfaceContainerLow, backgroundSelected: COLORS.surfaceContainer, textSecondary: COLORS.onSurfaceVariant },
  dark: { text: '#ffffff', background: '#000000', backgroundElement: '#212225', backgroundSelected: '#2E3135', textSecondary: '#B0B4BA' },
} as const;
export type ThemeColor = keyof typeof Colors.light;
export const Fonts = { sans: 'Inter', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' };
export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const BottomTabInset = 80;
export const MaxContentWidth = 1280;
