import { useIsFetching } from '@tanstack/react-query';
import {
  CheckCircle2,
  Circle,
  ListTodo,
  PlayCircle,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { DAY_KEYS } from '../lib/types';
import { useStats } from '../lib/queries';
import { cn } from '../lib/utils';

function MetricCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ReactNode;
  tone: 'ink' | 'info' | 'accent';
}) {
  const toneClasses =
    tone === 'accent'
      ? {
          value: 'text-accent',
          iconWrap: 'bg-accent/10 text-accent ring-accent/15',
        }
      : tone === 'info'
        ? {
            value: 'text-info',
            iconWrap: 'bg-info/10 text-info ring-info/15',
          }
        : {
            value: 'text-ink',
            iconWrap: 'bg-surface-2 text-ink-2 ring-line',
          };

  return (
    <div className="glass-soft hover-lift rounded-[22px] px-4 py-4">
      <div
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-2xl ring-1',
          toneClasses.iconWrap,
        )}
      >
        {icon}
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink-3">{label}</div>
      <div className={cn('mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums sm:text-[28px]', toneClasses.value)}>
        {value}
      </div>
      <div className="mt-1 text-xs leading-6 text-ink-2">{hint}</div>
    </div>
  );
}

function PulseStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone: 'ink' | 'info' | 'accent';
}) {
  const color =
    tone === 'accent' ? 'text-accent' : tone === 'info' ? 'text-info' : 'text-ink-2';

  return (
    <div className="glass-soft rounded-[18px] px-3 py-2.5">
      <div className={cn('flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em]', color)}>
        {icon}
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums text-ink">{value}</div>
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
  const plannedDays = DAY_KEYS.filter((day) => (stats?.per_day?.[day] ?? 0) > 0).length;
  const progress = stats?.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const isFiltered = visibleCount !== totalCount;

  return (
    <header className="no-print relative z-10 px-4 pb-5 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[26px]">
        <div className="glass-strong grid overflow-hidden lg:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="border-b border-line px-5 py-6 sm:px-6 lg:border-b-0 lg:border-r lg:px-7">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-ink-3">
              <span className="section-chip">Task Chat</span>
              <span className="section-chip">Operasyon panosu</span>
              {isFiltered && (
                <span className="section-chip">
                  {visibleCount} gorev gorunur
                </span>
              )}
            </div>

            <div className="mt-6 flex items-start gap-4 sm:gap-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-line bg-surface-2 text-[13px] font-semibold text-info">
                TC
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[3rem]">
                  Haftalik Planlayici
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-2 sm:text-base">
                  Takim gorevlerini tek bir ekranda planla, onceliklendir ve haftalik is yukunu okunabilir bir duzende takip et.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Toplam gorev"
                value={stats?.total ?? totalCount}
                hint={`${plannedDays}/7 gun planli`}
                icon={<ListTodo className="h-4 w-4" />}
                tone="ink"
              />
              <MetricCard
                label="Bu gorunum"
                value={visibleCount}
                hint={isFiltered ? `toplam ${totalCount} gorevden suzuluyor` : 'Filtre yok'}
                icon={<Circle className="h-4 w-4" />}
                tone="info"
              />
              <MetricCard
                label="Takım / backlog"
                value={membersCount}
                hint={`${backlogCount} gorev bekliyor`}
                icon={<Users className="h-4 w-4" />}
                tone="accent"
              />
            </div>
          </div>

          <div className="px-5 py-6 sm:px-6 lg:px-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink-3">Hafta ozeti</div>
                <div className="mt-1 font-display text-xl font-semibold text-ink">{progress}% tamamlandi</div>
                <div className="mt-1 text-xs leading-6 text-ink-2">
                  {stats?.done ?? 0} tamamlanan, {stats?.in_progress ?? 0} aktif is
                </div>
              </div>
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] ring-1',
                  fetching > 0
                    ? 'bg-warn/10 text-warn ring-warn/20'
                    : 'bg-surface text-ink-2 ring-line',
                )}
                aria-live="polite"
              >
                {fetching > 0 ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                {fetching > 0 ? 'Senkronize ediliyor' : 'Senkron'}
              </div>
            </div>

            <div className="glass-soft mt-4 rounded-[22px] p-4">
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-4"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Haftalik tamamlanma ${progress}%`}
              >
                <div
                  className="h-full rounded-full bg-info transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <PulseStat
                  label="Bekliyor"
                  value={stats?.pending ?? 0}
                  icon={<Circle className="h-3.5 w-3.5" />}
                  tone="ink"
                />
                <PulseStat
                  label="Devam"
                  value={stats?.in_progress ?? 0}
                  icon={<PlayCircle className="h-3.5 w-3.5" />}
                  tone="info"
                />
                <PulseStat
                  label="Tamam"
                  value={stats?.done ?? 0}
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  tone="accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
