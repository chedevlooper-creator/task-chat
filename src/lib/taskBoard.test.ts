import { describe, expect, it } from 'vitest';
import { buildReorderItems, type BoardBuckets } from './taskBoard';
import type { DayKey, Task } from './types';

function makeTask(id: number, day: DayKey | null, sortOrder: number): Task {
  return {
    id,
    title: `Task ${id}`,
    day,
    priority: 'medium',
    status: 'pending',
    sort_order: sortOrder,
    notes: '',
    assignee_ids: [],
    attachments: [],
    done: 0,
    created_at: id,
  };
}

function emptyBuckets(): BoardBuckets {
  return {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
    backlog: [],
  };
}

describe('buildReorderItems', () => {
  it('moves a task across buckets without mutating cached task objects', () => {
    const monday = makeTask(1, 'mon', 0);
    const tuesday = makeTask(2, 'tue', 0);
    const buckets = emptyBuckets();
    buckets.mon = [monday];
    buckets.tue = [tuesday];

    const items = buildReorderItems({
      buckets,
      tasks: [monday, tuesday],
      activeId: 1,
      overId: 'drop-tue',
    });

    expect(monday.day).toBe('mon');
    expect(tuesday.day).toBe('tue');
    expect(items).toEqual([
      { id: 2, day: 'tue', sort_order: 0 },
      { id: 1, day: 'tue', sort_order: 1 },
    ]);
  });

  it('reorders within a bucket using new sort orders', () => {
    const first = makeTask(1, 'mon', 0);
    const second = makeTask(2, 'mon', 1);
    const third = makeTask(3, 'mon', 2);
    const buckets = emptyBuckets();
    buckets.mon = [first, second, third];

    const items = buildReorderItems({
      buckets,
      tasks: [first, second, third],
      activeId: 3,
      overId: 1,
    });

    expect(items).toEqual([
      { id: 3, day: 'mon', sort_order: 0 },
      { id: 1, day: 'mon', sort_order: 1 },
      { id: 2, day: 'mon', sort_order: 2 },
    ]);
  });

  it('moves a task downward within a bucket to the target position', () => {
    const first = makeTask(1, 'mon', 0);
    const second = makeTask(2, 'mon', 1);
    const third = makeTask(3, 'mon', 2);
    const buckets = emptyBuckets();
    buckets.mon = [first, second, third];

    const items = buildReorderItems({
      buckets,
      tasks: [first, second, third],
      activeId: 1,
      overId: 3,
    });

    expect(items).toEqual([
      { id: 2, day: 'mon', sort_order: 0 },
      { id: 3, day: 'mon', sort_order: 1 },
      { id: 1, day: 'mon', sort_order: 2 },
    ]);
  });
});
