import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface InitializationFailureScreenProps {
  error: Error | null;
  onRetry: () => void;
  onClearData: () => void;
}

export function InitializationFailureScreen({
  error,
  onRetry,
  onClearData,
}: InitializationFailureScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    onRetry();
    // Reset after a short delay to allow the retry to start
    setTimeout(() => setIsRetrying(false), 1000);
  };

  const handleClearData = () => {
    setIsClearing(true);
    onClearData();
    // Reset after a short delay to allow the clear to complete
    setTimeout(() => setIsClearing(false), 1000);
  };

  const isTimeout = error?.message?.includes('timed out');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Initialization Failed</h1>
          <p className="text-muted-foreground">
            {isTimeout 
              ? 'The application took too long to start. This may be due to network issues or backend unavailability.'
              : 'We encountered an error while starting the application.'}
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{isTimeout ? 'Timeout Error' : 'Initialization Error'}</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            {error?.message || 'An unknown error occurred during initialization.'}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            className="w-full"
            size="lg"
            disabled={isRetrying || isClearing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry Initialization'}
          </Button>

          <Button
            onClick={handleClearData}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isRetrying || isClearing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isClearing ? 'Clearing...' : 'Clear Local Data & Retry'}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            If the problem persists, try refreshing the page or clearing your browser cache.
          </p>
        </div>
      </div>
    </div>
  );
}
