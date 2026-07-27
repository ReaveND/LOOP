import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Share2,
  Eye,
  Plus,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = {
  title: 'Voice of Customer Reports | LOOP',
  description: 'View and manage customer feedback reports',
};

const REPORTS = [
  {
    id: 1,
    title: 'Weekly Report',
    period: 'July 21-27, 2024',
    status: 'Ready',
    generatedAt: '2 hours ago',
    insights: '847 feedback items analyzed',
    color: 'bg-blue-500/10',
  },
  {
    id: 2,
    title: 'Monthly Report',
    period: 'July 2024',
    status: 'Ready',
    generatedAt: '1 day ago',
    insights: '2,847 feedback items analyzed',
    color: 'bg-green-500/10',
  },
  {
    id: 3,
    title: 'Quarterly Report',
    period: 'Q3 2024',
    status: 'Generating',
    generatedAt: 'In progress...',
    insights: 'Compiling insights...',
    color: 'bg-orange-500/10',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Voice of Customer Reports</h1>
          <p className="text-muted-foreground mt-1">Professional reports on customer feedback and insights</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-6 mt-6">
          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REPORTS.map((report) => (
              <Card
                key={report.id}
                className={`border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors ${report.color}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{report.title}</CardTitle>
                    <Badge
                      variant="secondary"
                      className={
                        report.status === 'Ready'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {report.period}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {report.insights}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Generated {report.generatedAt}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report Preview */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Weekly Report Preview</CardTitle>
              <CardDescription>July 21-27, 2024</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Total Feedback</p>
                  <p className="text-2xl font-bold text-foreground mt-2">847</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12.5%</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Avg Sentiment</p>
                  <p className="text-2xl font-bold text-foreground mt-2">4.2/5</p>
                  <p className="text-xs text-muted-foreground mt-1">Positive trend</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Top Theme</p>
                  <p className="text-xl font-bold text-foreground mt-2">Performance</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">↑ 12.5%</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium">Themes</p>
                  <p className="text-2xl font-bold text-foreground mt-2">5</p>
                  <p className="text-xs text-muted-foreground mt-1">Emerging</p>
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Key Findings
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Performance optimization remains the top customer concern</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>UI/UX improvements requested by 35% of feedback</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Feature requests trending upward in emerging integrations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Positive sentiment increased by 8% week-over-week</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button className="flex-1 bg-primary">Download PDF</Button>
                <Button variant="outline" className="flex-1">
                  Share with Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Create Custom Report</CardTitle>
              <CardDescription>Build a tailored report for your specific needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Custom report builder coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
