import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Calendar, StickyNote, Users } from 'lucide-react';
import { Header } from './components/Header';
import { FilterBar, type StatusFilter } from './components/FilterBar';
import { DaySection } from './components/DaySection';
import { TaskRow } from './components/TaskRow';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TeamPanel } from './components/TeamPanel';
import { RemindersPanel } from './components/RemindersPanel';
import { ChatPanel } from './components/ChatPanel';
import {
  useCreateTask,
  useMembers,
  useReorderTasks,
  useTasks,
  useUpdateTask,
} from './lib/queries';
import { DAY_KEYS, DAY_LABELS, DAY_SHORT, type DayKey, type Member, type Priority, type Status, type Task } from './lib/types';
import { cn } from './lib/utils';
import { getBoardLoadState } from './lib/boardState';
import { buildReorderItems, type BoardBucket, type BoardBuckets } from './lib/taskBoard';
import { getPaperTheme, type PaperThemeKey } from './lib/paperTheme';
import { getHiddenEmptyDayKeys, getVisibleDayKeys } from './lib/visibleDays';

type MobileView = 'week' | 'team' | 'notes';

const THEME_STORAGE_KEY = 'task-chat-paper-theme';

const dndAccessibility = {
  screenReaderInstructions: {
    draggable:
      'Taşımak için boşluk tuşuna basın. Ok tuşlarıyla konumu değiştirin. Bırakmak için tekrar boşluk tuşuna, iptal etmek için Escape tuşuna basın.',
  },
};

