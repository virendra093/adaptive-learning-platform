import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import { PerformanceChart, DifficultyDistributionChart, KnowledgeRadarChart, LearningProgressChart } from '../../components/features/Charts';
import { CheckCircle, Clock, Target, Award, BrainCircuit, Activity, Compass, TrendingUp, Zap, BookOpen } from 'lucide-react';
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
      } catch (error) { 
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

  // V4 Variables
  const persona = dashboardData?.persona;
  const interest = dashboardData?.interest;
  const confidence = dashboardData?.confidenceHistory?.[0]?.confidence_score || 0;
  const goal = dashboardData?.goalProgress;
  const roadmap = dashboardData?.learningPath;
  const estimatedImprovement = dashboardData?.estimatedImprovement || 0;

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
            {persona ? `Your Learning Persona: ${persona.persona}. ${persona.reason}` : 'Ready to challenge yourself today?'}
          </p>
          <div className="flex gap-4 mt-6">
            {dashboardData?.profile?.general_assessment_completed ? (
              <Link to="/student/test/adaptive">
                <Button className="flex items-center gap-2 shadow-lg shadow-primary-500/30">
                  <BrainCircuit size={18} /> Start Adaptive Test V4
                </Button>
              </Link>
            ) : (
              <Button disabled className="flex items-center gap-2 shadow-lg shadow-slate-500/30 opacity-50 cursor-not-allowed">
                <BrainCircuit size={18} /> Adaptive Test Locked
              </Button>
            )}
            {!dashboardData?.profile?.general_assessment_completed && (
              <Link to="/student/test/general">
                <Button variant="secondary">General Test</Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="mt-6 md:mt-0 z-10 flex flex-col items-center bg-white/50 dark:bg-surface-dark/50 p-6 rounded-2xl border border-white/20 backdrop-blur-md">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Goal Progress</span>
          <div className="flex items-center gap-2 text-xl font-black text-primary-600 dark:text-primary-400">
            <Target size={24} /> {goal?.selected_goal || 'General'}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${goal?.progress_percentage || 0}%` }}></div>
          </div>
          <span className="text-xs mt-1 text-slate-500">{(goal?.progress_percentage || 0).toFixed(1)}%</span>
        </div>
      </GlassCard>

      {!dashboardData?.profile?.general_assessment_completed ? (
        <>
          <div className="relative p-8 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 shadow-md flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mb-4">
              <Target size={32} className="text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">General Assessment Pending</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-lg">
              To unlock the Adaptive Learning Engine, Personalized Roadmaps, and AI Recommendations, you must first complete the General Assessment to map your initial knowledge baseline.
            </p>
            <Link to="/student/test/general">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white border-none shadow-lg shadow-rose-500/30">Take General Assessment Now</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-8 flex flex-col items-center text-center opacity-70">
              <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-4">
                <BrainCircuit size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">🔒 Adaptive Tests Locked</h3>
              <p className="text-sm text-slate-500 mt-2">Complete the General Assessment to unlock AI-driven personalized testing.</p>
            </GlassCard>
            <GlassCard className="p-8 flex flex-col items-center text-center opacity-70">
              <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-4">
                <Activity size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">🔒 Recommendations Locked</h3>
              <p className="text-sm text-slate-500 mt-2">Personalized learning paths and AI explanations are currently unavailable.</p>
            </GlassCard>
            <GlassCard className="p-8 flex flex-col items-center text-center opacity-70">
              <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-4">
                <Target size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">🔒 Personalized Analytics Locked</h3>
              <p className="text-sm text-slate-500 mt-2">Your knowledge radar, persona, and learning trends are waiting for initial data.</p>
            </GlassCard>
          </div>
        </>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tests Completed" value={totalTests} icon={CheckCircle} colorClass="bg-blue-500" />
            <StatCard title="Average Score" value={`${avgScore}`} icon={Award} colorClass="bg-indigo-500" />
            <StatCard title="Overall Accuracy" value={`${avgAccuracy}%`} icon={Target} colorClass="bg-emerald-500" />
            <StatCard title="Confidence Meter" value={`${confidence.toFixed(1)}/100`} icon={Zap} colorClass="bg-amber-500" />
          </div>

          {/* V4 Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <h3 className="font-bold mb-4 text-indigo-600 flex items-center gap-2"><Activity size={20}/> Learning Persona</h3>
              {persona ? (
                <div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{persona.persona}</p>
                  <p className="text-sm text-slate-500 mt-2">{persona.reason}</p>
                </div>
              ) : <p className="text-sm text-slate-500">Take more tests to discover your persona.</p>}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold mb-4 text-rose-600 flex items-center gap-2"><Compass size={20}/> Student Interest</h3>
              {interest ? (
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Domain: {interest.domain_name || 'N/A'}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">Topic: {interest.topic_name || 'N/A'}</p>
                  <p className="text-sm text-slate-500 mt-2">Based on accuracy, volume, and engagement.</p>
                </div>
              ) : <p className="text-sm text-slate-500">Take more tests to determine interests.</p>}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold mb-4 text-emerald-600 flex items-center gap-2"><TrendingUp size={20}/> Learning Trend</h3>
              <div>
                 <p className="text-2xl font-black capitalize text-slate-800 dark:text-white">{learningTrend.replace('_', ' ')}</p>
                 <p className="text-sm text-slate-500 mt-2">Analyzed from your last 5-10 tests.</p>
              </div>
            </GlassCard>
          </div>

          {/* Learning Roadmap */}
          {roadmap && roadmap.length > 0 && (
            <GlassCard className="p-6 border-l-4 border-l-primary-500">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><BookOpen size={24}/> Recommended Learning Roadmap</h3>
               <p className="text-sm text-slate-500 mb-4">Follow this intelligent path to reach your {goal?.selected_goal || 'General'} goal. Expected improvement: <span className="text-emerald-600 font-bold">+{estimatedImprovement}%</span></p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {roadmap.map((week, idx) => (
                   <div key={idx} className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10 relative">
                     <div className="absolute top-0 right-0 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl">
                       {week.recommended_difficulty}
                     </div>
                     <h4 className="font-bold text-primary-600">{week.week}</h4>
                     <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                       {week.practice_order.map((task, i) => (
                         <li key={i}>{task}</li>
                       ))}
                     </ul>
                     <p className="text-xs text-slate-400 mt-3 flex items-center gap-1"><Clock size={12}/> {week.estimated_completion_time}</p>
                   </div>
                 ))}
               </div>
            </GlassCard>
          )}

          {/* Advanced Adaptive Analytics */}
          {dashboardData?.radarData && dashboardData?.radarData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <KnowledgeRadarChart data={dashboardData.radarData} />
              <LearningProgressChart data={dashboardData.progressData} />
            </div>
          )}

          {/* Topics */}
          {dashboardData?.weakTopics && (
            <div className="grid grid-cols-1 gap-6 mt-6">
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
            </div>
          )}

          {/* Recent Tests & AI Explanations */}
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
              <h2 className="text-xl font-bold mb-4">AI Explanations & Recommendations</h2>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <div className="flex items-center gap-2 mb-2">
                        <BrainCircuit size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold text-indigo-800 dark:text-indigo-300 capitalize">
                          Explainable AI Insight
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {rec.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No explanations available yet.</p>
              )}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
