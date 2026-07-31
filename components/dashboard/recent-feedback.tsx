'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FeedbackItem {
  id: string;
  content: string;
  customerLabel: string | null;
  channel: string;
  sentiment: string | null;
  themes: string[];
  status: string;
  createdAt: string;
}

function getSentimentColor(sentiment: string | null) {
  if (!sentiment) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  switch (sentiment.toUpperCase()) {
    case 'POSITIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'NEGATIVE':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIONED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'REVIEWED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
}

export function RecentFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback?page=1&limit=5')
      .then((r) => r.json())
      .then((d) => setFeedbacks(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest 5 customer feedback submissions</CardDescription>
        </div>
        <Link href="/inbox">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center border-b border-border pb-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No feedback yet. Head to the Inbox to ingest your first items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feedback</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Channel</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sentiment</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Themes</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback) => (
                  <tr
                    key={feedback.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4 max-w-xs truncate text-foreground">
                      {feedback.content}
                    </td>
                    <td className="py-4 px-4 text-foreground whitespace-nowrap">
                      {feedback.customerLabel || 'Anonymous'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                      {feedback.channel}
                    </td>
                    <td className="py-4 px-4">
                      {feedback.sentiment ? (
                        <Badge className={getSentimentColor(feedback.sentiment)} variant="secondary">
                          {feedback.sentiment}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {feedback.themes.length > 0
                          ? feedback.themes.slice(0, 2).map((theme) => (
                              <Badge
                                key={theme}
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20 text-xs"
                              >
                                {theme}
                              </Badge>
                            ))
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(feedback.status)} variant="secondary">
                        {feedback.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(feedback.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
