import { useMemo, useState } from 'react';
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
import { DAY_KEYS, type DayKey, type Member, type Priority, type Status, type Task } from './lib/types';
import { cn } from './lib/utils';

type DayBucket = DayKey | 'backlog';
type MobileView = 'week' | 'team' | 'notes';

export default function App() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: members = [] } = useMembers();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const reorder = useReorderTasks();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('week');
  const [activeDrag, setActiveDrag] = useState<Task | null>(null);

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
    const acc: Record<DayBucket, Task[]> = {
      mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [], backlog: [],
    };
    for (const t of filtered) {
      const key = (t.day ?? 'backlog') as DayBucket;
      acc[key].push(t);
    }
    for (const k of Object.keys(acc) as DayBucket[]) {
      acc[k].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }
    return acc;
  }, [tasks, search, status, priorities, membersById]);

  const openTask = openId != null ? (tasks as Task[]).find((t) => t.id === openId) ?? null : null;
  const totalCount = (tasks as Task[]).length;
  const visibleCount = DAY_KEYS.reduce((sum, day) => sum + buckets[day].length, buckets.backlog.length);
  const backlogCount = buckets.backlog.length;
  const hasActiveFilters = search.trim().length > 0 || status !== 'all' || priorities.length > 0;
  const noVisibleTasks = !tasksLoading && visibleCount === 0;

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

  const resolveBucket = (id: string | number | null): DayBucket | null => {
    if (id == null) return null;
    const s = String(id);
    if (s.startsWith('drop-')) return s.slice(5) as DayBucket;
    const n = Number(s);
    const t = (tasks as Task[]).find((x) => x.id === n);
    return (t?.day ?? 'backlog') as DayBucket;
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = Number(active.id);
    const fromBucket = resolveBucket(activeId);
    const toBucket = resolveBucket(over.id);
    if (!fromBucket || !toBucket) return;

    const fromList = [...buckets[fromBucket]];
    const toList = fromBucket === toBucket ? fromList : [...buckets[toBucket]];

    const activeIdx = fromList.findIndex((t) => t.id === activeId);
    if (activeIdx === -1) return;
    const [moved] = fromList.splice(activeIdx, 1);
    const targetDay = toBucket === 'backlog' ? null : toBucket;
    moved.day = targetDay;

    let insertAt: number;
    if (String(over.id).startsWith('drop-')) {
      insertAt = toList.length;
    } else {
      insertAt = toList.findIndex((t) => t.id === Number(over.id));
      if (insertAt === -1) insertAt = toList.length;
    }
    if (fromBucket === toBucket) {
      toList.splice(insertAt, 0, moved);
    } else {
      toList.splice(insertAt, 0, moved);
    }

    const items: { id: number; day: string | null; sort_order: number }[] = [];
    toList.forEach((t, idx) => items.push({ id: t.id, day: targetDay, sort_order: idx }));
    if (fromBucket !== toBucket) {
      fromList.forEach((t, idx) =>
        items.push({
          id: t.id,
          day: fromBucket === 'backlog' ? null : (fromBucket as DayKey),
          sort_order: idx,
        }),
      );
    }
    reorder.mutate(items);
  };

  // ---------- Render ----------
  return (
    <div className="relative min-h-screen overflow-hidden pb-32">
      <a href="#main" className="skip-link">
        Icerige gec
      </a>

      <div className="relative z-10">
      <Header
        totalCount={totalCount}
        visibleCount={visibleCount}
        membersCount={members.length}
        backlogCount={backlogCount}
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

      <main id="main" className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Week grid */}
          <div className={cn(mobileView === 'week' ? 'block' : 'hidden lg:block')}>
            {tasksLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3" aria-busy="true" aria-live="polite">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DaySkeleton key={i} />
                ))}
              </div>
            ) : noVisibleTasks ? (
              <section className="glass-strong rounded-[24px] p-10 text-center">
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Gosterilecek gorev yok</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink-2">
                  {hasActiveFilters
                    ? 'Arama ve filtre kriterleri sonuc vermiyor. Filtreleri gevseterek tekrar deneyebilirsin.'
                    : 'Henuz gorev eklenmemis. Gun kutularindan birine yeni gorev ekleyerek baslayabilirsin.'}
                </p>
              </section>
            ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {DAY_KEYS.map((d) => (
                  <DaySection
                    key={d}
                    dayKey={d}
                    tasks={buckets[d]}
                    membersById={membersById}
                    onCreate={onCreate}
                    onToggleStatus={onToggleStatus}
                    onOpenTask={setOpenId}
                  />
                ))}
                <DaySection
                  dayKey="backlog"
                  tasks={buckets.backlog}
                  membersById={membersById}
                  onCreate={onCreate}
                  onToggleStatus={onToggleStatus}
                  onOpenTask={setOpenId}
                  defaultCollapsed={buckets.backlog.length === 0}
                />
              </div>

              <DragOverlay>
                {activeDrag ? (
                  <div className="rounded-[24px] opacity-95 shadow-pop">
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
              'space-y-5',
              mobileView === 'week' && 'hidden lg:block',
              mobileView === 'team' && 'block lg:block',
              mobileView === 'notes' && 'block lg:block',
            )}
            aria-label="Yan paneller"
          >
            {mobileView !== 'week' && (
              <div className="glass-soft rounded-[18px] px-3 py-2 text-xs text-ink-2 lg:hidden">
                {mobileView === 'team' ? 'Takim gorunumu acik' : 'Notlar gorunumu acik'}
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
        <div className="glass-strong grid grid-cols-3 rounded-[18px] p-1.5">
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
    <section className="glass overflow-hidden rounded-[24px]">
      <header className="flex items-center gap-3 border-b border-line px-4 py-4">
        <div className="h-10 w-10 rounded-2xl bg-surface-3" />
        <div className="space-y-2">
          <div className="shimmer h-3 w-24 rounded-full bg-surface-3" />
          <div className="h-2 w-12 rounded-full bg-surface-4" />
        </div>
        <div className="ml-auto h-8 w-20 rounded-full bg-surface-3" />
      </header>
      <div className="space-y-2.5 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-20 rounded-[18px] bg-surface-3" />
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
        'tap-target flex flex-col items-center justify-center gap-1 rounded-[22px] px-3 py-2.5 text-[11px] font-medium transition duration-200',
        active
          ? 'bg-info/10 text-info'
          : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
      )}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}
