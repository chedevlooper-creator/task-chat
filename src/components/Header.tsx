import { Bell, Search, User, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header() {
  const { user } = useStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative hidden md:block w-64 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, users..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
          <span className="text-sm font-bold text-indigo-700">{user?.xp || 0}</span>
          <span className="text-xs text-indigo-500 font-medium uppercase tracking-wider">XP</span>
        </div>

        <button className="relative text-slate-400 hover:text-indigo-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{user?.name || 'Guest'}</span>
            <span className="text-xs text-slate-500 font-medium capitalize">{user?.level || 'Beginner'}</span>
          </div>
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="h-10 w-10 rounded-full border-2 border-white shadow-sm ring-2 ring-indigo-50" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm ring-2 ring-indigo-50">
              <User className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
