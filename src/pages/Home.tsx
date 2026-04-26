import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Sparkles, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: Globe, title: 'Multi-Language', desc: 'English, Japanese, Korean and more.' },
    { icon: Sparkles, title: 'Leveled System', desc: 'From beginner to advanced mastery.' },
    { icon: MessageCircle, title: 'Interactive', desc: 'Oral shadowing and listening exercises.' },
    { icon: BookOpen, title: 'Community', desc: 'Engage with learners worldwide.' }
  ];

  const languages = [
    { code: 'ja', name: 'Japanese', native: '日本語', color: 'bg-rose-100 text-rose-700' },
    { code: 'ko', name: 'Korean', native: '한국어', color: 'bg-blue-100 text-blue-700' },
    { code: 'en', name: 'English', native: 'English', color: 'bg-emerald-100 text-emerald-700' },
    { code: 'es', name: 'Spanish', native: 'Español', color: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold font-heading tracking-tight">LinguaLearn</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hidden sm:block px-4 py-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors">
              Log in
            </Link>
            <Link to="/dashboard" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
              Start Learning <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 relative">
        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm mb-6 border border-indigo-100">
              🌟 Redefining Language Learning
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold font-heading text-slate-900 tracking-tight mb-8 leading-tight">
              Master any language with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">
                immersive experience
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Level up your skills with interactive modules, oral shadowing, and personalized paths. Join our community and achieve fluency faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium rounded-full transition-all shadow-lg shadow-indigo-200 w-full sm:w-auto">
                Get Started for Free
              </Link>
              <Link to="/courses" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 text-lg font-medium rounded-full border border-slate-200 transition-all w-full sm:w-auto shadow-sm">
                Explore Courses
              </Link>
            </div>
          </motion.div>

          {/* Languages Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20"
          >
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Choose your target language</p>
            <div className="flex flex-wrap justify-center gap-4">
              {languages.map((lang) => (
                <div key={lang.code} className={`flex items-center gap-3 px-6 py-3 rounded-2xl ${lang.color} bg-opacity-50 border border-white shadow-sm cursor-pointer hover:-translate-y-1 transition-transform`}>
                  <span className="text-xl font-bold font-heading">{lang.native}</span>
                  <span className="text-sm opacity-80">{lang.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all"
              >
                <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
