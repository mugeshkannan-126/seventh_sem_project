/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // SmartCivic Brand – Material 3 Tonal Palette
        primary: '#004ac6',
        'primary-container': '#2563eb',
        'on-primary': '#ffffff',
        'on-primary-container': '#eeefff',
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b4c5ff',
        'on-primary-fixed': '#00174b',
        'on-primary-fixed-variant': '#003ea8',
        'inverse-primary': '#b4c5ff',

        secondary: '#006e2f',
        'secondary-container': '#6bff8f',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#007432',
        'secondary-fixed': '#6bff8f',
        'secondary-fixed-dim': '#4ae176',
        'on-secondary-fixed': '#002109',
        'on-secondary-fixed-variant': '#005321',

        tertiary: '#784b00',
        'tertiary-container': '#996100',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffeedd',
        'tertiary-fixed': '#ffddb8',
        'tertiary-fixed-dim': '#ffb95f',
        'on-tertiary-fixed': '#2a1700',
        'on-tertiary-fixed-variant': '#653e00',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        // Surface scale
        surface: '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-variant': '#d3e4fe',
        'surface-tint': '#0053db',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#434655',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',

        // Background
        background: '#f8f9ff',
        'on-background': '#0b1c30',

        // Borders
        outline: '#737686',
        'outline-variant': '#c3c6d7',

        // Status (semantic aliases)
        resolved: '#D1FAE5',
        'on-resolved': '#065F46',
        'in-progress': '#DBEAFE',
        'on-in-progress': '#1E40AF',
        pending: '#FEF3C7',
        'on-pending': '#92400E',
        critical: '#FEE2E2',
        'on-critical': '#991B1B',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        inter: ['Inter'],
      },
      fontSize: {
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'title-lg': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg': ['12px', { lineHeight: '16px', letterSpacing: '0.1px', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        card: '24px',
        img: '16px',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        gutter: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        overlay: '0 20px 25px -5px rgb(0 74 198 / 0.1), 0 8px 10px -6px rgb(0 74 198 / 0.1)',
      },
    },
  },
  plugins: [],
};
