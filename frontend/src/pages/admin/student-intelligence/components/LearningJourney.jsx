import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { Route, CheckCircle, CircleDot, Play, MapPin } from 'lucide-react';

const LearningJourney = ({ timeline, recommendations }) => {
  return (
    <GlassCard className="p-6 h-full">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <Route className="text-primary-500" />
        Learning Journey
      </h2>

      <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-500 before:via-primary-300 before:to-slate-200 dark:before:to-slate-700">
        
        {/* Registration Node */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 bg-primary-500 absolute left-[-24px] top-1 shadow shadow-primary-500/50">
            <Play size={10} className="text-white ml-0.5" />
          </div>
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800 dark:text-white">Registration</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Step 1</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Student joined the platform</p>
          </div>
        </div>

        {/* Timeline Tests */}
        {timeline.map((test, index) => (
          <div key={test.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 bg-primary-400 absolute left-[-24px] top-1 z-10">
              <CheckCircle size={12} className="text-white" />
            </div>
            <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm w-full transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  {test.test_type === 'general' ? 'General Assessment' : `Adaptive Test ${index}`}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full font-medium">
                  {new Date(test.end_time).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="text-slate-600 dark:text-slate-400">Score: <span className="font-bold text-slate-800 dark:text-white">{test.total_score}</span></div>
                <div className="text-slate-600 dark:text-slate-400">Accuracy: <span className="font-bold text-emerald-600 dark:text-emerald-400">{Math.round(test.accuracy * 100)}%</span></div>
              </div>
            </div>
          </div>
        ))}

        {/* Current Status Node */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 bg-amber-500 absolute left-[-24px] top-1 animate-pulse shadow shadow-amber-500/50">
            <MapPin size={10} className="text-white" />
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-800 dark:text-amber-400">Current Status</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-500">
              {recommendations && recommendations.length > 0 ? "Ready for recommended topic" : "Awaiting next test"}
            </p>
          </div>
        </div>

      </div>
    </GlassCard>
  );
};

export default LearningJourney;
