'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
  error?: Error | string;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  onRetry,
  className,
  showDetails = false,
  error,
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Card className={cn('border-destructive/50', className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDetails && errorMessage && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium text-destructive">Error Details:</p>
            <p className="mt-2 text-sm text-muted-foreground font-mono break-all">
              {errorMessage}
            </p>
          </div>
        )}
        {onRetry && (
          <div className="flex justify-center">
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
