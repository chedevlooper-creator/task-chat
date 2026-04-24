export type BoardLoadState = 'loading' | 'error' | 'empty' | 'ready';

export function getBoardLoadState({
  tasksLoading,
  tasksError,
  membersError,
  visibleCount,
}: {
  tasksLoading: boolean;
  tasksError: boolean;
  membersError: boolean;
  visibleCount: number;
}): BoardLoadState {
  if (tasksLoading) return 'loading';
  if (tasksError || membersError) return 'error';
  if (visibleCount === 0) return 'empty';
  return 'ready';
}
