import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Play, CheckCircle2, Volume2 } from 'lucide-react';

export default function LearningModule() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, updateProgress } = useStore();
  
  const course = courses.find(c => c.id === courseId);
  const [activeModuleIndex, setActiveModuleIndex] = useState(() => {
    const idx = course?.modules.findIndex(m => !m.completed);
    return idx === -1 ? 0 : (idx || 0);
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showResult, setShowResult] = useState(false);

  if (!course) return <div>Course not found</div>;

  const activeModule = course.modules[activeModuleIndex];
  
  const handleComplete = () => {
    updateProgress(course.id, activeModule.id, 95);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(prev => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-slate-700">{course.title}</span>
            <span className="text-slate-500">{activeModuleIndex + 1} / {course.modules.length}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${((activeModuleIndex) / course.modules.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Context / Content */}
        <div className="md:w-1/2 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center bg-slate-50/50">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 self-start">
            {activeModule.type}
          </span>
          
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">
            {activeModule.title}
          </h2>
          
          {activeModule.type === 'shadowing' ? (
            <div className="space-y-6 mt-4">
              <p className="text-slate-600 text-lg">Listen to the native speaker and repeat exactly what you hear. Pay attention to intonation and rhythm.</p>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
                <p className="text-2xl font-heading font-bold text-slate-800">はじめまして、よろしくお願いします。</p>
                <p className="text-slate-500">Hajimemashite, yoroshiku onegaishimasu.</p>
                <button className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto hover:bg-indigo-200 transition-colors">
                  <Volume2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <p className="text-slate-600 text-lg">Review the material and prepare for the exercise on the right.</p>
              <div className="aspect-video rounded-2xl bg-slate-200 flex items-center justify-center overflow-hidden">
                <img src={course.image} alt="" className="w-full h-full object-cover opacity-50" />
                <Play className="absolute h-16 w-16 text-white drop-shadow-md" />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Area */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center text-center relative">
          {showResult ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="h-24 w-24 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-3xl font-bold font-heading text-slate-900 mb-2">Excellent!</h3>
              <p className="text-slate-500 mb-8">You scored 95% on this exercise.</p>
              
              <button 
                onClick={handleNext}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-colors shadow-md shadow-indigo-200"
              >
                {activeModuleIndex < course.modules.length - 1 ? 'Next Exercise' : 'Complete Course'}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-sm"
            >
              {activeModule.type === 'shadowing' ? (
                <div className="space-y-8">
                  <div className={`relative w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isRecording ? 'bg-rose-100 text-rose-500 shadow-[0_0_0_8px_rgba(255,228,230,0.5)]' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500'
                  }`}
                  onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className="h-12 w-12" />
                    {isRecording && (
                      <span className="absolute -bottom-2 right-4 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold font-heading text-slate-900 mb-2">
                      {isRecording ? 'Listening...' : 'Tap to speak'}
                    </h4>
                    <p className="text-slate-500 text-sm">
                      {isRecording ? 'Read the phrase clearly' : 'When youre ready, tap the microphone'}
                    </p>
                  </div>

                  <button 
                    onClick={handleComplete}
                    disabled={!isRecording && activeModule.type === 'shadowing'}
                    className="w-full py-4 bg-indigo-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl font-semibold transition-all"
                  >
                    Submit Recording
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-xl font-bold font-heading text-slate-900">Select the correct translation</h4>
                  <div className="space-y-3">
                    {['Option A', 'Option B', 'Option C'].map((opt, i) => (
                      <button 
                        key={i}
                        onClick={handleComplete}
                        className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 font-medium text-slate-700 transition-all text-left"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
