import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { HelpCircle, AlertCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: 'Academic', questionContext: '', description: '', priority: 'Medium' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data.data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return toast.error('Description is required');
    
    try {
      await api.post('/support/tickets', formData);
      toast.success('Ticket submitted successfully!');
      setShowForm(false);
      setFormData({ category: 'Academic', questionContext: '', description: '', priority: 'Medium' });
      fetchTickets();
    } catch (error) {
      toast.error('Failed to submit ticket');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="text-primary-500" /> Support Tickets</h1>
          <p className="text-slate-500">Raise questions or report issues</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? 'Cancel' : <><Plus size={18} /> New Ticket</>}
        </Button>
      </div>

      {showForm && (
        <GlassCard className="p-6 border-l-4 border-l-primary-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Academic">Academic Doubt</option>
                  <option value="Incorrect Question">Report Incorrect Question</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select 
                  value={formData.priority} 
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            
            {(formData.category === 'Academic' || formData.category === 'Incorrect Question') && (
              <div>
                <label className="block text-sm font-medium mb-1">Question Context (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Question ID or partial text"
                  value={formData.questionContext}
                  onChange={(e) => setFormData({...formData, questionContext: e.target.value})}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Explain your doubt or issue..."
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <Button type="submit">Submit Ticket</Button>
          </form>
        </GlassCard>
      )}

      <div className="space-y-4">
        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length > 0 ? (
          tickets.map(ticket => (
            <GlassCard key={ticket.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {ticket.status}
                  </span>
                  <span className="text-sm font-medium text-slate-500">{ticket.category}</span>
                  <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{ticket.description}</p>
                {ticket.admin_notes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border-l-2 border-l-primary-500">
                    <span className="font-bold text-primary-600">Admin Reply: </span> {ticket.admin_notes}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 uppercase">
                  {ticket.priority} Priority
                </span>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p>You haven't raised any tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;
