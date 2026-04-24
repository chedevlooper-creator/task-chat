import { useIsFetching } from '@tanstack/react-query';
import { Wifi, WifiOff } from 'lucide-react';
import { DAY_KEYS } from '../lib/types';
import { useStats } from '../lib/queries';
import { cn } from '../lib/utils';
import { PAPER_THEME_KEYS, PAPER_THEMES, type PaperTheme, type PaperThemeKey } from '../lib/paperTheme';

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

function mastheadLabel(date: Date, theme: PaperTheme) {
  const week = getIsoWeek(date);
  if (theme.masthead === 'issue') return `ISSUE №${week}`;

  const year = date.getFullYear() % 100;
  const vol = year - 2;
  return `VOL. ${vol} · NO. ${week}`;
}

function MetricCell({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="min-h-[74px] border-r border-line px-4 py-4 last:border-r-0">
      <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">
        {label}
      </div>
      <div className="mt-1 font-display text-[44px] leading-none tabular-nums text-ink">
        {value}
      </div>
    </div>
  );
}

function EditionSelector({
  active,
  onChange,
}: {
  active: PaperThemeKey;
  onChange: (key: PaperThemeKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-b border-line px-3 py-3">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
        Paper & Ink
      </span>
      <div className="inline-flex flex-wrap justify-center border border-line-2 bg-surface/70 p-1" role="group" aria-label="Paper & Ink edisyonu">
        {PAPER_THEME_KEYS.map((key) => {
          const theme = PAPER_THEMES[key];
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                'tap-target min-h-10 px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.14em] transition',
                selected
                  ? 'bg-ink text-bg'
                  : 'text-ink-3 hover:bg-accent-d hover:text-accent',
              )}
              aria-pressed={selected}
            >
              {theme.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Header({
  totalCount,
  visibleCount,
  membersCount,
  backlogCount,
  paperTheme,
  themeKey,
  onThemeChange,
}: {
  totalCount: number;
  visibleCount: number;
  membersCount: number;
  backlogCount: number;
  paperTheme: PaperTheme;
  themeKey: PaperThemeKey;
  onThemeChange: (key: PaperThemeKey) => void;
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
        {/* Masthead rail */}
        <div className="grid grid-cols-1 gap-2 border-b border-ink pb-3 text-center font-mono text-[11px] tracking-[0.14em] text-ink sm:grid-cols-3 sm:items-baseline sm:text-left">
          <span>{mastheadLabel(now, paperTheme)}</span>
          <span className="justify-self-center font-bold uppercase text-accent">
            {paperTheme.edition}
          </span>
          <span className="sm:justify-self-end">{issueLabel(now)}</span>
        </div>

        {/* Title */}
        <div className="border-b border-ink py-7 text-center sm:py-8">
          <div className="font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-ink-3">
            Task Chat — Operasyon Panosu
          </div>
          <h1 className="paper-headline mt-3 font-display text-[3.2rem] leading-none text-ink sm:text-[5rem]">
            Haftalık Planlayıcı
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-sans text-xs leading-6 text-ink-2 sm:text-[13px]">
            Takım görevlerini tek bir sayfada topla ve haftayı okunabilir bir düzende kur.
          </p>
        </div>

        <EditionSelector active={themeKey} onChange={onThemeChange} />

        {/* Stats rail */}
        <div className="border-b border-ink">
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(4,1fr)_1.4fr]">
            <MetricCell label="Toplam görev" value={total} />
            <MetricCell label="Tamamlanan" value={done} />
            <MetricCell label="Devam eden" value={inProgress} />
            <MetricCell label="Bekliyor" value={pending} />
            <div className="col-span-2 px-4 py-4 sm:col-span-1">
              <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">
                İlerleme
              </div>
              <div className="mt-1 flex items-baseline gap-3">
              <div className="paper-headline font-display text-[44px] leading-none tabular-nums text-accent">
                %{progress}
              </div>
                <div className="font-sans text-[11px] text-ink-3">tamamlandı</div>
              </div>
              <div
                className="mt-3 h-[4px] bg-[color:var(--rule-thin)]"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`İlerleme: ${progress} yüzde`}
              >
                <div
                  className="h-full bg-accent transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 font-sans text-[11px] text-ink-3">
            <span>
              {isFiltered
                ? `${visibleCount} / ${totalCount} görev görünür`
                : `${membersCount} üye · ${backlogCount} görev havuzda · ${plannedDays}/7 gün planlı`}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]',
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
