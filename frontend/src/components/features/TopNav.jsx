import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <span className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, </span>
        <span className="font-bold text-slate-800 dark:text-white">{user?.name}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <User size={18} />
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-500 transition-colors p-2"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
