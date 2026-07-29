'use client';

import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff, Settings, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error | null; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-heading text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-md">
        {error?.message || 'An unexpected error occurred. The component failed to render.'}
      </p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}

export function MapErrorFallback({ message, latitude, longitude }: { message?: string; latitude?: number | null; longitude?: number | null }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading text-lg font-semibold mb-2">Map Unavailable</h3>
      <p className="text-muted-foreground text-sm text-center mb-4 max-w-sm">
        {message || 'Unable to load the map. This may be due to missing API configuration or network issues.'}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload Page
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank')}>
          <ExternalLink className="w-3 h-3 mr-1" />
          Open in Google Maps
        </Button>
      </div>
    </div>
  );
}

export function MapComponentErrorFallback({ error, resetErrorBoundary }: { error: Error | null; resetErrorBoundary: () => void }) {
  return (
    <ErrorBoundary fallback={
      <div className="w-full h-[500px] flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="font-heading text-lg font-semibold mb-2">Map Error</h3>
        <p className="text-muted-foreground text-sm text-center mb-4 max-w-sm">
          {error?.message || 'Failed to load map component'}
        </p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    }>
      <div className="w-full h-full" />
    </ErrorBoundary>
  );
}