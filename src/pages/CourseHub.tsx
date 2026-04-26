import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseHub() {
  const { courses } = useStore();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredCourses = courses.filter(c => {
    if (filter !== 'all' && c.language !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'ja', label: 'Japanese' },
    { id: 'ko', label: 'Korean' },
    { id: 'en', label: 'English' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold font-heading mb-4">Course Catalog</h1>
          <p className="text-indigo-100 text-lg">
            Discover new languages or continue your learning journey. Choose from our expert-crafted curriculum designed for fluency.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => setFilter(lang.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === lang.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col"
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                  {course.language}
                </span>
                <span className="px-3 py-1 bg-indigo-600/80 backdrop-blur-md text-white text-xs font-semibold rounded-full capitalize">
                  {course.level}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">{course.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">{course.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  <span>{course.modules.length} Modules</span>
                </div>
                
                <Link 
                  to={`/learn/${course.id}`}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Play className="h-4 w-4 fill-current" /> {course.progress > 0 ? 'Continue' : 'Start'}
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20">
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">No courses found</h3>
          <p className="text-slate-500">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}
