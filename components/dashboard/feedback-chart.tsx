'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalCount: number;
  sentimentCounts: { POSITIVE: number; NEUTRAL: number; NEGATIVE: number };
  percentNegative: number;
  newThisWeek: number;
  channelData: { name: string; value: number }[];
  volumeData: { date: string; label: string; count: number }[];
  topThemes: { id: string; name: string; color: string | null; count: number }[];
}

// ─── Shared hook ──────────────────────────────────────────────────────────────

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load analytics');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function ChartLoader() {
  return (
    <div className="flex items-center justify-center h-[200px] text-muted-foreground gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading…</span>
    </div>
  );
}

function ChartError({ msg }: { msg: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-destructive text-sm">
      {msg}
    </div>
  );
}

// ─── Volume chart — last 30 days, sampled to last 14 for legibility ───────────

export function FeedbackVolumeChart() {
  const { data, loading, error } = useAnalytics();

  // Show every other day label to avoid clutter on the 30-day range
  const chartData = data
    ? data.volumeData.slice(-14).map((d) => ({ ...d, value: d.count }))
    : [];

  return (
    <Card className="col-span-full lg:col-span-2 border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Feedback Volume Over Time</CardTitle>
        <CardDescription>Last 14 days of submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartLoader />
        ) : error ? (
          <ChartError msg={error} />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No feedback yet — ingest some items to see the chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis
                dataKey="label"
                stroke="currentColor"
                tick={{ fontSize: 11 }}
                interval={1}
              />
              <YAxis stroke="currentColor" allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val) => [val, 'Items']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                name="Feedback"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Sentiment Pie ─────────────────────────────────────────────────────────────

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: '#22c55e',
  NEUTRAL: '#eab308',
  NEGATIVE: '#ef4444',
};

export function SentimentDistribution() {
  const { data, loading, error } = useAnalytics();

  const chartData = data
    ? ([
        { name: 'Positive', value: data.sentimentCounts.POSITIVE, fill: SENTIMENT_COLORS.POSITIVE },
        { name: 'Neutral', value: data.sentimentCounts.NEUTRAL, fill: SENTIMENT_COLORS.NEUTRAL },
        { name: 'Negative', value: data.sentimentCounts.NEGATIVE, fill: SENTIMENT_COLORS.NEGATIVE },
      ].filter((d) => d.value > 0))
    : [];

  const totalClassified =
    data
      ? data.sentimentCounts.POSITIVE +
        data.sentimentCounts.NEUTRAL +
        data.sentimentCounts.NEGATIVE
      : 0;

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Sentiment Distribution</CardTitle>
        <CardDescription>
          {data ? `${totalClassified} classified items` : 'Current breakdown'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartLoader />
        ) : error ? (
          <ChartError msg={error} />
        ) : totalClassified === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No classified feedback yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val) => [val, 'Items']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span style={{ fontSize: 11 }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Channel Bar Chart ─────────────────────────────────────────────────────────

const CHANNEL_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#f97316',
];

export function ChannelDistribution() {
  const { data, loading, error } = useAnalytics();

  const chartData = data
    ? data.channelData.map((d, i) => ({
        name: d.name.replace('_', ' '),
        value: d.value,
        fill: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
      }))
    : [];

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Channel Distribution</CardTitle>
        <CardDescription>Feedback sources breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartLoader />
        ) : error ? (
          <ChartError msg={error} />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No channel data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" horizontal={false} />
              <XAxis type="number" stroke="currentColor" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="currentColor" tick={{ fontSize: 11 }} width={72} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val) => [val, 'Items']}
              />
              <Bar dataKey="value" name="Feedback" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Top Themes export (used by dashboard page) ────────────────────────────────

export function useTopThemes() {
  const { data, loading } = useAnalytics();
  return { themes: data?.topThemes ?? [], loading };
}
