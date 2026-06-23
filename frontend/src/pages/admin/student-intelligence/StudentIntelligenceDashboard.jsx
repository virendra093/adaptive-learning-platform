import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Download, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import SkeletonLoader from '../../../components/common/SkeletonLoader';

import StudentOverview from './components/StudentOverview';
import AcademicPerformance from './components/AcademicPerformance';
import PerformanceGrowth from './components/PerformanceGrowth';
import LearningJourney from './components/LearningJourney';
import DomainPerformance from './components/DomainPerformance';
import TopicMastery from './components/TopicMastery';
import KnowledgeRadar from './components/KnowledgeRadar';
import BehaviorAndPersona from './components/BehaviorAndPersona';
import FeedbackAndSupport from './components/FeedbackAndSupport';

const StudentIntelligenceDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const res = await api.get(`/admin/student-intelligence/${id}`);
        setData(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load student intelligence data");
      } finally {
        setLoading(false);
      }
    };
    fetchIntelligence();
  }, [id]);

  const handleExport = () => {
    window.print(); // Simple PDF export using browser print dialogue
    toast.success("Preparing PDF export...");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-32 rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <SkeletonLoader className="h-64 rounded-2xl col-span-2" />
          <SkeletonLoader className="h-64 rounded-2xl col-span-1" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-slate-500">Student not found.</div>;

  const tabs = [
    { id: 'overview', label: 'Overview & Growth' },
    { id: 'mastery', label: 'Topic Mastery & Domains' },
    { id: 'behavior', label: 'Behavior & Persona' },
    { id: 'support', label: 'Feedback & Support' }
  ];

  return (
    <div className="space-y-6 pb-20 printable-area">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/students')}
            className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              {data.overview.name || 'Unknown Student'}'s Intelligence Center
              {data.overview.riskLevel === 'High Risk' && (
                <span className="flex items-center gap-1 text-sm bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-3 py-1 rounded-full font-medium">
                  <AlertTriangle size={16} /> High Risk
                </span>
              )}
              {data.overview.riskLevel === 'Low Risk' && (
                <span className="flex items-center gap-1 text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1 rounded-full font-medium">
                  <ShieldCheck size={16} /> Low Risk
                </span>
              )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">ID: {data.overview.id} • Registered: {new Date(data.overview.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 md:flex-none text-center ${
              activeTab === tab.id 
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <StudentOverview data={data.overview} />
              <AcademicPerformance data={data.academicSummary} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PerformanceGrowth timeline={data.timeline} />
                </div>
                <div>
                  <LearningJourney timeline={data.timeline} recommendations={data.recommendations} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mastery' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <KnowledgeRadar domains={data.domains} />
                </div>
                <div className="lg:col-span-2">
                  <DomainPerformance domains={data.domains} />
                </div>
              </div>
              <TopicMastery topics={data.topics} />
            </div>
          )}

          {activeTab === 'behavior' && (
            <BehaviorAndPersona overview={data.overview} />
          )}

          {activeTab === 'support' && (
            <FeedbackAndSupport feedback={data.feedback} tickets={data.tickets} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentIntelligenceDashboard;
