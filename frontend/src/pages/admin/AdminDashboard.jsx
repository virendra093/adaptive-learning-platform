import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import { Users, FileText, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, activeTests: 0, totalQuestions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.data);
      } catch (error) { console.error(error);
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <GlassCard className="p-8 relative overflow-hidden bg-gradient-to-br from-primary-500/5 to-indigo-500/5">
        <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        <p className="text-slate-600 dark:text-slate-400">Welcome to the admin panel. Use the sidebar to manage questions and view student results.</p>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-pulse">
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex items-center gap-4 bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl border border-primary-100 dark:border-primary-800/50">
              <div className="p-4 bg-primary-500 rounded-full text-white">
                <Users size={28} />
              </div>
              <div>
                <h3 className="font-bold text-primary-700 dark:text-primary-300">Total Students</h3>
                <p className="text-4xl font-black mt-1 text-slate-800 dark:text-white">{stats.totalStudents}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <div className="p-4 bg-emerald-500 rounded-full text-white">
                <CheckCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 dark:text-emerald-300">Active Tests</h3>
                <p className="text-4xl font-black mt-1 text-slate-800 dark:text-white">{stats.activeTests}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800/50">
              <div className="p-4 bg-amber-500 rounded-full text-white">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="font-bold text-amber-700 dark:text-amber-300">Question Bank</h3>
                <p className="text-4xl font-black mt-1 text-slate-800 dark:text-white">{stats.totalQuestions}</p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminDashboard;
