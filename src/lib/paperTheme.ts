export type PaperThemeKey = 'daily' | 'nightEdition' | 'magazine';

export type PaperTheme = {
  key: PaperThemeKey;
  label: string;
  edition: string;
  masthead: 'volume' | 'issue';
  titleItalic: boolean;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
  tokens: Record<string, string>;
};

export const PAPER_THEME_KEYS: PaperThemeKey[] = ['daily', 'nightEdition', 'magazine'];

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const int = Number.parseInt(clean, 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
};

const themeTokens = ({
  bg0,
  bg1,
  bg2,
  surface,
  surface2,
  surface3,
  surface4,
  ink,
  ink2,
  ink3,
  ink4,
  accent,
  accent2,
  accentTint,
  warn,
  danger,
  info,
  ok,
}: {
  bg0: string;
  bg1: string;
  bg2: string;
  surface: string;
  surface2: string;
  surface3: string;
  surface4: string;
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  accent: string;
  accent2: string;
  accentTint: string;
  warn: string;
  danger: string;
  info: string;
  ok: string;
}) => ({
  '--bg-0': bg0,
  '--bg-1': bg1,
  '--bg-2': bg2,
  '--surface': surface,
  '--surface-2': surface2,
  '--surface-3': surface3,
  '--surface-4': surface4,
  '--ink-primary': ink,
  '--ink-soft': ink2,
  '--ink-mute': ink3,
  '--ink-faint': ink4,
  '--accent-ink': accent,
  '--accent-ink-2': accent2,
  '--accent-tint': accentTint,
  '--warn': warn,
  '--danger': danger,
  '--info': info,
  '--ok': ok,
  '--line': `rgb(${hexToRgb(ink)} / 0.22)`,
  '--line-strong': `rgb(${hexToRgb(ink)} / 0.64)`,
  '--rule': `rgb(${hexToRgb(ink)} / 0.2)`,
  '--rule-thin': `rgb(${hexToRgb(ink)} / 0.15)`,
  '--paper': `rgb(${hexToRgb(bg0)} / 0.92)`,
  '--paper-strong': `rgb(${hexToRgb(surface)} / 0.96)`,
  '--paper-tint': `rgb(${hexToRgb(ink)} / 0.03)`,
  '--bg-0-rgb': hexToRgb(bg0),
  '--bg-1-rgb': hexToRgb(bg1),
  '--bg-2-rgb': hexToRgb(bg2),
  '--surface-rgb': hexToRgb(surface),
  '--surface-2-rgb': hexToRgb(surface2),
  '--surface-3-rgb': hexToRgb(surface3),
  '--surface-4-rgb': hexToRgb(surface4),
  '--ink-rgb': hexToRgb(ink),
  '--ink-2-rgb': hexToRgb(ink2),
  '--ink-3-rgb': hexToRgb(ink3),
  '--ink-4-rgb': hexToRgb(ink4),
  '--accent-rgb': hexToRgb(accent),
  '--accent-2-rgb': hexToRgb(accent2),
  '--accent-tint-rgb': hexToRgb(accentTint),
  '--warn-rgb': hexToRgb(warn),
  '--danger-rgb': hexToRgb(danger),
  '--info-rgb': hexToRgb(info),
  '--ok-rgb': hexToRgb(ok),
});

export const PAPER_THEMES: Record<PaperThemeKey, PaperTheme> = {
  daily: {
    key: 'daily',
    label: 'Daily',
    edition: 'DAILY EDITION',
    masthead: 'volume',
    titleItalic: true,
    isDark: false,
    colorScheme: 'light',
    tokens: themeTokens({
      bg0: '#f4efe6',
      bg1: '#eee6d6',
      bg2: '#e6dcc9',
      surface: '#fffaf1',
      surface2: '#f4efe6',
      surface3: '#eee4d5',
      surface4: '#ded2bf',
      ink: '#1a1814',
      ink2: '#4a4238',
      ink3: '#6b6258',
      ink4: '#9a9084',
      accent: '#c2410c',
      accent2: '#9a3409',
      accentTint: '#fbe9dc',
      warn: '#b45309',
      danger: '#b91c1c',
      info: '#1a1814',
      ok: '#166534',
    }),
  },
  nightEdition: {
    key: 'nightEdition',
    label: 'Night',
    edition: 'NIGHT EDITION',
    masthead: 'volume',
    titleItalic: true,
    isDark: true,
    colorScheme: 'dark',
    tokens: themeTokens({
      bg0: '#141210',
      bg1: '#1d1a17',
      bg2: '#28231e',
      surface: '#1a1714',
      surface2: '#211d18',
      surface3: '#2a251f',
      surface4: '#383126',
      ink: '#e8e1d4',
      ink2: '#b8ae9c',
      ink3: '#8a8070',
      ink4: '#63594b',
      accent: '#f4a64f',
      accent2: '#fbbf75',
      accentTint: '#3f2a18',
      warn: '#fbbf24',
      danger: '#f87171',
      info: '#60a5fa',
      ok: '#34d399',
    }),
  },
  magazine: {
    key: 'magazine',
    label: 'Magazine',
    edition: 'MAGAZINE',
    masthead: 'issue',
    titleItalic: false,
    isDark: false,
    colorScheme: 'light',
    tokens: themeTokens({
      bg0: '#fbf6eb',
      bg1: '#f3e5cf',
      bg2: '#ead2ad',
      surface: '#fff9ee',
      surface2: '#fbf6eb',
      surface3: '#efdcc0',
      surface4: '#dec09b',
      ink: '#2b1810',
      ink2: '#5c3a24',
      ink3: '#8a6a48',
      ink4: '#aa8b65',
      accent: '#7c2d12',
      accent2: '#92400e',
      accentTint: '#f7e5d7',
      warn: '#92400e',
      danger: '#9f1239',
      info: '#1e3a8a',
      ok: '#064e3b',
    }),
  },
};

export function getPaperTheme(key: string | null | undefined): PaperTheme {
  if (key && key in PAPER_THEMES) {
    return PAPER_THEMES[key as PaperThemeKey];
  }

  return PAPER_THEMES.daily;
}
