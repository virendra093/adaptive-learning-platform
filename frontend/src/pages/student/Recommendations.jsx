import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import { Lightbulb } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await api.get('/recommendations');
        setRecommendations(data.data || []);
      } catch (error) { console.error(error);
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Recommendations</h1>
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map(rec => (
            <GlassCard key={rec.id} className="border-l-4 border-primary-500">
              <div className="flex gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full h-fit">
                  <Lightbulb className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Suggested Focus: <span className="uppercase text-primary-600 dark:text-primary-400">{rec.recommended_difficulty || rec.recommendedDifficulty}</span></h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{rec.explanation}</p>
                  <p className="text-sm text-slate-400 mt-4">{new Date(rec.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center text-slate-500">
          <Lightbulb className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
          <p>No recommendations available yet. Take a test to get personalized feedback!</p>
        </GlassCard>
      )}
    </div>
  );
};

export default Recommendations;
