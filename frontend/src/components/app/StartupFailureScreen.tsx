import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { clearLocalAppData } from '@/lib/clearLocalAppData';

interface StartupFailureScreenProps {
  reason?: string;
}

export function StartupFailureScreen({ reason }: StartupFailureScreenProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleClearAndReload = () => {
    clearLocalAppData();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Startup Failed</h1>
          <p className="text-muted-foreground">
            The application failed to initialize properly.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Initialization Error</AlertTitle>
          <AlertDescription>
            {reason || 'The application could not connect to the backend service. This may be due to network issues or corrupted local data.'}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            onClick={handleReload}
            className="w-full"
            size="lg"
          >
            Reload Page
          </Button>

          <Button
            onClick={handleClearAndReload}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Clear Local Data & Reload
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          If the problem persists, please try again later or contact support.
        </p>
      </div>
    </div>
  );
}
