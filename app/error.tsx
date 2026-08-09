'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <span className="text-[10rem] font-black text-destructive/10 leading-none select-none">
              500
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl font-black text-destructive/70">
                500
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error?.digest && (
              <p className="text-xs text-muted-foreground/60 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-6"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
