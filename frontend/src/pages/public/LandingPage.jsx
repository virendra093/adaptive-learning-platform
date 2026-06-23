import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { BrainCircuit, Target, Activity, Zap, TrendingUp, BarChart3, Users, BookOpen, Star, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: Zap, title: "Adaptive Testing", desc: "Real-time difficulty adjustment based on RL policies." },
    { icon: BrainCircuit, title: "Knowledge Tracking", desc: "DKT-inspired model traces your mastery across domains." },
    { icon: Activity, title: "Learning Persona", desc: "Behavioral analysis categorizes your learning style." },
    { icon: BarChart3, title: "Performance Analytics", desc: "Deep visual insights into your strengths and weaknesses." },
    { icon: Target, title: "Personalized Roadmap", desc: "AI-generated weekly plans to hit your goals." },
    { icon: MessageSquare, title: "Explainable AI", desc: "Understand exactly why you got a recommendation." }
  ];

  const stats = [
    { icon: Users, value: "10k+", label: "Students" },
    { icon: BookOpen, value: "50k+", label: "Questions" },
    { icon: Target, value: "15+", label: "Domains" },
    { icon: Zap, value: "100k+", label: "Adaptive Tests" }
  ];

  const workflowSteps = [
    { title: "Student Registration", desc: "Create your profile and set your learning goal." },
    { title: "General Assessment", desc: "Take a baseline test to map your initial knowledge state." },
    { title: "Behavioral Analysis", desc: "The AI evaluates your speed, accuracy, and guessing habits." },
    { title: "Adaptive Engine", desc: "Receive highly personalized tests that challenge your exact level." },
    { title: "Continuous Improvement", desc: "Follow the AI roadmap and track your DKT mastery." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark overflow-x-hidden font-sans text-slate-900 dark:text-slate-100">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-primary-500" size={28} />
          <span className="text-xl font-bold tracking-tight">AptitudeAI</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login"><Button variant="secondary" className="px-6">Login</Button></Link>
          <Link to="/register"><Button className="px-6">Register</Button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="z-10 max-w-4xl">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-sm border border-primary-200 dark:border-primary-800">
            Next-Generation EdTech Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Master Your Potential with <br/><span className="text-gradient">Adaptive Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Experience an educational platform that dynamically adapts to your cognitive behavior, predicting your knowledge state in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"><Button className="w-full sm:w-56 text-lg py-4 shadow-lg shadow-primary-500/25">Start Learning Free</Button></Link>
            <Link to="/login"><Button variant="secondary" className="w-full sm:w-56 text-lg py-4">Admin Access</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* About Platform */}
      <section className="py-20 px-6 bg-white dark:bg-surface-dark relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why AptitudeAI?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Traditional learning treats everyone the same. We use advanced DKT algorithms and Reinforcement Learning to personalize every single question you see.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-white/5 shadow-sm">
              <Activity className="text-rose-500 mb-4" size={32}/>
              <h3 className="text-xl font-bold mb-3">Behavioral Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">We analyze your response times, skip rates, and guessing patterns to classify your unique Learning Persona.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-white/5 shadow-sm">
              <TrendingUp className="text-emerald-500 mb-4" size={32}/>
              <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400">Watch your mastery scores grow across different domains through beautiful, interactive radar charts and trend lines.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-white/5 shadow-sm">
              <MessageSquare className="text-indigo-500 mb-4" size={32}/>
              <h3 className="text-xl font-bold mb-3">AI Recommendations</h3>
              <p className="text-slate-600 dark:text-slate-400">Get plain-English explanations on why you are struggling and an exact weekly roadmap to fix it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">How It Works</h2>
          <div className="relative border-l-2 border-primary-500/30 ml-4 md:ml-1/2">
            {workflowSteps.map((step, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="mb-10 ml-8 relative"
              >
                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-primary-500 border-4 border-slate-50 dark:border-background-dark" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-20 px-6 bg-slate-100 dark:bg-surface-dark/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Platform Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="glass-card hover:-translate-y-1 transition-transform duration-300">
                <feat.icon className="text-primary-500 mb-4" size={28}/>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto glass rounded-3xl p-10 bg-gradient-to-br from-primary-500 to-indigo-600 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, idx) => (
              <div key={idx}>
                <s.icon className="mx-auto mb-3 opacity-80" size={32}/>
                <h4 className="text-4xl font-black mb-1">{s.value}</h4>
                <p className="text-primary-100 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Student Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card">
              <div className="flex text-amber-400 mb-4">
                <Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"The adaptive engine knew exactly where my weak spots were in quantitative aptitude. I improved my score by 40% in just two weeks."</p>
              <p className="font-bold">- Rohan M., Engineering Student</p>
            </div>
            <div className="glass-card">
              <div className="flex text-amber-400 mb-4">
                <Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"The learning persona told me I was a 'Fast Guesser'. Slowing down and using the generated roadmap completely changed my study habits."</p>
              <p className="font-bold">- Anjali S., MBA Aspirant</p>
            </div>
            <div className="glass-card">
              <div className="flex text-amber-400 mb-4">
                <Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"As a final year project presentation, the tech stack and DKT implementation is incredibly impressive and visually stunning."</p>
              <p className="font-bold">- Prof. Sharma, Evaluator</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="bg-white dark:bg-surface-dark py-12 px-6 border-t border-slate-200 dark:border-white/5 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <BrainCircuit className="text-primary-500" size={24} />
              <span className="text-xl font-bold">AptitudeAI</span>
            </div>
            <p className="text-slate-500 text-sm">Advanced Agentic Coding Project.<br/>Empowering learners globally.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Research Innovations</h4>
            <ul className="text-slate-500 text-sm space-y-2">
              <li>DKT Knowledge Tracing</li>
              <li>RL Adaptive Policy Engine</li>
              <li>Explainable AI (XAI)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact & Support</h4>
            <ul className="text-slate-500 text-sm space-y-2">
              <li>support@aptitudeai.edu</li>
              <li>FAQ & Documentation</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
