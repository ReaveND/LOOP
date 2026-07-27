import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageCircle,
  ThumbsUp,
  Minus,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

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
};

export function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = !change.startsWith('-');

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary/60">{ICON_MAP[icon]}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={`text-xs mt-2 flex items-center gap-1 ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}