export default function App() {
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useTasks();
  const { data: members = [], isError: membersError, refetch: refetchMembers } = useMembers();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const reorder = useReorderTasks();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('week');
  const [activeDrag, setActiveDrag] = useState<Task | null>(null);
  const [activeComposer, setActiveComposer] = useState<BoardBucket | null>(null);
  const [themeKey, setThemeKey] = useState<PaperThemeKey>(() => {
    if (typeof window === 'undefined') return 'daily';
    return getPaperTheme(window.localStorage.getItem(THEME_STORAGE_KEY)).key;
  });
  const paperTheme = useMemo(() => getPaperTheme(themeKey), [themeKey]);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(paperTheme.tokens).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
    root.dataset.paperTheme = paperTheme.key;
    root.style.colorScheme = paperTheme.colorScheme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, paperTheme.key);
    } catch {}
  }, [paperTheme]);

  const membersById = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m])) as Record<number, Member>,
    [members],
  );

  // Filter + bucketize
  const buckets = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = (tasks as Task[]).filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (priorities.length > 0 && !priorities.includes(t.priority)) return false;
      if (!q) return true;
      const hay =
        t.title.toLowerCase() +
        ' ' +
        (t.notes || '').toLowerCase() +
        ' ' +
        t.assignee_ids.map((id) => membersById[id]?.name.toLowerCase() || '').join(' ');
      return hay.includes(q);
    });
    const acc: BoardBuckets = {
      mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [], backlog: [],
    };
    for (const t of filtered) {
      const key = (t.day ?? 'backlog') as BoardBucket;
      acc[key].push(t);
    }
    for (const k of Object.keys(acc) as BoardBucket[]) {
      acc[k].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }
    return acc;
  }, [tasks, search, status, priorities, membersById]);

  const openTask = openId != null ? (tasks as Task[]).find((t) => t.id === openId) ?? null : null;
  const totalCount = (tasks as Task[]).length;
  const visibleCount = DAY_KEYS.reduce((sum, day) => sum + buckets[day].length, buckets.backlog.length);
  const backlogCount = buckets.backlog.length;
  const visibleDayKeys = useMemo(
    () => getVisibleDayKeys(buckets, activeComposer),
    [buckets, activeComposer],
  );
  const hiddenEmptyDayKeys = useMemo(
    () => getHiddenEmptyDayKeys(buckets, activeComposer),
    [buckets, activeComposer],
  );
  const hasOpenComposer = activeComposer !== null;
  const showBacklog = backlogCount > 0 || activeComposer === 'backlog';
  const hasActiveFilters = search.trim().length > 0 || status !== 'all' || priorities.length > 0;
  const boardLoadState = getBoardLoadState({
    tasksLoading,
    tasksError,
    membersError,
    visibleCount: visibleCount + (hasOpenComposer ? 1 : 0),
  });

  const onToggleStatus = (id: number, next: Status) => {
    updateTask.mutate({ id, patch: { status: next } });
  };

  const onCreate = (title: string, day: DayKey | null) => {
    createTask.mutate({ title, day });
  };

  // ---------- Drag & Drop ----------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (e: DragStartEvent) => {
    const id = Number(e.active.id);
    const t = (tasks as Task[]).find((x) => x.id === id) || null;
    setActiveDrag(t);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;

    const items = buildReorderItems({
      buckets,
      tasks: tasks as Task[],
      activeId: active.id,
      overId: over.id,
    });
    if (items.length === 0) return;
    reorder.mutate(items);
  };

  // ---------- Render ----------
  return (
    <div className="relative min-h-screen overflow-hidden pb-32" data-paper-theme={paperTheme.key}>
      <a href="#main" className="skip-link">
        İçeriğe geç
      </a>

      <div className="relative z-10">
      <Header
        totalCount={totalCount}
        visibleCount={visibleCount}
        membersCount={members.length}
        backlogCount={backlogCount}
        paperTheme={paperTheme}
        themeKey={themeKey}
        onThemeChange={setThemeKey}
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        priorities={priorities}
        onPriorities={setPriorities}
        totalCount={totalCount}
        visibleCount={visibleCount}
      />

      <main id="main" className="relative z-10 px-4 pb-10 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Week grid */}
          <div className={cn(mobileView === 'week' ? 'block' : 'hidden lg:block')}>
            {boardLoadState === 'loading' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3" aria-busy="true" aria-live="polite">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DaySkeleton key={i} />
                ))}
              </div>
            ) : boardLoadState === 'error' ? (
              <section className="border-2 border-ink bg-surface p-10 text-center" aria-live="assertive">
                <h2 className="font-display text-xl font-semibold text-ink">Bir şeyler yanlış gitti</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-2">
                  Görevler veya takım bilgileri yüklenemedi. Bağlantıyı kontrol edip tekrar deneyebilirsin.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void refetchTasks();
                    void refetchMembers();
                  }}
                  className="mt-5 bg-accent px-4 py-2 text-xs font-semibold text-bg transition hover:bg-accent-2"
                >
                  Yeniden dene
                </button>
              </section>
            ) : boardLoadState === 'empty' ? (
              <section className="border-2 border-ink bg-surface p-10 text-center">
                <h2 className="font-display text-xl font-semibold text-ink">Gösterilecek görev yok</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-2">
                  {hasActiveFilters
                    ? 'Arama ve filtre kriterleri sonuç vermiyor. Filtreleri gevşeterek tekrar deneyebilirsin.'
                    : 'Henüz görev eklenmemiş. Aşağıdan bir gün açıp ilk görevi ekleyebilirsin.'}
                </p>
                {!hasActiveFilters && (
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {DAY_KEYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setActiveComposer(day)}
                        className="tap-target border border-line-2 bg-surface/70 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 transition hover:border-accent/60 hover:bg-accent-d hover:text-accent"
                        aria-label={`${DAY_LABELS[day]} gününü aç ve ilk görevi ekle`}
                      >
                        {DAY_SHORT[day]}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              accessibility={dndAccessibility}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <section aria-labelledby="week-board-title">
                <h2 id="week-board-title" className="sr-only">
                  Haftalık görevler
                </h2>
                <div className="grid grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-2 2xl:grid-cols-3">
                  {visibleDayKeys.map((d) => (
                    <DaySection
                      key={d}
                      dayKey={d}
                      tasks={buckets[d]}
                      membersById={membersById}
                      onCreate={onCreate}
                      onToggleStatus={onToggleStatus}
                      onOpenTask={setOpenId}
                      adding={activeComposer === d}
                      onAddingChange={(open) => setActiveComposer(open ? d : null)}
                    />
                  ))}
                </div>
                {hiddenEmptyDayKeys.length > 0 && (
                  <div className="mt-6 border-t border-line pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                        Boş gün aç
                      </span>
                      {hiddenEmptyDayKeys.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setActiveComposer(day)}
                          className="tap-target border border-line bg-surface/55 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 transition hover:border-accent/60 hover:bg-accent-d hover:text-accent"
                          aria-label={`${DAY_LABELS[day]} gününü aç ve görev ekle`}
                        >
                          {DAY_SHORT[day]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {showBacklog && (
                <section
                  className="mt-8 border border-ink bg-[color:var(--paper-tint)] p-4 pt-3"
                  aria-labelledby="backlog-board-title"
                >
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
                    <div>
                      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">
                        Backlog
                      </p>
                      <div className="paper-headline mt-1 font-display text-2xl text-ink">
                        {backlogCount} görev
                      </div>
                      <h2 id="backlog-board-title" className="sr-only">
                        Bekleyen görev havuzu
                      </h2>
                    </div>
                    <p className="max-w-md font-sans text-xs leading-6 text-ink-2">
                      Henüz haftaya yerleştirilmeyen işleri burada tut.
                    </p>
                  </div>
                  <DaySection
                    dayKey="backlog"
                    title="Bekleyenler"
                    tasks={buckets.backlog}
                    membersById={membersById}
                    onCreate={onCreate}
                    onToggleStatus={onToggleStatus}
                    onOpenTask={setOpenId}
                    adding={activeComposer === 'backlog'}
                    onAddingChange={(open) => setActiveComposer(open ? 'backlog' : null)}
                  />
                </section>
              )}

              <DragOverlay>
                {activeDrag ? (
                  <div className="opacity-95 shadow-pop">
                    <TaskRow
                      task={activeDrag}
                      membersById={membersById}
                      onToggleStatus={() => {}}
                      onOpen={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            )}
          </div>

          {/* Side panels */}
          <aside
            className={cn(
              'flex flex-col gap-7 border-t-2 border-ink pt-3 lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-t-0 lg:border-line lg:pl-5',
              mobileView === 'week' && 'hidden lg:flex',
              mobileView === 'team' && 'flex lg:flex',
              mobileView === 'notes' && 'flex lg:flex',
            )}
            aria-label="Yan paneller"
          >
            {mobileView !== 'week' && (
              <div className="border border-line bg-surface/70 px-3 py-2 font-sans text-xs text-ink-2 lg:hidden">
                {mobileView === 'team' ? 'Takım görünümü açık' : 'Notlar görünümü açık'}
              </div>
            )}
            <div className={cn(mobileView === 'notes' && 'hidden lg:block')}>
              <TeamPanel />
            </div>
            <div className={cn(mobileView === 'team' && 'hidden lg:block')}>
              <RemindersPanel />
            </div>
          </aside>
        </div>
      </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="no-print fixed bottom-4 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-[520px] -translate-x-1/2 pb-safe lg:hidden">
        <div className="grid grid-cols-3 border-2 border-ink bg-surface p-1">
          <NavBtn active={mobileView === 'week'} onClick={() => setMobileView('week')} icon={<Calendar className="h-5 w-5" />} label="Hafta" />
          <NavBtn active={mobileView === 'team'} onClick={() => setMobileView('team')} icon={<Users className="h-5 w-5" />} label="Takım" />
          <NavBtn active={mobileView === 'notes'} onClick={() => setMobileView('notes')} icon={<StickyNote className="h-5 w-5" />} label="Notlar" />
        </div>
      </nav>

      {openTask && (
        <TaskDetailModal
          task={openTask}
          members={members}
          onClose={() => setOpenId(null)}
        />
      )}

      <ChatPanel />
    </div>
  );
}

function DaySkeleton() {
  return (
    <section className="overflow-hidden border-t-2 border-ink">
      <header className="flex items-center gap-3 border-b border-line px-1 py-4">
        <div className="h-10 w-10 bg-surface-3" />
        <div className="space-y-2">
          <div className="shimmer h-3 w-24 bg-surface-3" />
          <div className="h-2 w-12 bg-surface-4" />
        </div>
        <div className="ml-auto h-8 w-20 bg-surface-3" />
      </header>
      <div className="space-y-2.5 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-20 bg-surface-3" />
        ))}
      </div>
    </section>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'tap-target flex flex-col items-center justify-center gap-1 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition duration-200',
        active
          ? 'bg-ink text-bg'
          : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
      )}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}
