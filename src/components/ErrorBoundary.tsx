import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | null;
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
    console.error("Unhandled application error:", error, errorInfo);
  }

  private handleRetry = () => {
    // Attempt a soft reset, then reload as fallback
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-sm p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Ocorreu um erro</h1>
            <p className="text-sm text-muted-foreground mb-4">
              A aplicação encontrou um problema. Tente recarregar a página. Se o erro persistir, avise o suporte.
            </p>
            {this.state.error?.message && (
              <pre className="text-left text-xs bg-muted text-muted-foreground rounded-md p-3 overflow-auto mb-4 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
