import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { BrainCircuit } from 'lucide-react';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success('Login successful!');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full">
      <div className="text-center mb-8">
        <BrainCircuit size={40} className="text-primary-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
        <p className="text-slate-500 dark:text-slate-400">Sign in to your account</p>
        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm text-left text-slate-700 dark:text-slate-300">
          <p><strong>Demo accounts:</strong></p>
          <p>Student: student@example.com / student123</p>
          <p>Admin: admin@example.com / admin123</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="student@example.com"
          {...register('email', { required: 'Email is required' })}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password', { required: 'Password is required' })}
          error={errors.password}
        />
        
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account? <Link to="/register" className="text-primary-500 hover:underline">Register here</Link>
      </p>
    </GlassCard>
  );
};

export default LoginPage;
