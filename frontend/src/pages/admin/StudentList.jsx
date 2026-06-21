import { useState, useEffect } from 'react';
import GlassCard from '../../components/common/GlassCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Search } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get(`/admin/students?search=${debouncedSearchTerm}&limit=100`);
        setStudents(data.data?.data || []);
      } catch (error) { console.error(error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [debouncedSearchTerm]);

  const filteredStudents = students;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-primary-500" /> Student Management
        </h1>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 mb-6">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search students by name or email..."
            className="w-full bg-transparent border-none focus:outline-none ml-3 text-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <SkeletonLoader count={4} className="h-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-slate-500">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium text-center">Tests Taken</th>
                  <th className="p-4 font-medium text-center">Avg Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{s.email}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                        {s.testsTaken}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.avgAccuracy >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : s.avgAccuracy >= 0.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {s.avgAccuracy ? `${Math.round(s.avgAccuracy * 100)}%` : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-500">
                      No students found.
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

export default StudentList;
