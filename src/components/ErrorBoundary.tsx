import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ ERROR BOUNDARY CAUGHT:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl mb-4 text-red-400">Something went wrong</h1>
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-4">
              <h2 className="text-xl mb-2 text-slate-300">Error:</h2>
              <pre className="text-red-400 whitespace-pre-wrap text-sm">
                {this.state.error?.toString()}
              </pre>
            </div>
            {this.state.errorInfo && (
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                <h2 className="text-xl mb-2 text-slate-300">Stack Trace:</h2>
                <pre className="text-slate-400 whitespace-pre-wrap text-xs overflow-auto max-h-96">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
