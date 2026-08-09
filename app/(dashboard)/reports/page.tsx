'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Calendar,
  TrendingUp,
  Loader2,
  Sparkles,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  generatedBy: { name: string; email: string };
  contentJson: {
    stats: {
      totalFeedback: number;
      sentimentBreakdown: { positive: number; neutral: number; negative: number };
      topThemes: Array<{ name: string; count: number }>;
    };
    narrative: {
      executiveSummary: string;
      keyFindings: string[];
    };
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatPeriod(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate form state
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState(false);
  const [genForm, setGenForm] = useState({
    title: '',
    periodStart: '',
    periodEnd: '',
  });

  async function fetchReports() {
    try {
      setError(null);
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error(`Failed to load reports (${res.status})`);
      const data = await res.json();
      setReports(data.data ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReports(); }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!genForm.title || !genForm.periodStart || !genForm.periodEnd) return;

    setGenerating(true);
    setGenError(null);
    setGenSuccess(false);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      setGenSuccess(true);
      setGenForm({ title: '', periodStart: '', periodEnd: '' });
      await fetchReports();
      setTimeout(() => {
        setShowGenerate(false);
        setGenSuccess(false);
      }, 1500);
    } catch (e: any) {
      setGenError(e.message ?? 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this report?')) return;
    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // silently handle
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Voice of Customer Reports</h1>
          <p className="text-muted-foreground mt-1">
            AI-generated digests you can forward to leadership
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => setShowGenerate(true)}
          id="generate-report-btn"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </Button>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate VoC Report
            </DialogTitle>
            <DialogDescription>
              Choose a period and LOOP AI will analyze your feedback and write a professional report.
            </DialogDescription>
          </DialogHeader>

          {genSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-medium text-foreground">Report generated successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="report-title">Report Title</Label>
                <Input
                  id="report-title"
                  placeholder="e.g. Weekly Digest — Aug 4–10"
                  value={genForm.title}
                  onChange={(e) => setGenForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period-start">Period Start</Label>
                  <Input
                    id="period-start"
                    type="date"
                    value={genForm.periodStart}
                    onChange={(e) => setGenForm((f) => ({ ...f, periodStart: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period-end">Period End</Label>
                  <Input
                    id="period-end"
                    type="date"
                    value={genForm.periodEnd}
                    onChange={(e) => setGenForm((f) => ({ ...f, periodEnd: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {genError && (
                <div className="flex items-center gap-2 text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {genError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowGenerate(false)}
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary gap-2"
                  disabled={generating}
                  id="confirm-generate-btn"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reports List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border bg-card/50 animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Failed to load reports</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => { setLoading(true); fetchReports(); }}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-lg">No reports yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate your first Voice-of-Customer report to get AI-powered insights on your feedback.
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setShowGenerate(true)}
            >
              <Sparkles className="w-4 h-4" />
              Generate First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const stats = report.contentJson?.stats;
              const narrative = report.contentJson?.narrative;
              const negPct = stats?.totalFeedback > 0
                ? Math.round((stats.sentimentBreakdown.negative / stats.totalFeedback) * 100)
                : 0;

              return (
                <Card
                  key={report.id}
                  className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-1">
                      <CardTitle className="text-lg leading-tight pr-2">{report.title}</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex-shrink-0">
                        Ready
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      {formatPeriod(report.periodStart, report.periodEnd)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-muted/40 rounded-lg">
                        <p className="text-lg font-bold text-foreground">{stats?.totalFeedback ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground">Items</p>
                      </div>
                      <div className="p-2 bg-muted/40 rounded-lg">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{negPct}%</p>
                        <p className="text-[10px] text-muted-foreground">Negative</p>
                      </div>
                      <div className="p-2 bg-muted/40 rounded-lg">
                        <p className="text-lg font-bold text-foreground">{stats?.topThemes?.length ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground">Themes</p>
                      </div>
                    </div>

                    {/* Executive summary snippet */}
                    {narrative?.executiveSummary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {narrative.executiveSummary}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      By {report.generatedBy?.name} · {formatDate(report.createdAt)}
                    </p>

                    <div className="flex gap-2 pt-1">
                      <Link href={`/reports/${report.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/reports/${report.id}?print=1`} className="flex-1" target="_blank">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          <Download className="w-3 h-3" />
                          Export
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(report.id)}
                        title="Delete report"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary card */}
          {reports.length > 0 && (
            <Card className="border-border bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Latest Report Highlights
                </CardTitle>
                <CardDescription>{reports[0].title} · {formatPeriod(reports[0].periodStart, reports[0].periodEnd)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports[0].contentJson?.narrative?.keyFindings?.length > 0 && (
                  <ul className="space-y-2">
                    {reports[0].contentJson.narrative.keyFindings.slice(0, 4).map((finding, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="pt-2 border-t border-border flex gap-2">
                  <Link href={`/reports/${reports[0].id}`} className="flex-1">
                    <Button className="w-full bg-primary gap-2">
                      <Eye className="w-4 h-4" />
                      View Full Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
