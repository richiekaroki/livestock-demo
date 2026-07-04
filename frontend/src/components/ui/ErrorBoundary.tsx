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
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-bg-secondary p-6">
          <h1 className="text-3xl font-bold text-error mb-2">
            Something went wrong
          </h1>
          <p className="text-text-secondary mb-4">
            {this.state.errorMessage || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleReload}
            className="btn btn-primary"
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
