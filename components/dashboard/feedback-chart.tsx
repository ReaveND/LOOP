'use client';

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
} from 'recharts';

const FEEDBACK_DATA = [
  { date: 'Mon', feedback: 240 },
  { date: 'Tue', feedback: 321 },
  { date: 'Wed', feedback: 200 },
  { date: 'Thu', feedback: 279 },
  { date: 'Fri', feedback: 200 },
  { date: 'Sat', feedback: 229 },
  { date: 'Sun', feedback: 200 },
];

const SENTIMENT_DATA = [
  { name: 'Positive', value: 1240, fill: '#22c55e' },
  { name: 'Neutral', value: 987, fill: '#eab308' },
  { name: 'Negative', value: 620, fill: '#ef4444' },
];

const CHANNEL_DATA = [
  { name: 'Email', value: 856, fill: '#6366f1' },
  { name: 'Chat', value: 642, fill: '#8b5cf6' },
  { name: 'Survey', value: 534, fill: '#d946ef' },
  { name: 'In-app', value: 815, fill: '#ec4899' },
];

export function FeedbackVolumeChart() {
  return (
    <Card className="col-span-full lg:col-span-2 border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Feedback Volume Over Time</CardTitle>
        <CardDescription>Last 7 days feedback submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={FEEDBACK_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="date" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="feedback"
              stroke="rgb(var(--color-primary) / 1)"
              strokeWidth={2}
              dot={{ fill: 'rgb(var(--color-primary) / 1)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SentimentDistribution() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Sentiment Distribution</CardTitle>
        <CardDescription>Current breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={SENTIMENT_DATA}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {SENTIMENT_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChannelDistribution() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Channel Distribution</CardTitle>
        <CardDescription>Feedback sources</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={CHANNEL_DATA}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {CHANNEL_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
