import { Component } from 'react';
import GlassCard from './GlassCard';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full text-center p-8 border-red-500/20">
            <div className="mx-auto bg-red-100 dark:bg-red-900/30 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              An unexpected error occurred in this component.
            </p>
            <div className="bg-slate-100 dark:bg-surface-dark/50 p-4 rounded text-left text-xs text-red-600 dark:text-red-400 overflow-x-auto mb-6 font-mono">
              {this.state.error && this.state.error.toString()}
            </div>
            <Button onClick={() => window.location.reload()}>
              Reload Application
            </Button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
