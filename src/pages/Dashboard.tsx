import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Play, Flame, Trophy, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, courses } = useStore();

  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100);
  const recommendedCourse = inProgressCourses[0] || courses[0];
  const nextModule = recommendedCourse?.modules.find(m => !m.completed) || recommendedCourse?.modules[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900">
            Welcome back, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-2">You're on a {user?.streak} day learning streak. Keep it up!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommended Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-md mb-4">
                <Target className="h-3.5 w-3.5" /> Next Lesson
              </span>
              
              <h2 className="text-2xl font-bold font-heading mb-2">{recommendedCourse?.title}</h2>
              <p className="text-indigo-100 mb-8 max-w-md">
                Continue with <span className="font-semibold text-white">{nextModule?.title}</span> to master your {recommendedCourse?.language === 'ja' ? 'Japanese' : 'Korean'} skills.
              </p>
              
              <Link 
                to={`/learn/${recommendedCourse?.id}`} 
                className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <Play className="h-5 w-5 fill-current" /> Start Lesson
              </Link>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Flame className="h-7 w-7" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Current Streak</p>
                <p className="text-2xl font-bold font-heading text-slate-900">{user?.streak} Days</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total XP</p>
                <p className="text-2xl font-bold font-heading text-slate-900">{user?.xp}</p>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-heading text-slate-900">In Progress</h3>
              <Link to="/courses" className="text-indigo-600 text-sm font-medium hover:underline">View all</Link>
            </div>
            
            <div className="space-y-4">
              {inProgressCourses.map(course => (
                <div key={course.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors">
                  <img src={course.image} alt={course.title} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{course.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500">{Math.round(course.progress)}%</span>
                    </div>
                  </div>
                  <Link to={`/learn/${course.id}`} className="h-10 w-10 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-6">Recent Badges</h3>
            <div className="grid grid-cols-2 gap-4">
              {user?.badges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 p-1 mb-3 shadow-sm">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-amber-500">
                      <Trophy className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-6">Daily Goal</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * 0.7)} className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-heading text-slate-900">35</span>
                <span className="text-xs text-slate-500 font-medium">/ 50 XP</span>
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-slate-500 font-medium">You're 15 XP away from your daily goal!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
