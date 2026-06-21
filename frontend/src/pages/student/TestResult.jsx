import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { Award, Target, Clock, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const TestResult = () => {
  const location = useLocation();
  const state = location.state || {};
  const metrics = state.metrics || {};
  const explanation = state.explanation || "You demonstrated strong foundational knowledge. Keep practicing to improve your weak areas and unlock new adaptive levels!";

  // Handle both AdaptiveTest (which sends totalTime) and GeneralTest (which sends avgTime directly from backend)
  let accuracyVal = 0;
  if (metrics.accuracy !== undefined) {
    accuracyVal = Math.round(metrics.accuracy * 100);
  } else if (metrics.total && metrics.correct !== undefined) {
    accuracyVal = Math.round((metrics.correct / metrics.total) * 100);
  } else if (metrics.correct !== undefined && metrics.wrongAnswers !== undefined) {
    const answered = metrics.correct + metrics.wrongAnswers;
    accuracyVal = answered > 0 ? Math.round((metrics.correct / answered) * 100) : 0;
  }

  let avgTimeStr = "0.0s";
  if (metrics.avgTime) {
    avgTimeStr = (metrics.avgTime / 1000).toFixed(1) + "s";
  } else if (metrics.totalTime) {
    const answered = (metrics.correct || 0) + (metrics.wrongAnswers || 0) + (metrics.skippedQuestions || 0);
    const avg = answered > 0 ? (metrics.totalTime / answered) : 0;
    avgTimeStr = (avg / 1000).toFixed(1) + "s";
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-10">
      <div className="text-center mb-8">
        <Award size={64} className="text-primary-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Test Completed!</h1>
        <p className="text-slate-500 dark:text-slate-400">Here is your performance summary.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
          <Target size={32} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Accuracy</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{accuracyVal}%</p>
        </GlassCard>
        
        <GlassCard className="text-center p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
          <Clock size={32} className="text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Avg Time</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{avgTimeStr}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-8 text-center mt-6">
        <h3 className="text-xl font-bold mb-2">AI Assessment</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {explanation}
        </p>
        <Link to="/student/dashboard">
          <Button className="w-full flex justify-center items-center gap-2">
            Return to Dashboard <ArrowRight size={16} />
          </Button>
        </Link>
      </GlassCard>
    </div>
  );
};

export default TestResult;
