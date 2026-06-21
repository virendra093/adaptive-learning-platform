import GlassCard from '../../components/common/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <GlassCard className="flex flex-col items-center text-center p-8">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          <User size={48} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold">{user?.name}</h2>
        <p className="text-slate-500">{user?.email}</p>
        <span className="mt-4 px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-sm font-medium capitalize">
          Role: {user?.role}
        </span>
      </GlassCard>
    </div>
  );
};

export default Profile;
