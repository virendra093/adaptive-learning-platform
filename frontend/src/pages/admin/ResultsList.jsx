import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Search } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

const ResultsList = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get(`/admin/results?search=${debouncedSearchTerm}&limit=100`);
        setResults(data.data?.data || []);
      } catch (error) { console.error(error);
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedSearchTerm]);

  const filteredResults = results;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-primary-500" /> Test Results
        </h1>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 mb-6">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search results by student name or email..."
            className="w-full bg-transparent border-none focus:outline-none ml-3 text-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <SkeletonLoader count={5} className="h-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-500">
                  <th className="p-4 font-medium">Test ID</th>
                  <th className="p-4 font-medium">Student Name</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-center">Score</th>
                  <th className="p-4 font-medium text-center">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r) => (
                  <tr key={r.resultId} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-slate-500">#{r.resultId}</td>
                    <td className="p-4">
                      <p className="font-medium">{r.studentName}</p>
                      <p className="text-xs text-slate-500">{r.email}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {new Date(r.testDate).toLocaleString()}
                    </td>
                    <td className="p-4 text-center font-bold text-slate-800 dark:text-white">
                      {r.total_score}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${r.accuracy >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.accuracy >= 0.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {Math.round(r.accuracy * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-500">
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ResultsList;
