'use client';

import { useState, useEffect } from 'react';
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
import { TrendingUp, AlertCircle, Zap, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function getSeverityColor(growthRate: number) {
  if (growthRate >= 50) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  } else if (growthRate >= 20) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
}

function getSeverityText(growthRate: number) {
  if (growthRate >= 50) return 'High';
  if (growthRate >= 20) return 'Medium';
  return 'Low';
}

export default function TrendsPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<any | null>(null);

  useEffect(() => {
    async function loadThemes() {
      try {
        const res = await fetch('/api/themes');
        if (res.ok) {
          const result = await res.json();
          setThemes(result.data);
        }
      } catch (error) {
        console.error("Failed to load themes", error);
      } finally {
        setLoading(false);
      }
    }
    loadThemes();
  }, []);

  const spikingThemes = themes.filter(t => t.isSpiking);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading trends...</p>
        </div>
      </div>
    );
  }

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

      {/* Top Alerts */}
      {spikingThemes.length > 0 && (
        <Card className="border-border bg-gradient-to-r from-red-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              Alerts
            </CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {spikingThemes.map((theme) => (
              <div key={theme.id} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">"{theme.name}" surge</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Feedback for this theme is up {theme.growthRate}% this week ({theme.currentPeriodCount} items vs {theme.previousPeriodCount} last week).
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="cursor-pointer"
            onClick={() => setSelectedTheme(theme)}
          >
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors h-full flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{theme.name}</CardTitle>
                    <CardDescription className="mt-1">{theme.totalCount} feedback items</CardDescription>
                  </div>
                  <Badge className={getSeverityColor(theme.growthRate)}>
                    {getSeverityText(theme.growthRate)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Growth Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Growth</span>
                    <span className={`text-lg font-bold flex items-center gap-1 ${theme.growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {theme.growthRate >= 0 && <TrendingUp className="w-4 h-4" />}
                      {theme.growthRate > 0 ? '+' : ''}{theme.growthRate}%
                    </span>
                  </div>

                  {/* Mini Chart visualization fallback */}
                  <div className="h-12 -mx-6 -mb-6 mt-4 opacity-50 px-6">
                    <div className="w-full h-full flex items-end gap-1">
                      <div className="w-1/2 bg-muted-foreground rounded-t" style={{ height: `${Math.max(10, Math.min(100, (theme.previousPeriodCount / (theme.totalCount || 1)) * 100))}%` }} />
                      <div className="w-1/2 bg-primary rounded-t" style={{ height: `${Math.max(10, Math.min(100, (theme.currentPeriodCount / (theme.totalCount || 1)) * 100))}%` }} />
                    </div>
                  </div>
                </div>

                {/* Action */}
                <Button variant="outline" className="w-full mt-4">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
        {themes.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
            No themes detected yet. Try importing more feedback.
          </div>
        )}
      </div>

      {/* Theme Detail Dialog */}
      <Dialog open={!!selectedTheme} onOpenChange={() => setSelectedTheme(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: selectedTheme?.color }} />
              {selectedTheme?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTheme?.totalCount} feedback items • Growth: {selectedTheme?.growthRate > 0 ? '+' : ''}{selectedTheme?.growthRate}%
            </DialogDescription>
          </DialogHeader>
          {selectedTheme && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{selectedTheme.totalCount}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Recent Growth</p>
                  <p className={`text-2xl font-bold mt-1 ${selectedTheme.growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selectedTheme.growthRate > 0 ? '+' : ''}{selectedTheme.growthRate}%
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Severity</p>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(selectedTheme.growthRate)}>
                      {getSeverityText(selectedTheme.growthRate)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Related Feedback */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Recent Related Feedback</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTheme.recentFeedback?.length > 0 ? (
                    selectedTheme.recentFeedback.map((f: any) => (
                      <div key={f.id} className="p-2 bg-muted/30 rounded text-sm text-foreground flex items-center justify-between">
                         <span className="truncate mr-2">• {f.content}</span>
                         <Badge variant="outline" className="text-[10px] uppercase">{f.sentiment}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No recent feedback.</div>
                  )}
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
