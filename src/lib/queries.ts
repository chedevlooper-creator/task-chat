import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ChatMessage, Member, Reminder, Stats, Task } from './types';

export const keys = {
  tasks: ['tasks'] as const,
  members: ['members'] as const,
  reminders: ['reminders'] as const,
  stats: ['stats'] as const,
  messages: ['messages'] as const,
};

// ---------- Tasks ----------
export function useTasks() {
  return useQuery({ queryKey: keys.tasks, queryFn: () => api.get<Task[]>('/api/tasks') });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Task>) => api.post<Task>('/api/tasks', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.tasks });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Task> }) =>
      api.patch<Task>(`/api/tasks/${id}`, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: keys.tasks });
      const prev = qc.getQueryData<Task[]>(keys.tasks);
      if (prev) {
        qc.setQueryData<Task[]>(
          keys.tasks,
          prev.map((t) => (t.id === id ? { ...t, ...patch } as Task : t)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.tasks, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.tasks });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.tasks });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: number; day: string | null; sort_order: number }[]) =>
      api.post('/api/tasks/reorder', { items }),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.tasks }),
  });
}

// ---------- Members ----------
export function useMembers() {
  return useQuery({ queryKey: keys.members, queryFn: () => api.get<Member[]>('/api/members') });
}
export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { name: string; color: string }) => api.post<Member>('/api/members', p),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.members }),
  });
}
export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Member> }) =>
      api.patch<Member>(`/api/members/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.members }),
  });
}
export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/members/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.members });
      qc.invalidateQueries({ queryKey: keys.tasks });
    },
  });
}

// ---------- Reminders ----------
export function useReminders() {
  return useQuery({ queryKey: keys.reminders, queryFn: () => api.get<Reminder[]>('/api/reminders') });
}
export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { title: string; body?: string }) => api.post<Reminder>('/api/reminders', p),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.reminders }),
  });
}
export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/reminders/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.reminders }),
  });
}

// ---------- Stats ----------
export function useStats() {
  return useQuery({ queryKey: keys.stats, queryFn: () => api.get<Stats>('/api/stats') });
}

// ---------- Chat ----------
export function useMessages() {
  return useQuery({ queryKey: keys.messages, queryFn: () => api.get<ChatMessage[]>('/api/messages') });
}
export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.post<{ reply: string; code?: number }>('/api/chat', { text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.messages });
      qc.invalidateQueries({ queryKey: keys.tasks });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

// ---------- Attachments ----------
export function useUploadAttachments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, files }: { taskId: number; files: File[] }) =>
      api.upload(`/api/tasks/${taskId}/attachments`, files),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.tasks }),
  });
}
export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/attachments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.tasks }),
  });
}
