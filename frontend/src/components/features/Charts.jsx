import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import GlassCard from '../common/GlassCard';

export const PerformanceChart = ({ data }) => {
  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="font-bold text-lg mb-4">Performance History</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export const DifficultyDistributionChart = ({ data }) => {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="font-bold text-lg mb-4">Questions by Difficulty</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export const KnowledgeRadarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="font-bold text-lg mb-4">Domain Mastery (DKT)</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="domain" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name="Mastery %" dataKey="mastery" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export const LearningProgressChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="font-bold text-lg mb-4">Knowledge Graph</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none' }}
            />
            <Line type="monotone" name="Knowledge Score" dataKey="knowledge_score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            <Line type="monotone" name="Accuracy" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
