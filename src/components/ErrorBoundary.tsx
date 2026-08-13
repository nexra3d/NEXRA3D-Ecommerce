import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  fallbackTitle?: string;
  onReset?: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Admin ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 my-4 text-center text-slate-200 shadow-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-rose-400 mb-2">
            {this.props.fallbackTitle || 'Unable to load Add Product'}
          </h3>
          <p className="text-xs text-slate-400 mb-5 max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
