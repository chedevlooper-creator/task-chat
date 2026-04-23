// Shared types mirroring server.js serializeTask()
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in_progress' | 'done';

export interface Attachment {
  id: number;
  filename: string;
  mime: string;
  size: number;
  created_at: number;
}

export interface Task {
  id: number;
  title: string;
  day: DayKey | null;
  priority: Priority;
  status: Status;
  sort_order: number;
  notes: string;
  assignee_ids: number[];
  attachments: Attachment[];
  done: 0 | 1;
  created_at: number;
}

export interface Member {
  id: number;
  name: string;
  color: string;
  created_at: number;
}

export interface Reminder {
  id: number;
  title: string;
  body: string;
  created_at: number;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  text: string;
  created_at: number;
}

export interface Stats {
  total: number;
  done: number;
  in_progress: number;
  pending: number;
  per_day: Record<string, number>;
}

export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Pazartesi',
  tue: 'Salı',
  wed: 'Çarşamba',
  thu: 'Perşembe',
  fri: 'Cuma',
  sat: 'Cumartesi',
  sun: 'Pazar',
};
export const DAY_SHORT: Record<DayKey, string> = {
  mon: 'PZT',
  tue: 'SAL',
  wed: 'ÇAR',
  thu: 'PER',
  fri: 'CUM',
  sat: 'CMT',
  sun: 'PAZ',
};
export const DAY_DOT: Record<DayKey, string> = {
  mon: '#2563eb',
  tue: '#3b82f6',
  wed: '#0f766e',
  thu: '#0891b2',
  fri: '#64748b',
  sat: '#d97706',
  sun: '#7c3aed',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'YÜKSEK',
  medium: 'ORTA',
  low: 'DÜŞÜK',
};

export const STATUS_LABEL: Record<Status, string> = {
  pending: 'Bekliyor',
  in_progress: 'Devam Eden',
  done: 'Tamamlanan',
};
