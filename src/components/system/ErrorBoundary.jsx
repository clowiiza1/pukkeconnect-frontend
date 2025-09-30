import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled application error", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback: FallbackComponent, children } = this.props;

    if (!hasError) return children;

    if (FallbackComponent) {
      return <FallbackComponent error={error} resetErrorBoundary={this.handleReset} />;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-dark">Something went wrong</h1>
          <p className="text-sm text-dark/70">
            An unexpected error occurred. You can try refreshing the page or returning home.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.assign("/")}
              className="w-full rounded-lg bg-gradient-to-r from-mediumpur to-softlav px-4 py-2 text-white"
            >
              Go to Home
            </button>
            <button
              onClick={this.handleReset}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-dark/80 hover:border-mediumpur"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
