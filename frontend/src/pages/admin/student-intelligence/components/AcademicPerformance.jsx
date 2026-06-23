import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { CheckCircle, XCircle, Clock, Trophy, BarChart2, Star } from 'lucide-react';

const AcademicPerformance = ({ data }) => {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <BarChart2 className="text-primary-500" />
        Academic Performance Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Questions Stats */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Attempted</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{data.totalAttempts}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-center">
              <CheckCircle className="text-emerald-500 mx-auto mb-1" size={20} />
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{data.correctAnswers}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Correct</p>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20 text-center">
              <XCircle className="text-red-500 mx-auto mb-1" size={20} />
              <p className="text-lg font-bold text-red-700 dark:text-red-400">{data.wrongAnswers}</p>
              <p className="text-xs text-red-600 dark:text-red-500 font-medium">Wrong</p>
            </div>
          </div>
        </div>

        {/* Scoring */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-xl text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
            <Trophy className="absolute -right-4 -bottom-4 text-white/20 w-24 h-24" />
            <p className="text-amber-50 font-medium mb-1 relative z-10">Highest Score</p>
            <p className="text-3xl font-bold relative z-10">{data.highestScore}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-2">
              <Star size={16} className="text-primary-500" /> Average Score
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{data.averageScore}</p>
          </div>
        </div>

        {/* Time Analysis */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl">
              <Clock className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Average Response Time</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">
                  {data.avgResponseTimeMs >= 1000 ? (data.avgResponseTimeMs / 1000).toFixed(1) : data.avgResponseTimeMs}
                </span>
                <span className="text-slate-500 font-medium mb-1">{data.avgResponseTimeMs >= 1000 ? 'seconds' : 'ms'} / question</span>
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                {data.avgResponseTimeMs < 15000 ? "⚡ Lightning fast responses" : data.avgResponseTimeMs > 45000 ? "🐢 Careful and deliberate pacing" : "⏱️ Optimal pacing maintained"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </GlassCard>
  );
};

export default AcademicPerformance;
