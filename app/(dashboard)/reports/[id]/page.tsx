'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Printer,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Quote,
  BarChart3,
  FileText,
  Loader2,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';

interface ReportData {
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
      sentimentDelta: { positiveChange: number; negativeChange: number } | null;
      topThemes: Array<{ name: string; count: number; growthRate: number }>;
      verbatimQuotes: Array<{ content: string; channel: string; sentiment: string }>;
    };
    narrative: {
      executiveSummary: string;
      keyFindings: string[];
      sentimentAnalysis: string;
      topIssues: string[];
      recommendedActions: string[];
      conclusion: string;
    };
    generatedAt: string;
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === 'POSITIVE') return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Positive</Badge>;
  if (sentiment === 'NEGATIVE') return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Negative</Badge>;
  return <Badge variant="secondary" className="text-xs">Neutral</Badge>;
}

export default function ReportDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const shouldPrint = searchParams?.get('print') === '1';

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reports/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Report not found (${r.status})`);
        return r.json();
      })
      .then((d) => setReport(d.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-print if ?print=1
  useEffect(() => {
    if (shouldPrint && report && !hasPrinted.current) {
      hasPrinted.current = true;
      setTimeout(() => window.print(), 500);
    }
  }, [shouldPrint, report]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <p className="font-medium text-foreground text-lg">Report not found</p>
            <p className="text-sm text-muted-foreground mt-1">{error ?? 'This report does not exist or you do not have access.'}</p>
          </div>
          <Link href="/reports">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { stats, narrative } = report.contentJson;
  const negPct = stats.totalFeedback > 0
    ? Math.round((stats.sentimentBreakdown.negative / stats.totalFeedback) * 100)
    : 0;
  const posPct = stats.totalFeedback > 0
    ? Math.round((stats.sentimentBreakdown.positive / stats.totalFeedback) * 100)
    : 0;

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-card { border: 1px solid #e5e7eb !important; background: white !important; }
          h1, h2, h3, p, li { color: black !important; }
          .text-muted-foreground { color: #6b7280 !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header row — hidden in print */}
        <div className="flex items-center justify-between no-print">
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              All Reports
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.print()}
            id="print-report-btn"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>

        {/* Report Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Voice of Customer Report</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{report.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
            </span>
            <span>Generated by {report.generatedBy?.name}</span>
            <span>on {formatDateShort(report.createdAt)}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="border-primary/20 bg-primary/5 print-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{narrative.executiveSummary}</p>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="print-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.totalFeedback}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Feedback</p>
            </CardContent>
          </Card>
          <Card className="print-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{posPct}%</p>
              <p className="text-sm text-muted-foreground mt-1">Positive</p>
              {stats.sentimentDelta?.positiveChange !== undefined && (
                <p className={`text-xs mt-1 ${stats.sentimentDelta.positiveChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {stats.sentimentDelta.positiveChange > 0 ? '+' : ''}{stats.sentimentDelta.positiveChange}% vs prior
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="print-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{negPct}%</p>
              <p className="text-sm text-muted-foreground mt-1">Negative</p>
              {stats.sentimentDelta?.negativeChange !== undefined && (
                <p className={`text-xs mt-1 ${stats.sentimentDelta.negativeChange <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {stats.sentimentDelta.negativeChange > 0 ? '+' : ''}{stats.sentimentDelta.negativeChange}% vs prior
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="print-card">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.topThemes.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Themes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Findings */}
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {narrative.keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {finding}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Top Themes */}
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top Themes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topThemes.slice(0, 5).map((theme, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate mr-2">{theme.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary">{theme.count}</Badge>
                    {theme.growthRate !== 0 && (
                      <span className={`text-xs font-medium ${theme.growthRate > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {theme.growthRate > 0 ? '+' : ''}{theme.growthRate}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {stats.topThemes.length === 0 && (
                <p className="text-sm text-muted-foreground">No themes assigned in this period.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Analysis */}
        <Card className="print-card">
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">{narrative.sentimentAnalysis}</p>
            {/* Visual bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-muted">
              {stats.totalFeedback > 0 && (
                <>
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${posPct}%` }}
                    title={`Positive: ${posPct}%`}
                  />
                  <div
                    className="bg-yellow-400 transition-all"
                    style={{ width: `${Math.round((stats.sentimentBreakdown.neutral / stats.totalFeedback) * 100)}%` }}
                    title="Neutral"
                  />
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${negPct}%` }}
                    title={`Negative: ${negPct}%`}
                  />
                </>
              )}
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Positive ({stats.sentimentBreakdown.positive})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />Neutral ({stats.sentimentBreakdown.neutral})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Negative ({stats.sentimentBreakdown.negative})</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Issues */}
          <Card className="border-red-200 dark:border-red-900/30 print-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Top Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {narrative.topIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-red-500 font-bold flex-shrink-0">{i + 1}.</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card className="border-green-200 dark:border-green-900/30 print-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {narrative.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-green-500 font-bold flex-shrink-0">{i + 1}.</span>
                    {action}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Verbatim Quotes */}
        {stats.verbatimQuotes?.length > 0 && (
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Customer Voices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.verbatimQuotes.map((quote, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground italic leading-relaxed">
                      &ldquo;{quote.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {quote.channel.replace('_', ' ').toLowerCase()}
                      </span>
                      <SentimentBadge sentiment={quote.sentiment} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Conclusion */}
        <Card className="bg-muted/20 print-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              {narrative.conclusion}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-3">
              Generated by LOOP AI · {new Date(report.contentJson.generatedAt).toLocaleString()} · {stats.totalFeedback} feedback items analyzed
            </p>
          </CardContent>
        </Card>

        {/* Action bar — hidden in print */}
        <div className="flex gap-3 no-print">
          <Link href="/reports">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              All Reports
            </Button>
          </Link>
          <Button
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>
    </>
  );
}
