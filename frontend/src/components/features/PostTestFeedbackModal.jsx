import React, { useState, useEffect } from 'react';
import { X, Target, BrainCircuit, Zap, ArrowRight, Activity, TrendingUp, AlertCircle, CheckCircle2, AlertTriangle, XCircle, Award, BarChart2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import api from '../../services/api';

const PostTestFeedbackModal = ({ isOpen, onClose, testResult, testType }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchInsights = async () => {
        setLoading(true);
        try {
          const { data } = await api.get('/dashboard');
          setDashboardData(data.data);
        } catch (error) {
          console.error("Failed to fetch dashboard insights", error);
        } finally {
          setLoading(false);
        }
      };
      fetchInsights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate Accuracy and Score
  const metrics = testResult?.metrics || testResult?.stats || {};
  let accuracyVal = 0;
  if (metrics.accuracy !== undefined) {
    accuracyVal = Math.round(metrics.accuracy * 100);
  } else if (metrics.total && metrics.correct !== undefined) {
    accuracyVal = Math.round((metrics.correct / metrics.total) * 100);
  } else if (metrics.correct !== undefined && metrics.wrongAnswers !== undefined) {
    const answered = metrics.correct + metrics.wrongAnswers;
    accuracyVal = answered > 0 ? Math.round((metrics.correct / answered) * 100) : 0;
  }
  
  const totalQuestions = metrics.total || (metrics.correct || 0) + (metrics.wrongAnswers || 0) + (metrics.skippedQuestions || 0) || 10;
  const correctAnswers = metrics.correct || 0;
  const scoreVal = correctAnswers * 10; // 10 points per question
  const maxScore = totalQuestions * 10;
  const scorePercentage = maxScore > 0 ? Math.round((scoreVal / maxScore) * 100) : 0;

  // Determine Category
  let category = 'moderate';
  if (accuracyVal < 40 || scorePercentage < 40) {
    category = 'low';
  } else if (accuracyVal > 70 && scorePercentage > 70) {
    category = 'high';
  }

  // Dashboard Fallbacks
  const weakTopics = dashboardData?.weakTopics || ['General Aptitude'];
  const strongTopics = dashboardData?.strongTopics || ['Fundamentals'];
  const goalProgress = dashboardData?.goalProgress?.progress_percentage || 0;
  const selectedGoal = dashboardData?.goalProgress?.selected_goal || 'General';
  const confidence = dashboardData?.confidenceHistory?.[0]?.confidence_score || 0;
  const persona = dashboardData?.persona?.persona || 'Developing Learner';
  const currentLevel = dashboardData?.currentLevel || dashboardData?.overview?.currentLevel || 'Medium';
  const improvement = dashboardData?.estimatedImprovement || 0;
  const avgScore = dashboardData?.overview?.avgScore || accuracyVal; // Using accuracy as proxy if avgScore missing
  const nextDifficulty = testResult?.recommendation?.difficulty || testResult?.nextDifficulty || 'medium';

  // Category specific styles and texts
  const theme = {
    low: {
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/10',
      border: 'border-rose-200 dark:border-rose-800',
      progressColor: '#f43f5e',
      icon: <XCircle size={40} className="text-rose-500" />,
      title: 'Needs Improvement',
      message: 'Your performance indicates that additional practice is required. Focus on your weak topics and review the recommended learning materials before attempting the next adaptive test.'
    },
    moderate: {
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      border: 'border-amber-200 dark:border-amber-800',
      progressColor: '#f59e0b',
      icon: <AlertTriangle size={40} className="text-amber-500" />,
      title: 'Good Progress',
      message: 'You are making steady progress. Continue practicing your weaker areas to improve your overall performance and unlock higher difficulty adaptive tests.'
    },
    high: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      border: 'border-emerald-200 dark:border-emerald-800',
      progressColor: '#10b981',
      icon: <CheckCircle2 size={40} className="text-emerald-500" />,
      title: 'Excellent Performance',
      message: 'Great work! Your performance is aligned with your learning goals. Keep challenging yourself with advanced adaptive tests and continue your learning journey.'
    }
  }[category];

  const handleAction = (path, state) => {
    onClose();
    if (state) {
      navigate(path, { state });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className={`relative w-full max-w-3xl bg-white dark:bg-surface-dark border ${theme.border} rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Ribbon */}
        <div className={`w-full h-2 ${theme.bg} border-b ${theme.border}`}></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          {/* Top Section: Icon, Title, Message */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`p-4 rounded-full ${theme.bg} mb-4`}>
              {theme.icon}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${theme.color}`}>
              {theme.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl">
              {theme.message}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column: Stats & Progress */}
            <div className="space-y-6">
              {/* Main Score & Accuracy Card */}
              <div className={`p-5 rounded-xl border ${theme.border} ${theme.bg} flex items-center justify-between`}>
                <div className="flex flex-col items-center justify-center p-2">
                   <div className="relative w-20 h-20 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                       <path
                         className="text-slate-200 dark:text-slate-700"
                         strokeWidth="3"
                         stroke="currentColor"
                         fill="none"
                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                       />
                       <path
                         stroke={theme.progressColor}
                         strokeWidth="3"
                         strokeDasharray={`${accuracyVal}, 100`}
                         fill="none"
                         strokeLinecap="round"
                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                       />
                     </svg>
                     <div className="absolute text-xl font-bold text-slate-800 dark:text-white">
                       {accuracyVal}%
                     </div>
                   </div>
                   <span className="text-xs font-medium text-slate-500 mt-2">Accuracy</span>
                </div>
                
                <div className="h-16 w-px bg-slate-300 dark:bg-slate-700"></div>
                
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <Award size={28} className={theme.color} />
                  <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{scoreVal}/{maxScore}</span>
                  <span className="text-xs font-medium text-slate-500">Score</span>
                </div>
              </div>

              {/* Goal Alignment */}
              <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Target size={18} /> Goal Alignment
                  </h3>
                  <span className="text-indigo-700 dark:text-indigo-400 font-bold">{goalProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-indigo-200/50 dark:bg-indigo-800/50 rounded-full h-2.5 mb-2">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                </div>
                <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80">
                  {goalProgress >= 100 
                    ? "You have reached your target goal readiness!" 
                    : `Your current performance is ${goalProgress.toFixed(0)}% aligned with your selected goal (${selectedGoal}).`}
                </p>
              </div>

              {/* Dynamic Insights based on Category */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <BarChart2 size={16} /> Performance Breakdown
                </h3>
                
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  {category === 'low' && (
                    <>
                      <li className="flex justify-between"><span>Weakest Domain:</span> <span className="font-medium text-slate-800 dark:text-white">Aptitude</span></li>
                      <li className="flex justify-between"><span>Weakest Topic:</span> <span className="font-medium text-slate-800 dark:text-white">{weakTopics[0]}</span></li>
                      <li className="flex justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"><span>Suggested Action:</span> <span className="font-medium text-primary-600 dark:text-primary-400">Review materials</span></li>
                    </>
                  )}
                  {category === 'moderate' && (
                    <>
                      <li className="flex justify-between"><span>Strongest Domain:</span> <span className="font-medium text-slate-800 dark:text-white">Core</span></li>
                      <li className="flex justify-between"><span>Weakest Domain:</span> <span className="font-medium text-slate-800 dark:text-white">Aptitude</span></li>
                      <li className="flex justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"><span>Recommended Topic:</span> <span className="font-medium text-primary-600 dark:text-primary-400">{weakTopics[0]}</span></li>
                    </>
                  )}
                  {category === 'high' && (
                    <>
                      <li className="flex justify-between"><span>Strongest Domain:</span> <span className="font-medium text-slate-800 dark:text-white">Core</span></li>
                      <li className="flex justify-between"><span>Best Topic:</span> <span className="font-medium text-slate-800 dark:text-white">{strongTopics[0]}</span></li>
                      <li className="flex justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"><span>Next Difficulty:</span> <span className="font-medium capitalize text-primary-600 dark:text-primary-400">{nextDifficulty}</span></li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column: Adaptive Insights */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                <BrainCircuit size={18} className="text-primary-500" />
                Adaptive Learning Insights
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Activity size={12}/> Knowledge Score</div>
                  <div className="font-bold text-slate-800 dark:text-white">{typeof avgScore === 'number' ? avgScore.toFixed(1) : avgScore}</div>
                </div>
                
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Zap size={12}/> Confidence Score</div>
                  <div className="font-bold text-slate-800 dark:text-white">{confidence.toFixed(1)}</div>
                </div>
                
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 col-span-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><AlertCircle size={12}/> Learning Persona</div>
                  <div className="font-bold text-slate-800 dark:text-white capitalize">{persona}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Target size={12}/> Adaptive Level</div>
                  <div className="font-bold text-slate-800 dark:text-white capitalize">{currentLevel}</div>
                </div>
                
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1"><TrendingUp size={12}/> Improvement</div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">+{improvement}% <span className="text-[10px] font-normal ml-1">Accuracy Growth</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button 
              variant="secondary" 
              onClick={() => handleAction('/student/recommendations')}
              className="flex items-center gap-2"
            >
              <BookOpen size={16} /> View Recommendations
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => handleAction('/student/test/result', { 
                explanation: testResult?.recommendation?.explanation,
                metrics: testResult?.stats || testResult?.metrics 
              })}
              className="flex items-center gap-2"
            >
              <BarChart2 size={16} /> View Detailed Analysis
            </Button>
            
            <Button 
              onClick={() => {
                onClose();
                // If already on adaptive test, we might want to reload or trigger a state change.
                // Using navigate to the same route might not remount, so we could navigate dashboard then back or handled by parent.
                if (window.location.pathname === '/student/test/adaptive') {
                  window.location.reload();
                } else {
                  navigate('/student/test/adaptive');
                }
              }}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white border-none shadow-lg shadow-primary-500/30"
            >
              Start Next Adaptive Test <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostTestFeedbackModal;
