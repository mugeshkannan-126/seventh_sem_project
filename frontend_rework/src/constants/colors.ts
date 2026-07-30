// ─── Color Palette ───────────────────────────────────────────────────────────
export const COLORS = {
  // Primary – Trust Blue
  primary: '#004ac6',
  primaryContainer: '#2563eb',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#eeefff',
  primaryFixed: '#dbe1ff',
  primaryFixedDim: '#b4c5ff',
  onPrimaryFixed: '#00174b',
  inversePrimary: '#b4c5ff',

  // Secondary – Resolution Green
  secondary: '#006e2f',
  secondaryContainer: '#6bff8f',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#007432',
  secondaryFixed: '#6bff8f',
  secondaryFixedDim: '#4ae176',
  onSecondaryFixed: '#002109',

  // Tertiary – Warning Orange
  tertiary: '#784b00',
  tertiaryContainer: '#996100',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#ffeedd',
  tertiaryFixed: '#ffddb8',
  tertiaryFixedDim: '#ffb95f',
  onTertiaryFixed: '#2a1700',

  // Error – Urgent Red
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Surface Scale
  surface: '#f8f9ff',
  surfaceDim: '#cbdbf5',
  surfaceBright: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  surfaceVariant: '#d3e4fe',
  surfaceTint: '#0053db',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#434655',
  inverseSurface: '#213145',
  inverseOnSurface: '#eaf1ff',

  // Background
  background: '#f8f9ff',
  onBackground: '#0b1c30',

  // Borders
  outline: '#737686',
  outlineVariant: '#c3c6d7',

  // Status Semantic
  statusResolved: { bg: '#D1FAE5', text: '#065F46' },
  statusInProgress: { bg: '#DBEAFE', text: '#1E40AF' },
  statusPending: { bg: '#FEF3C7', text: '#92400E' },
  statusCritical: { bg: '#FEE2E2', text: '#991B1B' },
  statusRejected: { bg: '#F3F4F6', text: '#374151' },
} as const;

export type ColorKey = keyof typeof COLORS;
