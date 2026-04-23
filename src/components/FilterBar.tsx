import { Filter, Search } from 'lucide-react';
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
    <div className="no-print sticky top-0 z-20 px-4 pb-4 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] rounded-[24px]">
        <div className="glass overflow-hidden rounded-[24px] p-3 sm:p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink-3">Ara ve süz</div>
                <div className="flex items-center gap-2">
                  {hasAdvancedFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        onSearch('');
                        onStatus('all');
                        onPriorities([]);
                      }}
                      className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] text-ink-2 transition hover:bg-surface-2 hover:text-ink"
                    >
                      filtreleri temizle
                    </button>
                  )}
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] ring-1',
                      hasFilters
                        ? 'bg-info/10 text-info ring-info/15'
                        : 'bg-surface text-ink-2 ring-line',
                    )}
                  >
                    <span className="font-semibold tabular-nums">{visibleCount}</span>
                    <span className="text-ink-3">/ {totalCount} görev</span>
                  </div>
                </div>
              </div>

              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="başlık, not veya atanana göre ara..."
                  className="w-full rounded-[16px] border border-line bg-surface py-3 pl-11 pr-16 text-sm text-ink placeholder:text-ink-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition focus:border-info/35 focus:ring-0"
                  aria-label="Ara"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-surface-2 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3">
                  filtre
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-2 xl:min-w-[560px] xl:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-ink-3">Durum</span>
                <div className="glass-soft flex flex-wrap items-center gap-1 rounded-full p-1">
                  {STATUS_TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => onStatus(t.key)}
                      className={cn(
                        'shrink-0 rounded-full px-3 py-2 text-xs font-medium transition duration-200',
                        status === t.key
                          ? 'bg-info/10 text-info'
                          : 'text-ink-2 hover:bg-surface hover:text-ink',
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-ink-3">
                  <Filter className="h-3.5 w-3.5 text-ink-2" />
                  Oncelik
                </span>
                <div className="glass-soft flex flex-wrap items-center gap-1 rounded-full p-1">
                  {PRIORITY_OPTS.map((p) => {
                    const active = priorities.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePriority(p.key)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs transition duration-200',
                          active
                            ? 'bg-surface text-ink ring-1 ring-line'
                            : 'text-ink-2 hover:bg-surface hover:text-ink',
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
