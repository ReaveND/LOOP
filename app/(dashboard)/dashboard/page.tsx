import { STAT_CARDS } from '@/lib/constants';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  FeedbackVolumeChart,
  SentimentDistribution,
  ChannelDistribution,
} from '@/components/dashboard/feedback-chart';
import { RecentFeedback } from '@/components/dashboard/recent-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | LOOP',
  description: 'View your feedback analytics and insights',
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your feedback overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Zap className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

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
        <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent hover:bg-gradient-to-br hover:from-primary/10 hover:to-transparent transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance</span>
              <Badge variant="secondary">↑ 12.5%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">UI/UX</span>
              <Badge variant="secondary">↑ 8.3%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Feature Requests</span>
              <Badge variant="secondary">↑ 5.2%</Badge>
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Themes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-accent/5 to-transparent hover:bg-gradient-to-br hover:from-accent/10 hover:to-transparent transition-colors">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Auto-generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-medium mb-1">Key Finding</p>
              <p className="text-muted-foreground">
                Performance issues are trending up. Consider prioritizing optimization.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Ask LOOP More
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-secondary/5 to-transparent hover:bg-gradient-to-br hover:from-secondary/10 hover:to-transparent transition-colors">
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">• 12 themes analyzed</p>
              <p className="text-muted-foreground">• 847 new feedback items</p>
              <p className="text-muted-foreground">• 3 reports generated</p>
            </div>
            <Button variant="outline" className="w-full">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
