import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import { Users, FileText, CheckCircle, AlertTriangle, TrendingUp, XCircle, BarChart2 } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, activeTests: 0, totalQuestions: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes, feedbackRes, ticketsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/question-analytics'),
          api.get('/support/admin/feedback').catch(() => ({ data: { data: [] } })),
          api.get('/support/admin/tickets').catch(() => ({ data: { data: [] } }))
        ]);
        setStats({
          ...statsRes.data.data,
          totalFeedback: feedbackRes.data.data.length,
          openTickets: ticketsRes.data.data.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length
        });
        setAnalytics(analyticsRes.data.data);
      } catch (error) { 
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard V2</h1>
      
      {/* KPI Overview */}
      <GlassCard className="p-8 relative overflow-hidden bg-gradient-to-br from-primary-500/5 to-indigo-500/5">
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 animate-pulse">
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-4">
            <div className="flex items-center gap-4 bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl border border-primary-100 dark:border-primary-800/50">
              <div className="p-4 bg-primary-500 rounded-full text-white">
                <Users size={28} />
              </div>
              <div>
                <h3 className="font-bold text-primary-700 dark:text-primary-300">Students</h3>
                <p className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{stats.totalStudents}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <div className="p-4 bg-emerald-500 rounded-full text-white">
                <CheckCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 dark:text-emerald-300">Active Tests</h3>
                <p className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{stats.activeTests}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800/50">
              <div className="p-4 bg-amber-500 rounded-full text-white">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="font-bold text-amber-700 dark:text-amber-300">Questions</h3>
                <p className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{stats.totalQuestions}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-rose-50 dark:bg-rose-900/20 p-6 rounded-xl border border-rose-100 dark:border-rose-800/50">
              <div className="p-4 bg-rose-500 rounded-full text-white">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-rose-700 dark:text-rose-300">Open Tickets</h3>
                <p className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{stats.openTickets}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
              <div className="p-4 bg-indigo-500 rounded-full text-white">
                <BarChart2 size={28} />
              </div>
              <div>
                <h3 className="font-bold text-indigo-700 dark:text-indigo-300">Total Feedback</h3>
                <p className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{stats.totalFeedback}</p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Module 5: Question Analytics Engine */}
      <h2 className="text-xl font-bold mt-8 flex items-center gap-2"><BarChart2 /> Question Quality Analytics Engine</h2>
      
      {loading || !analytics ? (
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-4"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          
          {/* Most Difficult Questions */}
          <GlassCard className="p-6 border-l-4 border-l-rose-500">
            <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2 mb-4"><TrendingUp /> Most Difficult Questions</h3>
            <div className="space-y-4">
              {analytics.difficultQuestions?.map(q => (
                <div key={q.id} className="bg-slate-50 dark:bg-white/5 p-3 rounded border border-slate-100 dark:border-white/10">
                  <p className="text-sm font-medium">{q.text}</p>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Attempts: {q.total_attempts}</span>
                    <span>Acc: {Math.round((q.correct_attempts/q.total_attempts)*100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Confusing Questions */}
          <GlassCard className="p-6 border-l-4 border-l-amber-500">
            <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2 mb-4"><AlertTriangle /> Confusing Questions</h3>
            <p className="text-xs text-slate-500 mb-4">High attempts but very low accuracy or long solving time.</p>
            <div className="space-y-4">
              {analytics.confusingQuestions?.length > 0 ? analytics.confusingQuestions.map(q => (
                <div key={q.id} className="bg-slate-50 dark:bg-white/5 p-3 rounded border border-slate-100 dark:border-white/10">
                  <p className="text-sm font-medium">{q.text}</p>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Time: {Math.round(q.average_solving_time/1000)}s</span>
                    <span>Acc: {Math.round((q.correct_attempts/q.total_attempts)*100)}%</span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No confusing questions identified.</p>}
            </div>
          </GlassCard>

          {/* Frequently Skipped */}
          <GlassCard className="p-6 border-l-4 border-l-blue-500">
            <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2 mb-4"><XCircle /> Frequently Skipped</h3>
            <div className="space-y-4">
              {analytics.skippedQuestions?.map(q => (
                <div key={q.id} className="bg-slate-50 dark:bg-white/5 p-3 rounded border border-slate-100 dark:border-white/10">
                  <p className="text-sm font-medium">{q.text}</p>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Attempts: {q.total_attempts}</span>
                    <span>Skips: {q.skip_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Unused Questions */}
          <GlassCard className="p-6 border-l-4 border-l-slate-500">
            <h3 className="text-lg font-bold text-slate-600 flex items-center gap-2 mb-4"><FileText /> Unused Questions</h3>
            <p className="text-xs text-slate-500 mb-4">Never attempted by any student.</p>
            <div className="space-y-2">
              {analytics.unusedQuestions?.map(q => (
                <div key={q.id} className="bg-slate-50 dark:bg-white/5 p-2 rounded border border-slate-100 dark:border-white/10">
                  <p className="text-sm truncate">{q.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
