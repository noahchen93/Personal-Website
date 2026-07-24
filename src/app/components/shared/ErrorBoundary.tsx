import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex items-center space-x-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium">出现错误</h3>
          </div>
          <p className="text-red-700 text-sm mt-2">
            内容渲染时发生错误，请刷新页面重试。
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-3">
              <summary className="text-red-600 cursor-pointer text-sm">错误详情</summary>
              <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap bg-red-100 p-2 rounded">
                {this.state.error.message}
                {this.state.error.stack && '\n' + this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}