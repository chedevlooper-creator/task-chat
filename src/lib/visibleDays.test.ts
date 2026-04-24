import { describe, expect, it } from 'vitest';
import type { BoardBuckets } from './taskBoard';
import type { Task } from './types';
import { getVisibleDayKeys, getHiddenEmptyDayKeys } from './visibleDays';

function makeTask(id: number, day: Task['day']): Task {
  return {
    id,
    title: `Task ${id}`,
    day,
    priority: 'medium',
    status: 'pending',
    sort_order: id,
    notes: '',
    assignee_ids: [],
    attachments: [],
    done: 0,
    created_at: Date.now(),
  };
}

function buckets(overrides: Partial<BoardBuckets> = {}): BoardBuckets {
  return {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
    backlog: [],
    ...overrides,
  };
}

describe('visible day helpers', () => {
  it('shows only days with tasks by default', () => {
    const board = buckets({
      mon: [makeTask(1, 'mon')],
      fri: [makeTask(2, 'fri')],
      backlog: [makeTask(3, null)],
    });

    expect(getVisibleDayKeys(board, null)).toEqual(['mon', 'fri']);
    expect(getHiddenEmptyDayKeys(board, null)).toEqual(['tue', 'wed', 'thu', 'sat', 'sun']);
  });

  it('also shows an empty day while its composer is open', () => {
    const board = buckets({ mon: [makeTask(1, 'mon')] });

    expect(getVisibleDayKeys(board, 'wed')).toEqual(['mon', 'wed']);
    expect(getHiddenEmptyDayKeys(board, 'wed')).toEqual(['tue', 'thu', 'fri', 'sat', 'sun']);
  });
});
