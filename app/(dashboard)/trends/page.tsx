'use client';

import { useState } from 'react';
import { THEMES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'High':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
}

const THEME_TREND_DATA = [
  { date: 'Week 1', value: 28 },
  { date: 'Week 2', value: 35 },
  { date: 'Week 3', value: 42 },
  { date: 'Week 4', value: 38 },
];

export default function TrendsPage() {
  const [selectedTheme, setSelectedTheme] = useState<typeof THEMES[0] | null>(null);

  const sortedThemes = [...THEMES].sort((a, b) => b.growth - a.growth);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Theme Trends</h1>
          <p className="text-muted-foreground mt-1">Track emerging themes in customer feedback</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Zap className="w-4 h-4" />
          Generate Report
        </Button>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedThemes.map((theme) => (
          <div
            key={theme.id}
            className="cursor-pointer"
            onClick={() => setSelectedTheme(theme)}
          >
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{theme.name}</CardTitle>
                    <CardDescription className="mt-1">{theme.count} feedback items</CardDescription>
                  </div>
                  <Badge className={getSeverityColor(theme.severity)}>
                    {theme.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Growth Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Growth</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{theme.growth}%
                  </span>
                </div>

                {/* Mini Chart */}
                <div className="h-12 -mx-6 -mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={THEME_TREND_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={theme.color.replace('bg-', '')}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Action */}
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Top Alerts */}
      <Card className="border-border bg-gradient-to-r from-red-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            Alerts
          </CardTitle>
          <CardDescription>Issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Performance issues surge</p>
              <p className="text-sm text-muted-foreground mt-1">
                Performance-related feedback is up 12.5% this week. Consider prioritizing optimization work.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">New theme detected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Users are mentioning &quot;integration&quot; concerns. This is a new emerging theme to monitor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Detail Dialog */}
      <Dialog open={!!selectedTheme} onOpenChange={() => setSelectedTheme(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${selectedTheme?.color}`} />
              {selectedTheme?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTheme?.count} feedback items • Growth: +{selectedTheme?.growth}%
            </DialogDescription>
          </DialogHeader>
          {selectedTheme && (
            <div className="space-y-6">
              {/* Chart */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Trend Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={THEME_TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="date" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="rgb(var(--color-primary) / 1)"
                      strokeWidth={2}
                      dot={{ fill: 'rgb(var(--color-primary) / 1)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{selectedTheme.count}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Growth</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    +{selectedTheme.growth}%
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Severity</p>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(selectedTheme.severity)}>
                      {selectedTheme.severity}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Related Feedback */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Recent Related Feedback</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="p-2 bg-muted/30 rounded text-sm text-foreground">
                    • The new dashboard UI is incredibly intuitive and responsive.
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-sm text-foreground">
                    • Would love to see dark mode support for the application.
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-sm text-foreground">
                    • The onboarding process was confusing. Too many steps.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary">Create Action Item</Button>
                <Button variant="outline" className="flex-1">
                  Share Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
