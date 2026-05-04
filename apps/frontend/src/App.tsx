import './App.css';
import { AppRouter } from '@/routes';
import { Providers } from '@/context/providers.tsx';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Sentry from '@sentry/react';
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt';

function App() {
  return (
    <Sentry.ErrorBoundary>
      <ErrorBoundary>
        <Providers>
          <AppRouter />
          <Toaster />
          <PWAUpdatePrompt />
        </Providers>
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  );
}

export default App;
