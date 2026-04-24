import { DAY_KEYS, type DayKey, type Task } from './types';

export type BoardBucket = DayKey | 'backlog';
export type BoardBuckets = Record<BoardBucket, Task[]>;
export type ReorderItem = { id: number; day: string | null; sort_order: number };

const BOARD_BUCKETS = [...DAY_KEYS, 'backlog'] as const;

function isBoardBucket(value: string): value is BoardBucket {
  return (BOARD_BUCKETS as readonly string[]).includes(value);
}

function resolveBucket(id: string | number | null, tasks: Task[]): BoardBucket | null {
  if (id == null) return null;

  const idText = String(id);
  if (idText.startsWith('drop-')) {
    const bucket = idText.slice(5);
    return isBoardBucket(bucket) ? bucket : null;
  }

  const taskId = Number(idText);
  if (!Number.isFinite(taskId)) return null;

  const task = tasks.find((item) => item.id === taskId);
  if (!task) return null;

  return task.day ?? 'backlog';
}

export function buildReorderItems({
  buckets,
  tasks,
  activeId,
  overId,
}: {
  buckets: BoardBuckets;
  tasks: Task[];
  activeId: string | number;
  overId: string | number | null;
}): ReorderItem[] {
  const activeTaskId = Number(activeId);
  if (!Number.isFinite(activeTaskId)) return [];
  if (String(overId) === String(activeTaskId)) return [];

  const fromBucket = resolveBucket(activeTaskId, tasks);
  const toBucket = resolveBucket(overId, tasks);
  if (!fromBucket || !toBucket) return [];

  const fromIds = buckets[fromBucket].map((task) => task.id);
  const toIds = fromBucket === toBucket ? fromIds : buckets[toBucket].map((task) => task.id);

  const activeIndex = fromIds.indexOf(activeTaskId);
  if (activeIndex === -1) return [];

  const [movedId] = fromIds.splice(activeIndex, 1);

  let insertAt: number;
  if (String(overId).startsWith('drop-')) {
    insertAt = toIds.length;
  } else {
    insertAt = toIds.indexOf(Number(overId));
    if (insertAt === -1) insertAt = toIds.length;
  }

  toIds.splice(insertAt, 0, movedId);

  const targetDay = toBucket === 'backlog' ? null : toBucket;
  const items: ReorderItem[] = toIds.map((id, index) => ({
    id,
    day: targetDay,
    sort_order: index,
  }));

  if (fromBucket !== toBucket) {
    const sourceDay = fromBucket === 'backlog' ? null : fromBucket;
    items.push(
      ...fromIds.map((id, index) => ({
        id,
        day: sourceDay,
        sort_order: index,
      })),
    );
  }

  return items;
}
