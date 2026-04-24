const colorVar = (name, fallbackOpacity = '1') => ({ opacityValue }) =>
  `rgb(var(${name}) / ${opacityValue ?? fallbackOpacity})`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: colorVar('--bg-0-rgb'),
        surface: colorVar('--surface-rgb'),
        'surface-2': colorVar('--surface-2-rgb'),
        'surface-3': colorVar('--surface-3-rgb'),
        'surface-4': colorVar('--surface-4-rgb'),

        ink: colorVar('--ink-rgb'),
        'ink-2': colorVar('--ink-2-rgb'),
        'ink-3': colorVar('--ink-3-rgb'),
        'ink-4': colorVar('--ink-4-rgb'),

        line: colorVar('--ink-rgb', '0.15'),
        'line-2': colorVar('--ink-rgb', '0.34'),
        'line-3': colorVar('--ink-rgb', '0.64'),

        accent: colorVar('--accent-rgb'),
        'accent-2': colorVar('--accent-2-rgb'),
        'accent-d': colorVar('--accent-tint-rgb'),

        warn: colorVar('--warn-rgb'),
        danger: colorVar('--danger-rgb'),
        info: colorVar('--info-rgb'),
        ok: colorVar('--ok-rgb'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Source Serif 4"', '"Source Serif Pro"', 'Newsreader', 'Georgia', 'ui-serif', 'serif'],
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
