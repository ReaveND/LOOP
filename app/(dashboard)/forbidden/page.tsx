import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata = {
  title: '403 — Access Denied | LOOP',
};

export default function ForbiddenPage() {
  return (
    <div className="flex h-[60vh] items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <Shield className="w-10 h-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to view this page. Contact your workspace admin if you think this is a mistake.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
