import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { HelpCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/admin/tickets');
      setTickets(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Resolved' ? 'Open' : 'Resolved';
    const notes = prompt("Enter admin notes (optional):", "");
    if (notes === null) return;

    try {
      await api.put(`/support/admin/tickets/${id}`, { status: newStatus, adminNotes: notes });
      toast.success("Ticket updated");
      fetchTickets();
    } catch (error) {
      toast.error("Failed to update ticket");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="text-primary-500" /> Support Tickets</h1>

      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          tickets.map(ticket => (
            <GlassCard key={ticket.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {ticket.status}
                  </span>
                  <span className="text-sm font-medium text-slate-500">{ticket.category}</span>
                  <span className="text-xs text-slate-400">By {ticket.user_name}</span>
                </div>
                {ticket.question_context && <p className="text-xs text-primary-600 mb-1 font-mono">{ticket.question_context}</p>}
                <p className="text-slate-800 dark:text-slate-200 font-medium">{ticket.description}</p>
                {ticket.admin_notes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border-l-2 border-l-primary-500">
                    <span className="font-bold text-primary-600">Your Reply: </span> {ticket.admin_notes}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-bold px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 uppercase">
                  {ticket.priority} Priority
                </span>
                <Button size="sm" variant={ticket.status === 'Resolved' ? 'secondary' : 'primary'} onClick={() => handleUpdate(ticket.id, ticket.status)}>
                  {ticket.status === 'Resolved' ? 'Reopen' : 'Resolve'}
                </Button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
