import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { RECENT_FEEDBACK } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case 'Positive':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Negative':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Reviewed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'In Progress':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

export function RecentFeedback() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm col-span-full">
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>
        <CardDescription>Latest customer feedback submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feedback</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Channel</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sentiment</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Themes</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {RECENT_FEEDBACK.map((feedback) => (
                <tr
                  key={feedback.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4 max-w-xs truncate text-foreground">
                    {feedback.content}
                  </td>
                  <td className="py-4 px-4 text-foreground">{feedback.customer}</td>
                  <td className="py-4 px-4 text-muted-foreground">{feedback.channel}</td>
                  <td className="py-4 px-4">
                    <Badge className={getSentimentColor(feedback.sentiment)} variant="secondary">
                      {feedback.sentiment}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {feedback.themes.map((theme) => (
                        <Badge
                          key={theme}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(feedback.status)} variant="secondary">
                      {feedback.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-xs">{feedback.date}</td>
                  <td className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Themes</DropdownMenuItem>
                        <DropdownMenuItem>Change Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
