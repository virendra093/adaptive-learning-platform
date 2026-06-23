import React from 'react';
import GlassCard from '../../../../components/common/GlassCard';
import { MessageSquare, Ticket, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const FeedbackAndSupport = ({ feedback, tickets }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Student Feedback Center */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <MessageSquare className="text-primary-500" />
          Student Feedback History
        </h2>

        {!feedback || feedback.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="text-slate-300 dark:text-slate-600 mx-auto mb-3" size={32} />
            <p className="text-slate-500 dark:text-slate-400">No feedback submitted by this student.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((f, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                    {f.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(f.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">"{f.content}"</p>
                {f.rating && (
                  <div className="mt-3 flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                      <svg key={idx} className={`w-4 h-4 ${idx < f.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Raised Questions / Support Tickets */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Ticket className="text-indigo-500" />
          Raised Questions & Support
        </h2>

        {!tickets || tickets.length === 0 ? (
          <div className="text-center py-10">
            <Ticket className="text-slate-300 dark:text-slate-600 mx-auto mb-3" size={32} />
            <p className="text-slate-500 dark:text-slate-400">No support tickets raised.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                      t.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}>
                      {t.priority || 'Normal'}
                    </span>
                    <span className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {t.category}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    t.status === 'Resolved' || t.status === 'Closed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {t.status === 'Resolved' || t.status === 'Closed' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {t.status || 'Open'}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-3">{t.description}</p>
                
                {t.admin_notes && (
                  <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Admin Response:</span>
                    <span className="text-slate-600 dark:text-slate-400">{t.admin_notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default FeedbackAndSupport;
