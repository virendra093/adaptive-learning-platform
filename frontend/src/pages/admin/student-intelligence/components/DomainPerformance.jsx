import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { Layers } from 'lucide-react';

const DomainPerformance = ({ domains }) => {
  if (!domains || domains.length === 0) {
    return (
      <GlassCard className="p-6 h-full flex items-center justify-center">
        <p className="text-slate-500">No domain data available.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 h-full">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <Layers className="text-primary-500" />
        Domain Performance
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {domains.map((domain, index) => {
          const accPct = Math.round(domain.accuracy * 100);
          const colorClass = accPct >= 80 ? 'emerald' : accPct >= 60 ? 'primary' : accPct >= 40 ? 'amber' : 'red';
          
          return (
            <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 truncate">{domain.name}</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Accuracy</span>
                    <span className={`font-bold text-${colorClass}-600 dark:text-${colorClass}-400`}>{accPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div 
                      className={`bg-${colorClass}-500 h-1.5 rounded-full`} 
                      style={{ width: `${accPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/50">
                  <div>
                    <span className="text-slate-400 block">Attempted</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{domain.attempted}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Avg Time</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {domain.avgTime >= 1000 ? (domain.avgTime / 1000).toFixed(1) + 's' : domain.avgTime + 'ms'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default DomainPerformance;
