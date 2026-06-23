import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

const TopicMastery = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-slate-500 text-center py-10">No topic mastery data available.</p>
      </GlassCard>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mastered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'Advanced': return 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400 border-primary-200 dark:border-primary-500/30';
      case 'Intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
    }
  };

  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="text-primary-500" />
          Topic Mastery Analysis
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-sm">
              <th className="p-4 font-medium">Topic Name</th>
              <th className="p-4 font-medium">Mastery</th>
              <th className="p-4 font-medium">Questions Attempted</th>
              <th className="p-4 font-medium">Avg Time</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{topic.name}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8">{Math.round(topic.accuracy * 100)}%</span>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 hidden sm:block">
                      <div 
                        className="bg-primary-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.round(topic.accuracy * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
                    <CheckCircle size={14} className="text-slate-400" />
                    {topic.attempted} ({topic.correct} correct)
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
                    <Clock size={14} className="text-slate-400" />
                    {topic.avgTime >= 1000 ? (topic.avgTime / 1000).toFixed(1) + 's' : topic.avgTime + 'ms'}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(topic.status)}`}>
                    {topic.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default TopicMastery;
