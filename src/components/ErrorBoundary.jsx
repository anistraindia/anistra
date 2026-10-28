import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Anistra ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          {/* Subtle neon blue aura */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.12)_0%,rgba(0,0,0,0)_70%)] filter blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-md w-full angular-cut bg-[#0b0b0b] border border-white/[0.08] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center">
            <div className="w-14 h-14 angular-cut-sm bg-[#ff5a5f]/10 border border-[#ff5a5f]/30 flex items-center justify-center mb-5 text-[#ff5a5f] shadow-[0_0_20px_rgba(255,90,95,0.2)]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-extrabold tracking-tight uppercase font-heading text-white mb-2">
              Page Encountered an Error
            </h1>
            <p className="text-xs text-[#d8d8d8] mb-6 leading-relaxed">
              An unexpected issue occurred while rendering this page. You can safely return to explore or reload.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={this.handleReload}
                className="angular-btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RELOAD PAGE</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="angular-btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Home className="w-4 h-4" />
                <span>RETURN HOME</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
