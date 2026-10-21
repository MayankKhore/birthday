/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
          950: 'var(--color-brand-950)'
        },
        lavender: 'var(--color-lavender)',
        periwinkle: 'var(--color-periwinkle)',
        midnight: 'var(--color-midnight)',
        cream: 'var(--color-cream)',
        peach: 'var(--color-peach)',
        butter: 'var(--color-butter)',
        mint: 'var(--color-mint)',
        rose: 'var(--color-rose)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          page: 'var(--color-page)',
          elevated: 'var(--color-surface-elevated)',
          sunken: 'var(--color-surface-sunken)',
          warm: 'var(--color-surface-warm)',
          lavender: 'var(--color-surface-lavender)'
        },
        success: { light: 'var(--color-success-light)', DEFAULT: 'var(--color-success)', dark: 'var(--color-success-dark)' },
        warning: { light: 'var(--color-warning-light)', DEFAULT: 'var(--color-warning)', dark: 'var(--color-warning-dark)' },
        error: { light: 'var(--color-error-light)', DEFAULT: 'var(--color-error)', dark: 'var(--color-error-dark)' },
        info: { light: 'var(--color-info-light)', DEFAULT: 'var(--color-info)', dark: 'var(--color-info-dark)' }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)'
      }
    }
  },
  plugins: []
};