import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, Trophy, Settings } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Courses', path: '/courses' },
  { icon: Users, label: 'Community', path: '/community' },
  { icon: Trophy, label: 'Leaderboard', path: '/community?tab=leaderboard' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-indigo-600">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight">LinguaLearn</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path.includes('?') && location.search.includes('tab=leaderboard'));
          return (
            <Link
              key={item.label}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              )}
            >
              <item.icon className={clsx("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
          <Settings className="h-5 w-5 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
