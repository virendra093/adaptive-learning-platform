import { useState, useEffect, useRef, useCallback } from 'react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import PostTestFeedbackModal from '../../components/features/PostTestFeedbackModal';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GeneralTest = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testResponses, setTestResponses] = useState([]);
  const [testId, setTestId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [testResultData, setTestResultData] = useState(null);
  
  const startTimeRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const initTest = async () => {
      try {
        const { data: qData } = await api.get('/tests/generate/general');
        setQuestions(qData.data || []);
        
        if (qData.data && qData.data.length > 0) {
          const { data: tData } = await api.post('/tests/start', { testType: 'general' });
          setTestId(tData.data.testId);
          startTimeRef.current = Date.now();
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load test. Check database connection.");
      } finally {
        setLoading(false);
      }
    };
    initTest();
  }, []);

  const question = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const handleSelect = (optionId) => {
    setAnswers({ ...answers, [question.id]: optionId });
  };

  const handleNext = useCallback(async () => {
    if (!question || !testId) return;

    const timeSpent = Date.now() - startTimeRef.current;
    const selectedOptionId = answers[question.id];
    const selectedOption = question.options?.find(o => o.id === selectedOptionId);
    
    const newResponse = {
      questionId: question.id,
      optionId: selectedOptionId,
      responseTimeMs: timeSpent,
      isCorrect: !!selectedOption?.is_correct
    };

    const updatedResponses = [...testResponses, newResponse];
    setTestResponses(updatedResponses);

    if (!isLast) {
      setCurrentIdx(c => c + 1);
      startTimeRef.current = Date.now();
    } else {
      setSubmitting(true);
      try {
        const { data } = await api.post('/tests/submit', { testId, responses: updatedResponses });
        toast.success("Test submitted successfully!");
        setTestResultData(data.data);
        setShowFeedbackModal(true);
      } catch (error) {
        console.error(error);
        toast.error("Failed to submit test");
        setSubmitting(false);
      }
    }
  }, [question, testId, answers, testResponses, isLast, navigate]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 mt-10 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (!questions || questions.length === 0 || !testId) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center">
        <GlassCard className="p-10">
          <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
          <p className="text-slate-500 mb-6">The administrator has not added any questions to the bank yet.</p>
          <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">General Aptitude Test</h1>
        <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>

      <GlassCard className="p-8">
        <h2 className="text-xl font-medium mb-6">{question.text}</h2>
        <div className="space-y-3">
          {question.options && question.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                answers[question.id] === opt.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md shadow-primary-500/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleNext} disabled={!answers[question.id] || submitting}>
            {submitting ? 'Submitting...' : isLast ? 'Submit Test' : 'Next Question'}
          </Button>
        </div>
      </GlassCard>

      {showFeedbackModal && testResultData && (
        <PostTestFeedbackModal 
          isOpen={showFeedbackModal} 
          onClose={() => setShowFeedbackModal(false)} 
          testResult={testResultData} 
          testType="general" 
        />
      )}
    </div>
  );
};

export default GeneralTest;
