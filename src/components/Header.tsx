import { useIsFetching } from '@tanstack/react-query';
import { Wifi, WifiOff } from 'lucide-react';
import { DAY_KEYS } from '../lib/types';
import { useStats } from '../lib/queries';
import { cn } from '../lib/utils';

function getIsoWeek(date: Date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function issueLabel(date: Date) {
  const month = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(date);
  return `HAFTA ${getIsoWeek(date)} · ${month.toLocaleUpperCase('tr-TR')} ${date.getFullYear()}`;
}

function MetricCell({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="min-h-[74px] px-3 py-3 sm:border-l sm:first:border-l-0">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-3">{label}</div>
      <div
        className={cn(
          'mt-2 font-display text-[2rem] leading-none text-ink tabular-nums',
          emphasis && 'text-accent',
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] leading-5 text-ink-3">{hint}</div>}
    </div>
  );
}

export function Header({
  totalCount,
  visibleCount,
  membersCount,
  backlogCount,
}: {
  totalCount: number;
  visibleCount: number;
  membersCount: number;
  backlogCount: number;
}) {
  const { data: stats } = useStats();
  const fetching = useIsFetching();
  const now = new Date();
  const plannedDays = DAY_KEYS.filter((day) => (stats?.per_day?.[day] ?? 0) > 0).length;
  const total = stats?.total ?? totalCount;
  const done = stats?.done ?? 0;
  const inProgress = stats?.in_progress ?? 0;
  const pending = stats?.pending ?? Math.max(total - done - inProgress, 0);
  const progress = total ? Math.round((done / total) * 100) : 0;
  const isFiltered = visibleCount !== totalCount;

  return (
    <header className="no-print relative z-10 px-4 pb-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-7">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-center justify-between border-b-2 border-t-2 border-ink py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-ink-2">
          <span>VOL. 24 · NO. 17</span>
          <span>{issueLabel(now)}</span>
        </div>

        <div className="py-5 text-center sm:py-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-ink-4">
            Task Chat · Operasyon Panosu
          </div>
          <h1 className="mt-2 font-display text-[3.2rem] italic leading-none text-ink sm:text-[5rem]">
            Haftalık Planlayıcı
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-ink-2 sm:text-sm">
            Takım görevlerini tek bir sayfada topla ve haftayı okunabilir bir düzende kur.
          </p>
        </div>

        <div className="border-b-2 border-t-2 border-ink">
          <div className="grid grid-cols-2 sm:grid-cols-5">
            <MetricCell label="Toplam görev" value={total} hint={`${plannedDays}/7 gün planlı`} />
            <MetricCell label="Tamamlanan" value={done} />
            <MetricCell label="Devam eden" value={inProgress} />
            <MetricCell label="Bekliyor" value={pending} />
            <MetricCell label="İlerleme" value={`%${progress}`} hint="tamamlandı" emphasis />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-2 px-3 py-2 text-[11px] text-ink-3">
            <span>
              {isFiltered
                ? `${visibleCount} / ${totalCount} görev görünür`
                : `${membersCount} üye · ${backlogCount} görev bekliyor`}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]',
                fetching > 0 ? 'text-warn' : 'text-ink-3',
              )}
              aria-live="polite"
            >
              {fetching > 0 ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {fetching > 0 ? 'Senkronize ediliyor' : 'Senkron'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
