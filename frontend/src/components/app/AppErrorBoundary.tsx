import { Component, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onClearData: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error boundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearAndReload = () => {
    this.props.onClearData();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                The application encountered an unexpected error. This may be due to initialization failure, network issues, or corrupted local data.
              </AlertDescription>
            </Alert>

            {this.state.error && (
              <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md overflow-auto max-h-32">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={this.handleReload} className="w-full" size="lg">
                Reload Page
              </Button>

              <Button
                onClick={this.handleClearAndReload}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Clear Local Data & Reload
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              If the problem continues, please check your internet connection, try using a different browser, or clear your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
