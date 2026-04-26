import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, MessageCircle, Heart, Share2, Flame } from 'lucide-react';
import { mockCommunityPosts } from '../mock/data';

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'feed');

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'feed');
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    setActiveTab(tab);
  };

  const leaderboardData = [
    { rank: 1, name: 'Emma_Lang', xp: 12450, avatar: 'https://i.pravatar.cc/150?img=20', streak: 30 },
    { rank: 2, name: 'Alex Learner', xp: 11200, avatar: 'https://i.pravatar.cc/150?img=11', streak: 12 },
    { rank: 3, name: 'Sarah', xp: 10800, avatar: 'https://i.pravatar.cc/150?img=5', streak: 45 },
    { rank: 4, name: 'David M.', xp: 9500, avatar: 'https://i.pravatar.cc/150?img=12', streak: 8 },
    { rank: 5, name: 'Kenji', xp: 8900, avatar: 'https://i.pravatar.cc/150?img=33', streak: 15 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header / Tabs */}
      <div className="bg-white rounded-3xl border border-slate-100 p-2 shadow-sm flex items-center">
        <button
          onClick={() => handleTabChange('feed')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-colors ${
            activeTab === 'feed' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="h-5 w-5" /> Discussions
        </button>
        <button
          onClick={() => handleTabChange('leaderboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-colors ${
            activeTab === 'leaderboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="h-5 w-5" /> Leaderboard
        </button>
      </div>

      {activeTab === 'feed' ? (
        <div className="space-y-6">
          {/* Create Post */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
            <img src="https://i.pravatar.cc/150?img=11" alt="Me" className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-4">
              <textarea 
                placeholder="Share your progress or ask a question..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[100px]"
              ></textarea>
              <div className="flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-colors shadow-md shadow-indigo-200">
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Feed */}
          {mockCommunityPosts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="font-semibold text-slate-900">{post.userName}</h4>
                    <span className="text-xs text-slate-500">{post.createdAt}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                <button className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors">
                  <Heart className="h-5 w-5" /> <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors">
                  <MessageCircle className="h-5 w-5" /> <span className="text-sm font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors ml-auto">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4"></div>
            <Trophy className="h-16 w-16 mx-auto mb-4 text-amber-300 drop-shadow-md" />
            <h2 className="text-3xl font-bold font-heading mb-2">Global Leaderboard</h2>
            <p className="text-indigo-100">Top learners this week. Keep practicing to climb the ranks!</p>
          </div>
          
          <div className="p-4">
            {leaderboardData.map((user, index) => (
              <motion.div 
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                  user.name === 'Alex Learner' ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-100 text-amber-600' :
                  index === 1 ? 'bg-slate-200 text-slate-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'text-slate-400'
                }`}>
                  {user.rank}
                </div>
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-slate-200" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{user.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Flame className="h-3.5 w-3.5 text-orange-500" /> {user.streak} day streak
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-heading text-indigo-600">{user.xp.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
