/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5efe5',
        surface: '#fffaf1',
        'surface-2': '#f7f0e5',
        'surface-3': '#eee4d5',
        'surface-4': '#ded2bf',

        ink: '#221d16',
        'ink-2': '#4b4034',
        'ink-3': '#7a6b5b',
        'ink-4': '#a0917f',

        line: '#d1c4b2',
        'line-2': '#8f806d',
        'line-3': '#4f4638',

        accent: '#c9430c',
        'accent-2': '#9f3206',
        'accent-d': '#fff0e5',

        warn: '#b85b0b',
        danger: '#dc2626',
        info: '#221d16',
        ok: '#15803d',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'ui-serif', 'serif'],
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
        pop: '0 18px 38px -30px rgba(34, 29, 22, 0.28)',
        modal: '0 30px 80px -36px rgba(34, 29, 22, 0.42)',
        focus: '0 0 0 3px rgba(201, 67, 12, 0.18)',
        glass: 'none',
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
