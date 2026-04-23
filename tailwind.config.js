/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f4f7fb',
        surface: '#ffffff',
        'surface-2': '#f8fafc',
        'surface-3': '#eef2f7',
        'surface-4': '#e2e8f0',

        ink: '#0f172a',
        'ink-2': '#334155',
        'ink-3': '#64748b',
        'ink-4': '#94a3b8',

        line: '#dbe5f0',
        'line-2': '#cbd5e1',
        'line-3': '#94a3b8',

        accent: '#059669',
        'accent-2': '#047857',
        'accent-d': '#ecfdf5',

        warn: '#d97706',
        danger: '#dc2626',
        info: '#2563eb',
        ok: '#059669',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.3' }],
        sm: ['14px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.25' }],
        '2xl': ['28px', { lineHeight: '1.2' }],
        '3xl': ['3rem', { lineHeight: '1.15' }],
        '4xl': ['3.5rem', { lineHeight: '1.08' }],
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        DEFAULT: '14px',
        md: '18px',
        lg: '22px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      boxShadow: {
        pop: '0 16px 36px -24px rgba(15, 23, 42, 0.28)',
        modal: '0 30px 80px -30px rgba(15, 23, 42, 0.32)',
        focus: '0 0 0 3px rgba(37, 99, 235, 0.18)',
        glass: '0 20px 44px -28px rgba(15, 23, 42, 0.2)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.2, .8, .2, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(18px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.14)' },
          '50%': { boxShadow: '0 0 0 12px rgba(37, 99, 235, 0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
        fadeUp: 'fadeUp .3s cubic-bezier(.2, .8, .2, 1) both',
        slideInRight: 'slideInRight .28s cubic-bezier(.2, .8, .2, 1) both',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
