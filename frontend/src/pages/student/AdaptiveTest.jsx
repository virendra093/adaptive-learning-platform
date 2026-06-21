import { useState, useEffect, useRef, useCallback } from 'react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { BrainCircuit, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdaptiveTest = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Test State
  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [testResponses, setTestResponses] = useState([]);
  
  // Metrics State
  const [metrics, setMetrics] = useState({
    correct: 0,
    totalTime: 0,
    wrongAnswers: 0,
    skippedQuestions: 0
  });

  const startTimeRef = useRef(0);
  const [explanation, setExplanation] = useState("");

  const startTestSequence = async () => {
    setLoading(true);
    try {
      const { data: qData } = await api.get('/tests/generate/adaptive');
      setQuestions(qData.data || []);
      
      if (qData.data && qData.data.length > 0) {
        const { data: tData } = await api.post('/tests/start', { testType: 'adaptive' });
        setTestId(tData.data.testId);
        setStarted(true);
        startTimeRef.current = Date.now();
      } else {
        toast.error("Not enough questions in bank to generate test.");
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to start test. Check database connection.');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const handleAnswer = useCallback(async (selectedIndex) => {
    if (!currentQ || !testId) return;
    const timeSpent = Date.now() - startTimeRef.current;
    const isSkip = selectedIndex === -1;
    const selectedOption = isSkip ? null : currentQ.options[selectedIndex];
    const isCorrect = !isSkip && !!selectedOption?.is_correct;

    const newResponse = {
      questionId: currentQ.id,
      optionId: isSkip ? null : selectedOption.id,
      responseTimeMs: timeSpent,
      isCorrect: isCorrect,
      wasSkipped: isSkip
    };

    const newMetrics = {
      ...metrics,
      correct: metrics.correct + (isCorrect ? 1 : 0),
      totalTime: metrics.totalTime + timeSpent,
      wrongAnswers: metrics.wrongAnswers + (!isCorrect && !isSkip ? 1 : 0),
      skippedQuestions: metrics.skippedQuestions + (isSkip ? 1 : 0)
    };

    const updatedResponses = [...testResponses, newResponse];
    
    setMetrics(newMetrics);
    setTestResponses(updatedResponses);

    if (!isLast) {
      setCurrentIdx(c => c + 1);
      startTimeRef.current = Date.now();
    } else {
      // Submit the entire batch to process RL rewards and DKT logic sequentially
      setLoading(true);
      try {
        const { data } = await api.post('/tests/submit', { testId, responses: updatedResponses });
        toast.success('Adaptive test completed successfully!');
        navigate('/student/test/result', { state: { explanation: data.data.recommendation?.explanation, metrics: newMetrics } });
      } catch (error) {
        console.error(error);
        toast.error("Failed to process test logic");
        setLoading(false);
      }
    }
  }, [currentQ, testId, metrics, testResponses, isLast, navigate]);

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 mt-10">
        <div className="text-center mb-8">
          <BrainCircuit size={48} className="text-primary-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Adaptive Test</h1>
          <p className="text-slate-500 dark:text-slate-400">Questions are dynamically generated based on your weak/strong knowledge state.</p>
        </div>
        <GlassCard className="p-12 text-center flex flex-col items-center">
          <h2 className="text-xl mb-6">Are you ready to begin?</h2>
          <Button onClick={startTestSequence} disabled={loading}>
            {loading ? 'Starting Engine...' : 'Start Adaptive Test'}
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 mt-10 text-center animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Adaptive Engine <span className="text-sm font-normal text-slate-500 ml-2">(Question {currentIdx + 1} of {questions.length})</span></h1>
        <div className="flex items-center gap-2 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-4 py-2 rounded-full font-medium capitalize">
          <Activity size={18} /> Level: {currentQ.difficulty}
        </div>
      </div>

      <GlassCard className="p-8">
        <h2 className="text-xl font-medium mb-6">{currentQ.text}</h2>
        <div className="space-y-3 relative">
          {loading && (
             <div className="absolute inset-0 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
             </div>
          )}
          {currentQ.options?.map((opt, idx) => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(idx)}
              disabled={loading}
              className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              {opt.text}
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button variant="secondary" onClick={() => handleAnswer(-1)} disabled={loading}>
            Skip Question
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdaptiveTest;
