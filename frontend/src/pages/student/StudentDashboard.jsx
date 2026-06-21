import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import { PerformanceChart, DifficultyDistributionChart, KnowledgeRadarChart, LearningProgressChart } from '../../components/features/Charts';
import { CheckCircle, Clock, Target, Award, BrainCircuit, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <GlassCard className="flex items-center gap-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  </GlassCard>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, recRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/recommendations')
        ]);
        setDashboardData(dashRes.data.data);
        setRecommendations(recRes.data.data || []);
      } catch (error) { console.error(error);
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        <div className="md:col-span-4 h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
        <div className="md:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="md:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const totalTests = overview.totalTests || 0;
  const avgScore = overview.avgScore ? parseFloat(overview.avgScore).toFixed(1) : 0;
  const avgAccuracy = overview.avgAccuracy ? (parseFloat(overview.avgAccuracy) * 100).toFixed(0) : 0;
  const avgResponseTime = overview.avgResponseTime ? (parseFloat(overview.avgResponseTime) / 1000).toFixed(1) : 0;
  const currentLevel = dashboardData?.currentLevel || 'easy';
  const behavior = dashboardData?.behavior || {};
  const learningTrend = dashboardData?.profile?.learning_trend || 'stable';
  const growthRate = dashboardData?.profile?.growth_rate || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Card & Current Difficulty */}
      <GlassCard className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-primary-500/10 to-indigo-500/10">
        <div className="absolute -right-10 -top-10 opacity-10">
          <BrainCircuit size={150} />
        </div>
        <div className="z-10">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl">
            Ready to challenge yourself today? Your adaptive learning engine suggests taking a new test to continue improving.
          </p>
          <div className="flex gap-4 mt-6">
            <Link to="/student/test/adaptive">
              <Button className="flex items-center gap-2 shadow-lg shadow-primary-500/30">
                <BrainCircuit size={18} /> Start Adaptive Test
              </Button>
            </Link>
            <Link to="/student/test/general">
              <Button variant="secondary">General Test</Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-6 md:mt-0 z-10 flex flex-col items-center bg-white/50 dark:bg-surface-dark/50 p-6 rounded-2xl border border-white/20 backdrop-blur-md">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Current Level</span>
          <div className="flex items-center gap-2 text-2xl font-black capitalize text-primary-600 dark:text-primary-400">
            <Activity size={28} /> {currentLevel}
          </div>
        </div>
      </GlassCard>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tests Completed" value={totalTests} icon={CheckCircle} colorClass="bg-blue-500" />
        <StatCard title="Average Score" value={`${avgScore}`} icon={Award} colorClass="bg-indigo-500" />
        <StatCard title="Accuracy" value={`${avgAccuracy}%`} icon={Target} colorClass="bg-emerald-500" />
        <StatCard title="Avg Time/Question" value={`${avgResponseTime}s`} icon={Clock} colorClass="bg-amber-500" />
      </div>

      {/* Advanced Adaptive Analytics */}
      {dashboardData?.radarData && dashboardData?.radarData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <KnowledgeRadarChart data={dashboardData.radarData} />
          <LearningProgressChart data={dashboardData.progressData} />
        </div>
      )}

      {/* Topics & Engine Rewards & V3 Behavior Analytics */}
      {dashboardData?.weakTopics && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
          <GlassCard className="p-6">
            <h3 className="font-bold mb-2 text-emerald-600 flex items-center gap-2"><CheckCircle size={16}/> Strong Topics</h3>
            <div className="flex flex-wrap gap-2">
              {dashboardData.strongTopics.map((t, i) => <span key={i} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">{t}</span>)}
            </div>
            <h3 className="font-bold mb-2 mt-4 text-rose-600 flex items-center gap-2"><Target size={16}/> Weak Topics</h3>
            <div className="flex flex-wrap gap-2">
              {dashboardData.weakTopics.map((t, i) => <span key={i} className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded">{t}</span>)}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold mb-2 text-indigo-600 flex items-center gap-2"><BrainCircuit size={16}/> V3 RL Engine</h3>
            <p className="text-sm">Total Reward Score: <span className="font-bold text-lg">{dashboardData.rewardScore?.toFixed(2)}</span></p>
            <p className="text-sm mt-4">Next Suggested Focus:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {dashboardData.nextRecommended.map((t, i) => <span key={i} className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{t}</span>)}
            </div>
          </GlassCard>

          <GlassCard className="p-6 xl:col-span-2">
            <h3 className="font-bold mb-4 text-amber-600 flex items-center gap-2"><Activity size={16}/> Cognitive & Behavioral Profile (V3.0)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/10 text-center">
                <p className="text-xs text-slate-500 font-medium">Trend</p>
                <p className="text-lg font-black uppercase text-blue-500 mt-1">{learningTrend.replace('_', ' ')}</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/10 text-center">
                <p className="text-xs text-slate-500 font-medium">Attention</p>
                <p className="text-lg font-black text-amber-500 mt-1">{(behavior.attention_score * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/10 text-center">
                <p className="text-xs text-slate-500 font-medium">Rapid Guessing</p>
                <p className="text-lg font-black text-rose-500 mt-1">{behavior.rapid_guessing_count || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/10 text-center">
                <p className="text-xs text-slate-500 font-medium">Discipline</p>
                <p className="text-lg font-black text-emerald-500 mt-1">{(behavior.learning_discipline * 100).toFixed(0)}%</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Standard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <PerformanceChart data={dashboardData?.recentHistory || []} />
        <DifficultyDistributionChart data={dashboardData?.difficultyDistribution || []} />
      </div>

      {/* Recent Tests & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Tests</h2>
          {dashboardData?.recentHistory?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentHistory.slice(0, 5).map((test, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                  <div>
                    <p className="font-medium">Test on {test.date}</p>
                    <p className="text-sm text-slate-500">Score: {test.score}</p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    {Math.round(test.accuracy * 100)}% Acc
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No recent tests found.</p>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Latest Recommendations</h2>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-indigo-800 dark:text-indigo-300 capitalize">
                      Suggested: {rec.recommended_difficulty || rec.recommendedDifficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {rec.explanation}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No recommendations available yet.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default StudentDashboard;
