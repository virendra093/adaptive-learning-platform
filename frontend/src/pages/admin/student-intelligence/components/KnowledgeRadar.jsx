import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';

const KnowledgeRadar = ({ domains }) => {
  if (!domains || domains.length === 0) {
    return (
      <GlassCard className="p-6 h-full flex flex-col items-center justify-center min-h-[300px]">
        <Target className="text-slate-300 dark:text-slate-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">No knowledge radar data.</p>
      </GlassCard>
    );
  }

  const chartData = domains.map(d => ({
    subject: d.name,
    A: Math.round(d.accuracy * 100),
    fullMark: 100
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
          <p className="font-bold text-slate-800 dark:text-white mb-1">{payload[0].payload.subject}</p>
          <p className="text-sm font-medium text-primary-500">Mastery: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
        <Target className="text-primary-500" />
        Knowledge Radar
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Visualizes mastery across different domains.</p>
      
      <div className="flex-grow min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar name="Student" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default KnowledgeRadar;
