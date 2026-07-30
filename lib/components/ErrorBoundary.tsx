'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Admin error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export interface MapErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
  latitude?: number;
  longitude?: number;
}

export function MapErrorFallback({ message = 'Map could not be loaded', onRetry, latitude, longitude }: MapErrorFallbackProps) {
  return (
    <Card className="w-full h-[500px] flex flex-col items-center justify-center bg-muted/30 border-border/50">
      <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="font-heading text-lg font-semibold mb-2">Map Unavailable</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">{message}</p>
        <div className="flex gap-3">
          {onRetry && (
            <Button variant="luxury" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
          {latitude != null && longitude != null && (
            <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank')}>
              Open in Google Maps
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
