'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Printer,
  AlertCircle,
  Loader2,
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

// ── PDF Layout Component ────────────────────────────────────────────────────
function PdfLayout({ report }: { report: ReportData }) {
  const { stats, narrative } = report.contentJson;
  const totalFeedback = stats.totalFeedback || 1;
  const negPct = Math.round((stats.sentimentBreakdown.negative / totalFeedback) * 100);
  const posPct = Math.round((stats.sentimentBreakdown.positive / totalFeedback) * 100);
  const neuPct = Math.round((stats.sentimentBreakdown.neutral / totalFeedback) * 100);

  return (
    <table
      id="loop-pdf-root"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: 'white',
        color: '#111827',
        width: '100%',
        maxWidth: '794px', // A4 width at 96dpi
        margin: '0 auto',
        borderCollapse: 'collapse',
      }}
    >
      <thead>
        <tr><td><div style={{ height: '15mm' }} /></td></tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: 0 }}>
      {/* ── Cover Header Band ──────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        padding: '40px 48px 24px',
        color: '#111827',
      }}>
        {/* Brand + meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loop_logo.png" alt="LOOP" style={{ height: '34px', width: 'auto' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loop_text.png" alt="LOOP" style={{ height: '20px', width: 'auto' }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
            <div style={{ fontWeight: '500', color: '#374151' }}>Voice of Customer Report</div>
            <div style={{ marginTop: '2px' }}>Generated {formatDateShort(report.createdAt)}</div>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '26px', fontWeight: '800',
          letterSpacing: '-0.03em', lineHeight: 1.2,
          margin: '0 0 12px', color: '#111827',
        }}>{report.title}</h1>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' }}>
          <span>📅 {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}</span>
          <span>👤 {report.generatedBy?.name}</span>
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
          {[
            { label: 'Feedback Items', value: stats.totalFeedback },
            { label: 'Positive', value: `${posPct}%` },
            { label: 'Negative', value: `${negPct}%` },
            { label: 'Themes', value: stats.topThemes.length },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '10px 18px',
              textAlign: 'center',
              minWidth: '80px',
            }}>
              <div style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1, color: '#111827' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sentiment Bar ───────────────────────────────────────────────────── */}
      <div style={{ padding: '0 48px' }}>
        <div style={{ display: 'flex', height: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${posPct}%`, background: '#22c55e' }} />
          <div style={{ width: `${neuPct}%`, background: '#facc15' }} />
          <div style={{ width: `${negPct}%`, background: '#ef4444' }} />
          {stats.totalFeedback === 0 && <div style={{ width: '100%', background: '#e5e7eb' }} />}
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#6b7280', marginTop: '6px', padding: '0 0 0 0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
            Positive ({stats.sentimentBreakdown.positive})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#facc15', display: 'inline-block', flexShrink: 0 }} />
            Neutral ({stats.sentimentBreakdown.neutral})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', flexShrink: 0 }} />
            Negative ({stats.sentimentBreakdown.negative})
          </span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 48px 48px' }}>

        {/* Executive Summary */}
        <div style={{
          background: '#f0f4ff',
          border: '1px solid #c7d2fe',
          borderLeft: '4px solid #4338ca',
          borderRadius: '10px',
          padding: '20px 24px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '18px', height: '18px', background: '#4338ca', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: '10px' }}>★</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Executive Summary</h2>
          </div>
          <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.75, color: '#374151' }}>{narrative.executiveSummary}</p>
        </div>

        {/* Two-col: Key Findings + Top Themes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Key Findings */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', background: '#fafafa' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#4338ca', fontSize: '12px' }}>◆</span> Key Findings
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {narrative.keyFindings.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '11px', lineHeight: 1.55, color: '#374151' }}>
                  <span style={{ color: '#4338ca', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Top Themes */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', background: '#fafafa' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#4338ca', fontSize: '12px' }}>◆</span> Top Themes
            </h3>
            {stats.topThemes.length === 0 && (
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>No themes in this period.</p>
            )}
            {stats.topThemes.slice(0, 6).map((t, i) => (
              <div key={i} style={{ marginBottom: '9px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', minWidth: '14px' }}>{i + 1}</span>
                    <span style={{ fontSize: '11px', color: '#111827', fontWeight: '500' }}>{t.name}</span>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: '600',
                    background: '#e0e7ff', color: '#3730a3',
                    padding: '1px 7px', borderRadius: '9999px', flexShrink: 0, marginLeft: '8px',
                  }}>{t.count}</span>
                </div>
                <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', marginLeft: '20px' }}>
                  <div style={{
                    height: '4px',
                    background: `hsl(${240 - i * 28}, 65%, 55%)`,
                    borderRadius: '2px',
                    width: `${Math.min(100, (t.count / (stats.topThemes[0]?.count || 1)) * 100)}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', marginBottom: '20px', background: '#fafafa' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#4338ca', fontSize: '12px' }}>◆</span> Sentiment Analysis
          </h3>
          <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.75, color: '#374151' }}>{narrative.sentimentAnalysis}</p>
        </div>

        {/* Two-col: Top Issues + Recommended Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div style={{ border: '1px solid #fecaca', borderRadius: '10px', padding: '18px', background: '#fff7f7' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚠</span> Top Issues
            </h3>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {narrative.topIssues.map((issue, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '11px', lineHeight: 1.55, color: '#374151' }}>
                  <span style={{ color: '#ef4444', fontWeight: '700', flexShrink: 0, minWidth: '14px' }}>{i + 1}.</span>
                  {issue}
                </li>
              ))}
            </ol>
          </div>

          <div style={{ border: '1px solid #bbf7d0', borderRadius: '10px', padding: '18px', background: '#f0fdf4' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span> Recommended Actions
            </h3>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {narrative.recommendedActions.map((action, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', fontSize: '11px', lineHeight: 1.55, color: '#374151' }}>
                  <span style={{ color: '#22c55e', fontWeight: '700', flexShrink: 0, minWidth: '14px' }}>{i + 1}.</span>
                  {action}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Customer Voices */}
        {stats.verbatimQuotes?.length > 0 && (
          <div style={{ marginBottom: '20px', pageBreakBefore: 'auto', paddingTop: '4px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#4338ca', fontSize: '12px' }}>◆</span> Customer Voices
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {stats.verbatimQuotes.slice(0, 4).map((q, i) => {
                const sentColor = q.sentiment === 'POSITIVE' ? '#16a34a' : q.sentiment === 'NEGATIVE' ? '#dc2626' : '#ca8a04';
                const sentBg = q.sentiment === 'POSITIVE' ? '#f0fdf4' : q.sentiment === 'NEGATIVE' ? '#fef2f2' : '#fefce8';
                const sentBorder = q.sentiment === 'POSITIVE' ? '#bbf7d0' : q.sentiment === 'NEGATIVE' ? '#fecaca' : '#fef08a';
                return (
                  <div key={i} style={{
                    background: sentBg,
                    border: `1px solid ${sentBorder}`,
                    borderLeft: `3px solid ${sentColor}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                  }}>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', fontStyle: 'italic', lineHeight: 1.6, color: '#374151' }}>
                      &ldquo;{q.content}&rdquo;
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'capitalize' }}>
                        {q.channel.replace('_', ' ').toLowerCase()}
                      </span>
                      <span style={{
                        fontSize: '9px', fontWeight: '600',
                        color: sentColor,
                        border: `1px solid ${sentBorder}`,
                        padding: '1px 6px', borderRadius: '9999px', textTransform: 'capitalize',
                        background: sentBg,
                      }}>{q.sentiment.toLowerCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Conclusion */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '18px 24px',
          marginBottom: '32px',
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151' }}>Conclusion</h3>
          <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.75, color: '#374151', fontStyle: 'italic' }}>{narrative.conclusion}</p>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loop_logo.png" alt="LOOP" style={{ height: '22px', width: 'auto' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loop_text.png" alt="LOOP" style={{ height: '14px', width: 'auto' }} />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>Voice of Customer Platform</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#9ca3af' }}>
            <div>Generated by LOOP AI · {new Date(report.contentJson.generatedAt).toLocaleString()}</div>
            <div>{stats.totalFeedback} feedback items analyzed · Confidential</div>
          </div>
        </div>
      </div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr><td><div style={{ height: '15mm' }} /></td></tr>
      </tfoot>
    </table>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ReportDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const shouldPrint = searchParams?.get('print') === '1';

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);
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

  // Enter print mode automatically if ?print=1
  useEffect(() => {
    if (shouldPrint && report) {
      setPrintMode(true);
    }
  }, [shouldPrint, report]);

  // Auto-trigger window.print() when printMode activates
  useEffect(() => {
    if (!printMode || !report) return;
    if (hasPrinted.current) return;
    hasPrinted.current = true;
    // Give the overlay a moment to fully render
    const timer = setTimeout(() => {
      window.print();
      // Exit print mode after the print dialog closes (if in normal page view)
      const onAfterPrint = () => {
        if (!shouldPrint) {
          setPrintMode(false);
          hasPrinted.current = false;
        }
      };
      window.addEventListener('afterprint', onAfterPrint, { once: true });
    }, 600);
    return () => clearTimeout(timer);
  }, [printMode, report, shouldPrint]);

  const handlePrint = () => {
    hasPrinted.current = false;
    setPrintMode(true);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
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
  const totalFeedback = stats.totalFeedback || 1;
  const negPct = Math.round((stats.sentimentBreakdown.negative / totalFeedback) * 100);
  const posPct = Math.round((stats.sentimentBreakdown.positive / totalFeedback) * 100);
  const neuPct = Math.round((stats.sentimentBreakdown.neutral / totalFeedback) * 100);

  return (
    <>
      {/*
        ── Print Mode Overlay ────────────────────────────────────────────────
        When active, a fixed full-viewport white div covers the entire dashboard
        layout (sidebar, topnav, etc.), so only the PDF content is visible and
        prints cleanly. `visibility` trick ensures only #loop-pdf-root prints.
      */}
      {printMode && typeof document !== 'undefined' && createPortal(
        <>
          <style>{`
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body > *:not(#loop-pdf-overlay) { display: none !important; }
              #loop-pdf-overlay {
                position: relative !important;
                inset: auto !important;
                width: 100% !important;
                height: auto !important;
                display: block !important;
                background: white !important;
                overflow: visible !important;
              }
              #loop-pdf-root {
                width: 210mm !important;
                margin: 0 auto !important;
              }
            }
          `}</style>
          {/* Full-screen white cover that hides the dashboard chrome */}
          <div
            id="loop-pdf-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'white',
              overflowY: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <PdfLayout report={report} />
          </div>
        </>,
        document.body
      )}

      {/* ── Normal Screen View ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header row */}
        <div className="flex items-center justify-between">
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
            onClick={handlePrint}
            id="print-report-btn"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>

        {/* Report Header */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Voice of Customer Report</p>
          <h1 className="text-3xl font-bold text-foreground">{report.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(report.periodStart)} – {formatDate(report.periodEnd)}</span>
            <span>Generated by {report.generatedBy?.name} on {formatDateShort(report.createdAt)}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
          <h2 className="font-semibold text-foreground mb-2">Executive Summary</h2>
          <p className="text-foreground leading-relaxed">{narrative.executiveSummary}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Feedback', value: stats.totalFeedback, color: 'text-foreground' },
            { label: 'Positive', value: `${posPct}%`, color: 'text-green-600 dark:text-green-400' },
            { label: 'Negative', value: `${negPct}%`, color: 'text-red-600 dark:text-red-400' },
            { label: 'Themes', value: stats.topThemes.length, color: 'text-foreground' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-border bg-card/50 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sentiment Bar */}
        <div className="space-y-2">
          <div className="h-3 rounded-full overflow-hidden flex bg-muted">
            <div className="bg-green-500 transition-all" style={{ width: `${posPct}%` }} />
            <div className="bg-yellow-400 transition-all" style={{ width: `${neuPct}%` }} />
            <div className="bg-red-500 transition-all" style={{ width: `${negPct}%` }} />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Positive ({stats.sentimentBreakdown.positive})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Neutral ({stats.sentimentBreakdown.neutral})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Negative ({stats.sentimentBreakdown.negative})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-border bg-card/50">
            <h2 className="font-semibold text-foreground mb-3">Key Findings</h2>
            <ul className="space-y-2">
              {narrative.keyFindings.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary font-bold flex-shrink-0 mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-border bg-card/50">
            <h2 className="font-semibold text-foreground mb-3">Top Themes</h2>
            <div className="space-y-2">
              {stats.topThemes.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground truncate mr-2">{t.name}</span>
                  <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full flex-shrink-0">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card/50">
          <h2 className="font-semibold text-foreground mb-3">Sentiment Analysis</h2>
          <p className="text-sm text-foreground leading-relaxed">{narrative.sentimentAnalysis}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-red-200 dark:border-red-900/30 bg-card/50">
            <h2 className="font-semibold text-foreground mb-3">⚠ Top Issues</h2>
            <ul className="space-y-2">
              {narrative.topIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-red-500 font-bold flex-shrink-0">{i + 1}.</span>{issue}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-green-200 dark:border-green-900/30 bg-card/50">
            <h2 className="font-semibold text-foreground mb-3">✓ Recommended Actions</h2>
            <ul className="space-y-2">
              {narrative.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-green-500 font-bold flex-shrink-0">{i + 1}.</span>{action}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {stats.verbatimQuotes?.length > 0 && (
          <div className="p-5 rounded-xl border border-border bg-card/50">
            <h2 className="font-semibold text-foreground mb-3">Customer Voices</h2>
            <div className="space-y-3">
              {stats.verbatimQuotes.map((q, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm italic text-foreground">&ldquo;{q.content}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{q.channel.replace('_', ' ').toLowerCase()} · {q.sentiment.toLowerCase()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 rounded-xl border border-border bg-muted/20">
          <p className="text-sm text-muted-foreground italic">{narrative.conclusion}</p>
          <p className="text-xs text-muted-foreground/60 mt-2">Generated by LOOP AI · {new Date(report.contentJson.generatedAt).toLocaleString()}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/reports">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />All Reports
            </Button>
          </Link>
          <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />Print / Save PDF
          </Button>
        </div>
      </div>
    </>
  );
}
