import { beforeEach, describe, expect, it, vi } from 'vitest';

const reactQuery = vi.hoisted(() => ({
  useMutation: vi.fn((config) => config),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => reactQuery);

import { keys, useReorderTasks } from './queries';

describe('useReorderTasks', () => {
  beforeEach(() => {
    reactQuery.useMutation.mockClear();
    reactQuery.useQueryClient.mockReset();
  });

  it('invalidates tasks and stats after reorder settles', () => {
    const queryClient = { invalidateQueries: vi.fn() };
    reactQuery.useQueryClient.mockReturnValue(queryClient);

    const mutation = useReorderTasks() as unknown as { onSettled: () => void };
    mutation.onSettled();

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: keys.tasks });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: keys.stats });
  });
});
