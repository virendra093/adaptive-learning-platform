import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { BrainCircuit } from 'lucide-react';

const RegisterPage = () => {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password, 'student');
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full">
      <div className="text-center mb-8">
        <BrainCircuit size={40} className="text-primary-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h2>
        <p className="text-slate-500 dark:text-slate-400">Join AptitudeAI today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          {...formRegister('name', { required: 'Name is required' })}
          error={errors.name}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          {...formRegister('email', { required: 'Email is required' })}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...formRegister('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
          error={errors.password}
        />
        
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Register'}
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account? <Link to="/login" className="text-primary-500 hover:underline">Sign in</Link>
      </p>
    </GlassCard>
  );
};

export default RegisterPage;
