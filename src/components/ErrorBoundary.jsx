import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center">
          <AlertTriangle size={48} className="mb-4 text-red-400" />
          <h2 className="text-lg font-medium text-gray-700">页面出现错误</h2>
          <p className="mt-2 text-sm text-gray-500">
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white"
          >
            <RefreshCw size={16} />
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
