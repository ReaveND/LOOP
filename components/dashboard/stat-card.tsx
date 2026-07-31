'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageCircle,
  ThumbsUp,
  Minus,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsSummary {
  totalCount: number;
  sentimentCounts: { POSITIVE: number; NEUTRAL: number; NEGATIVE: number };
  percentNegative: number;
  newThisWeek: number;
}

interface StatCardData {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatCardsRow() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards: StatCardData[] = [
    {
      title: 'Total Feedback',
      value: (data?.totalCount ?? 0).toLocaleString(),
      subtitle: `${data?.newThisWeek ?? 0} new this week`,
      icon: <MessageCircle className="w-5 h-5" />,
      colorClass: 'text-blue-500 dark:text-blue-400',
    },
    {
      title: 'Positive',
      value: (data?.sentimentCounts.POSITIVE ?? 0).toLocaleString(),
      subtitle: data && data.totalCount > 0
        ? `${Math.round((data.sentimentCounts.POSITIVE / data.totalCount) * 100)}% of total`
        : 'No data yet',
      icon: <ThumbsUp className="w-5 h-5" />,
      colorClass: 'text-green-500 dark:text-green-400',
    },
    {
      title: 'Neutral',
      value: (data?.sentimentCounts.NEUTRAL ?? 0).toLocaleString(),
      subtitle: data && data.totalCount > 0
        ? `${Math.round((data.sentimentCounts.NEUTRAL / data.totalCount) * 100)}% of total`
        : 'No data yet',
      icon: <Minus className="w-5 h-5" />,
      colorClass: 'text-yellow-500 dark:text-yellow-400',
    },
    {
      title: 'Negative',
      value: (data?.sentimentCounts.NEGATIVE ?? 0).toLocaleString(),
      subtitle: `${data?.percentNegative ?? 0}% of total`,
      icon: <ThumbsDown className="w-5 h-5" />,
      colorClass: 'text-red-500 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={card.colorClass}>{card.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs mt-2 text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Legacy StatCard (kept for any external usage) ─────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  ThumbsUp: <ThumbsUp className="w-5 h-5" />,
  Minus: <Minus className="w-5 h-5" />,
  ThumbsDown: <ThumbsDown className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
};

export function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = !change.startsWith('-');
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary/60">{ICON_MAP[icon]}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={`text-xs mt-2 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}
