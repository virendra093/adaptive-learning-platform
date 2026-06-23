import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/common/GlassCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Search, BrainCircuit, Activity, ChevronRight, TrendingUp } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { motion } from 'framer-motion';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPersona, setFilterPersona] = useState('All');
  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get(`/admin/students?search=${debouncedSearchTerm}&limit=100`);
        setStudents(data.data?.data || []);
      } catch (error) { 
        console.error(error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [debouncedSearchTerm]);

  const filteredStudents = students.filter(s => filterPersona === 'All' || s.persona === filterPersona);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
            <Users className="text-primary-500 w-8 h-8" /> 
            Student Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 ml-11">Manage and analyze student learning journeys</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Bar */}
        <div className="lg:col-span-3">
          <div className="flex items-center bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search students by name or email..."
              className="w-full bg-transparent border-none focus:outline-none ml-3 text-slate-800 dark:text-white placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter */}
        <div className="lg:col-span-1">
          <select 
            className="w-full h-full bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3 text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer"
            value={filterPersona}
            onChange={(e) => setFilterPersona(e.target.value)}
          >
            <option value="All">All Personas</option>
            <option value="Fast Learner">Fast Learner</option>
            <option value="Consistent Learner">Consistent Learner</option>
            <option value="Needs Reinforcement">Needs Reinforcement</option>
            <option value="New Learner">New Learner</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <SkeletonLoader key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredStudents.map((s) => (
            <motion.div key={s.id} variants={itemVariants}>
              <GlassCard className="p-0 overflow-hidden hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 border-t-4 border-t-primary-500 flex flex-col h-full">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {(s.name || s.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{s.name || 'Unknown Student'}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{s.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        <BrainCircuit size={14} className="text-primary-500" />
                        Persona
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                        {s.persona || 'Evaluating'}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        <TrendingUp size={14} className="text-amber-500" />
                        Level
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm capitalize">
                        {s.currentLevel || 'Unranked'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500 dark:text-slate-400">Overall Accuracy</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{s.avgAccuracy ? Math.round(s.avgAccuracy * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${s.avgAccuracy ? Math.round(s.avgAccuracy * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 p-4">
                  <button 
                    onClick={() => navigate(`/admin/students/${s.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                  >
                    View Full Analytics
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Users className="text-slate-400 w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No students found</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default StudentList;
