import React, { useState } from 'react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { MessageSquare, Star, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const [category, setCategory] = useState('UI/UX');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error('Please enter feedback content');
    
    setLoading(true);
    try {
      await api.post('/support/feedback', { category, content, rating });
      toast.success('Feedback submitted successfully!');
      setContent('');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
            <MessageSquare className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Platform Feedback</h1>
            <p className="text-slate-500">Help us improve the adaptive learning experience</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="UI/UX">UI/UX Improvements</option>
              <option value="Questions">Question Quality</option>
              <option value="Adaptive Engine">Adaptive Engine</option>
              <option value="Performance">Performance/Bugs</option>
              <option value="Feature Request">Feature Request</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                >
                  <Star fill="currentColor" size={32} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Detailed Feedback</label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us what you liked or what could be better..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
            {loading ? 'Submitting...' : <><Send size={18} /> Submit Feedback</>}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default FeedbackPage;
