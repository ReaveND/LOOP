import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | LOOP',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Glowing number */}
        <div className="relative">
          <span className="text-[10rem] font-black text-primary/10 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-black bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/inbox"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6"
          >
            View Inbox
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/60">
          LOOP — AI Customer Feedback Intelligence
        </p>
      </div>
    </div>
  );
}
