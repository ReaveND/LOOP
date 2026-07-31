'use client';

import { useEffect, useState } from 'react';
import { StatCardsRow } from '@/components/dashboard/stat-card';
import {
  FeedbackVolumeChart,
  SentimentDistribution,
  ChannelDistribution,
} from '@/components/dashboard/feedback-chart';
import { RecentFeedback } from '@/components/dashboard/recent-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface TopTheme {
  id: string;
  name: string;
  color: string | null;
  count: number;
}

function TopThemesCard() {
  const [themes, setThemes] = useState<TopTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => setThemes(d.topThemes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top Themes
        </CardTitle>
        <CardDescription>By feedback volume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-12" />
            </div>
          ))
        ) : themes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No themes yet. AI classification will group feedback into themes.
          </p>
        ) : (
          themes.map((theme) => (
            <div key={theme.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{theme.name}</span>
              <Badge variant="secondary">{theme.count} items</Badge>
            </div>
          ))
        )}
        <Link href="/trends">
          <Button variant="outline" className="w-full mt-4">
            View All Themes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time feedback overview for your workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
        </div>
      </div>

      {/* Stat Cards — real data */}
      <StatCardsRow />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FeedbackVolumeChart />
        <SentimentDistribution />
        <ChannelDistribution />
      </div>

      {/* Recent Feedback Table */}
      <RecentFeedback />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TopThemesCard />

        <Card className="border-border bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Ask LOOP
            </CardTitle>
            <CardDescription>AI-grounded Q&amp;A</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Ask plain-English questions about your feedback and get answers backed by real customer data.
            </div>
            <Link href="/ask">
              <Button variant="outline" className="w-full">
                Ask a Question
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-secondary/5 to-transparent hover:from-secondary/10 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Voice of Customer
            </CardTitle>
            <CardDescription>Weekly digest reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Generate a weekly digest report you could forward to leadership — summarising themes, sentiment, and recommended actions.
            </div>
            <Link href="/reports">
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
