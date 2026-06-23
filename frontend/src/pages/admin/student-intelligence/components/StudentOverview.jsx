import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { Target, TrendingUp, Zap, Activity, BrainCircuit } from 'lucide-react';

const StudentOverview = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-primary-500">
        <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
          <BrainCircuit className="text-primary-500" size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Learning Persona</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{data.persona}</p>
        </div>
      </GlassCard>

      <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
          <TrendingUp className="text-amber-500" size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Adaptive Level</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">{data.current_level || 'General'}</p>
        </div>
      </GlassCard>

      <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
          <Target className="text-emerald-500" size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Overall Accuracy</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{Math.round(data.overallAccuracy * 100)}%</p>
        </div>
      </GlassCard>

      <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
          <Activity className="text-blue-500" size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tests Taken</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{data.total_tests_taken || 0}</p>
        </div>
      </GlassCard>

      <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
          <Zap className="text-purple-500" size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Behavior Score</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{data.behaviorScore}/100</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default StudentOverview;
