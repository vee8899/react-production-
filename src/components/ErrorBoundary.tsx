import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[100svh] flex flex-col items-center justify-center gap-6 p-8"
          style={{ background: "#FEFDFC" }}
        >
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold mb-2" style={{ color: "#0F0E0D" }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: "#6B6762" }}>
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: "#0F0E0D",
                color: "#FEFDFC",
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}