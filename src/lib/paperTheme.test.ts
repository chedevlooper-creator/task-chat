import { describe, expect, it } from 'vitest';
import { PAPER_THEME_KEYS, getPaperTheme } from './paperTheme';

describe('paper theme definitions', () => {
  it('exposes the three Claude Design handoff editions in order', () => {
    expect(PAPER_THEME_KEYS).toEqual(['daily', 'nightEdition', 'magazine']);
  });

  it('resolves the night edition tokens', () => {
    const theme = getPaperTheme('nightEdition');

    expect(theme.edition).toBe('NIGHT EDITION');
    expect(theme.tokens['--bg-0']).toBe('#141210');
    expect(theme.tokens['--accent-ink']).toBe('#f4a64f');
    expect(theme.isDark).toBe(true);
  });

  it('falls back to daily when the key is unknown', () => {
    expect(getPaperTheme('unknown').key).toBe('daily');
  });
});
