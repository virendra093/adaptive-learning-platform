import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Activity, Settings, Users, BrainCircuit, MessageSquare, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  
  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'General Test', path: '/student/test/general', icon: FileText },
    { name: 'Adaptive Test', path: '/student/test/adaptive', icon: BrainCircuit },
    { name: 'Recommendations', path: '/student/recommendations', icon: Activity },
    { name: 'Support Tickets', path: '/student/support', icon: HelpCircle },
    { name: 'Feedback', path: '/student/feedback', icon: MessageSquare },
    { name: 'Profile', path: '/student/profile', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
    { name: 'Manage Questions', path: '/admin/questions', icon: FileText },
    { name: 'Student Results', path: '/admin/results', icon: Activity },
    { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
    { name: 'Tickets', path: '/admin/tickets', icon: HelpCircle },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks.filter(link => {
    if (user?.general_assessment_completed) {
      return link.name !== 'General Test';
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gradient flex items-center gap-2">
          <BrainCircuit className="text-primary-500" />
          AptitudeAI
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isLocked = !user?.general_assessment_completed && user?.role !== 'admin' && (link.name === 'Adaptive Test' || link.name === 'Recommendations');
          return (
            <NavLink
              key={link.path}
              to={isLocked ? '#' : link.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive && !isLocked
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`
              }
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                {link.name}
              </div>
              {isLocked && <span className="text-xs font-bold text-rose-500">🔒</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
