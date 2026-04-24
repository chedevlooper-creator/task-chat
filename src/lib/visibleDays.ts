import type { BoardBucket, BoardBuckets } from './taskBoard';
import { DAY_KEYS, type DayKey } from './types';

function shouldShowDay(
  buckets: BoardBuckets,
  day: DayKey,
  activeComposer: BoardBucket | null,
) {
  return buckets[day].length > 0 || activeComposer === day;
}

export function getVisibleDayKeys(
  buckets: BoardBuckets,
  activeComposer: BoardBucket | null,
) {
  return DAY_KEYS.filter((day) => shouldShowDay(buckets, day, activeComposer));
}

export function getHiddenEmptyDayKeys(
  buckets: BoardBuckets,
  activeComposer: BoardBucket | null,
) {
  return DAY_KEYS.filter((day) => !shouldShowDay(buckets, day, activeComposer));
}
