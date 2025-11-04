// src/components/ui/ErrorBoundary.tsx
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100 dark:bg-gray-900 p-6">
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Something went wrong 💥
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {this.state.errorMessage || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleReload}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Reload App
          </button>
          {this.props.fallback && (
            <div className="mt-4">{this.props.fallback}</div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
