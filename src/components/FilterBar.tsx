import { Search } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Priority, Status } from '../lib/types';

export type StatusFilter = 'all' | Status;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Bekliyor' },
  { key: 'in_progress', label: 'Devam' },
  { key: 'done', label: 'Tamamlanan' },
];

const PRIORITY_OPTS: { key: Priority; label: string; color: string }[] = [
  { key: 'high', label: 'Yüksek', color: 'bg-danger' },
  { key: 'medium', label: 'Orta', color: 'bg-warn' },
  { key: 'low', label: 'Düşük', color: 'bg-ink-3' },
];

export function FilterBar({
  search,
  onSearch,
  status,
  onStatus,
  priorities,
  onPriorities,
  visibleCount,
  totalCount,
}: {
  search: string;
  onSearch: (v: string) => void;
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  priorities: Priority[];
  onPriorities: (p: Priority[]) => void;
  visibleCount: number;
  totalCount: number;
}) {
  const togglePriority = (p: Priority) => {
    onPriorities(priorities.includes(p) ? priorities.filter((x) => x !== p) : [...priorities, p]);
  };

  const hasFilters = visibleCount !== totalCount || search.trim().length > 0;
  const hasAdvancedFilters = status !== 'all' || priorities.length > 0 || search.trim().length > 0;

  return (
    <div className="no-print sticky top-0 z-20 border-y border-line bg-[color:var(--paper)] px-4 py-2 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div>
          <div className="flex flex-col gap-1.5 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:flex sm:gap-3">
              <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.24em] text-ink-2 sm:inline">
                Ara
              </span>
              <label className="relative min-w-0 flex-1 xl:max-w-[520px]">
                <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Görevlerde ara"
                  className="h-8 w-full border-0 border-b border-line bg-transparent py-1.5 pl-6 pr-2 text-sm text-ink placeholder:text-ink-3 transition focus:border-accent focus:ring-0"
                  aria-label="Görevlerde ara"
                />
              </label>
              <span
                className={cn(
                  'shrink-0 border-l border-line-2 pl-3 text-[11px] tabular-nums',
                  hasFilters ? 'font-bold text-accent' : 'text-ink-3',
                )}
              >
                {visibleCount} / {totalCount} görev
              </span>
              {hasAdvancedFilters && (
                <button
                  type="button"
                  onClick={() => {
                    onSearch('');
                    onStatus('all');
                    onPriorities([]);
                  }}
                  className="col-span-2 justify-self-start text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 underline decoration-line-2 underline-offset-4 transition hover:text-accent sm:col-auto sm:justify-self-auto"
                >
                  Temizle
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 xl:justify-end">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-2">Durum</span>
                <div className="control-surface inline-flex flex-wrap items-center gap-1 p-1" role="group" aria-label="Durum filtresi">
                  {STATUS_TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => onStatus(t.key)}
                      className={cn(
                        'tap-target shrink-0 border px-2.5 py-1.5 text-xs font-bold transition duration-200',
                        status === t.key
                          ? 'border-accent/35 bg-accent-d text-accent'
                          : 'border-transparent text-ink-2 hover:border-line-2 hover:bg-surface-2 hover:text-ink',
                      )}
                      aria-pressed={status === t.key}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-2">Öncelik</span>
                <div className="control-surface inline-flex flex-wrap items-center gap-1 p-1" role="group" aria-label="Öncelik filtresi">
                  {PRIORITY_OPTS.map((p) => {
                    const active = priorities.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePriority(p.key)}
                        className={cn(
                          'tap-target inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-bold transition duration-200',
                          active
                            ? 'border-accent/35 bg-accent-d text-accent'
                            : 'border-transparent text-ink-2 hover:border-line-2 hover:bg-surface-2 hover:text-ink',
                        )}
                        aria-pressed={active}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', p.color)} />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
