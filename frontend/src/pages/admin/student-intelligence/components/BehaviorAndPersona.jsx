import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { BrainCircuit, Activity, HeartPulse, Focus, Clock, Zap } from 'lucide-react';

const BehaviorAndPersona = ({ overview }) => {
  const getPersonaExplanation = (persona) => {
    switch (persona) {
      case 'Fast Learner': return "This student rapidly grasps concepts, requiring fewer repetitions and exhibiting high accuracy with fast response times. They thrive on advanced challenges.";
      case 'Consistent Learner': return "This student maintains a steady pace of learning. They show reliable performance with moderate response times and steady accuracy improvements.";
      case 'Needs Reinforcement': return "This student currently struggles with new concepts, showing lower accuracy or prolonged response times. They require more foundational practice and hints.";
      default: return "Still evaluating student's primary learning persona.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persona Analysis */}
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 bg-primary-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
          
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 relative z-10">
            <BrainCircuit className="text-primary-500" />
            Learning Persona Analysis
          </h2>

          <div className="flex items-center gap-6 mb-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <BrainCircuit size={40} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Current Persona</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                {overview.persona}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-bold">
                  92% Confidence
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 relative z-10">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">AI Explanation</p>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {getPersonaExplanation(overview.persona)}
            </p>
          </div>
        </GlassCard>

        {/* Behavior Analytics */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" />
            Behavior Analytics
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Focus size={16} className="text-purple-500" /> Focus Score
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{overview.focusScore}/100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${overview.focusScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <HeartPulse size={16} className="text-rose-500" /> Persistence Score
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{overview.persistenceScore}/100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${overview.persistenceScore}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rapid Guessing</p>
                  <p className="font-bold text-slate-800 dark:text-white">Low</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Session</p>
                  <p className="font-bold text-slate-800 dark:text-white">24 min</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default BehaviorAndPersona;
