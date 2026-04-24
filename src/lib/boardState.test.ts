import { describe, expect, it } from 'vitest';
import { getBoardLoadState } from './boardState';

describe('getBoardLoadState', () => {
  it('shows an error state when either board query fails', () => {
    expect(
      getBoardLoadState({
        tasksLoading: false,
        tasksError: true,
        membersError: false,
        visibleCount: 0,
      }),
    ).toBe('error');

    expect(
      getBoardLoadState({
        tasksLoading: false,
        tasksError: false,
        membersError: true,
        visibleCount: 0,
      }),
    ).toBe('error');
  });

  it('only shows empty after loading succeeds with no visible tasks', () => {
    expect(
      getBoardLoadState({
        tasksLoading: false,
        tasksError: false,
        membersError: false,
        visibleCount: 0,
      }),
    ).toBe('empty');
  });
});
