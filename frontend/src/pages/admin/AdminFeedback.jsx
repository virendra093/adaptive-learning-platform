import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import { MessageSquare, Star } from 'lucide-react';
import api from '../../services/api';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get('/support/admin/feedback');
        setFeedback(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="text-primary-500" /> Student Feedback</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          feedback.map(item => (
            <GlassCard key={item.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{item.category}</h3>
                  <p className="text-xs text-slate-500">{item.user_name} ({item.user_email})</p>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(item.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{item.content}"</p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded uppercase font-medium">{item.status}</span>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
