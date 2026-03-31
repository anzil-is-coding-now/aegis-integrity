import * as React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-2xl text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-black uppercase italic mb-4 tracking-tight text-gray-900">System Interrupted</h1>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              An unexpected error occurred within the Aegis Integrity ecosystem. 
              Our automated diagnostics have logged the event for analysis.
            </p>

            {this.state.error && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-8 text-left overflow-hidden">
                <p className="text-[10px] font-mono text-red-600 uppercase mb-1 tracking-widest">Error Trace</p>
                <p className="text-[11px] font-mono text-gray-500 break-all leading-tight">
                  {this.state.error.message || 'Unknown internal error'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all group shadow-md shadow-orange-100"
              >
                <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Reload
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
            
            <p className="mt-8 text-[9px] text-gray-400 font-mono uppercase tracking-[0.2em]">
              Aegis Integrity • Error Code: 0x505_FAIL
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
