import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const PerformanceGrowth = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <GlassCard className="p-6 h-full flex flex-col items-center justify-center min-h-[400px]">
        <TrendingUp className="text-slate-300 dark:text-slate-600 mb-4" size={48} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Not enough data to display growth trends.</p>
      </GlassCard>
    );
  }

  // Format data for charts
  const chartData = timeline.map((t, index) => ({
    name: t.test_type === 'general' ? 'Gen Test' : `Adpt Test ${index}`,
    score: t.total_score,
    accuracy: Math.round(t.accuracy * 100),
    time: Math.round(t.avg_response_time / 1000)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
          <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="text-sm font-medium">
              {p.name}: {p.value}{p.name === 'Accuracy' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-primary-500" />
          Performance Growth Dashboard
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Score Growth */}
        <div className="h-72">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 text-center">Score Progression</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" name="Score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy Growth */}
        <div className="h-72">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 text-center">Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};

export default PerformanceGrowth;
