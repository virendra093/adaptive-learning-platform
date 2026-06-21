import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { BrainCircuit } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col items-center justify-center relative overflow-hidden text-center p-6">
      <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 max-w-3xl"
      >
        <BrainCircuit size={64} className="text-primary-500 mx-auto mb-6" />
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
          Master Your Potential with <span className="text-gradient">AptitudeAI</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
          The next-generation personalized learning platform that dynamically adapts to your performance in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button className="w-full sm:w-48 text-lg py-3">Get Started</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="w-full sm:w-48 text-lg py-3">Admin Login</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
