'use client';

import { useState } from 'react';
import { RECENT_FEEDBACK } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  MoreHorizontal,
  MessageCircle,
  X,
  Clock,
} from 'lucide-react';

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

export default function InboxPage() {
  const [selectedFeedback, setSelectedFeedback] = useState<typeof RECENT_FEEDBACK[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredFeedback = RECENT_FEEDBACK.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = !sentimentFilter || item.sentiment === sentimentFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesSentiment && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Feedback Inbox</h1>
        <p className="text-muted-foreground mt-1">Manage and review customer feedback</p>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback, customers..."
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Sentiment
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSentimentFilter(null)}>
                  All Sentiments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSentimentFilter('Positive')}>
                  Positive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSentimentFilter('Neutral')}>
                  Neutral
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSentimentFilter('Negative')}>
                  Negative
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Status
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Open')}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('In Progress')}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Reviewed')}>
                  Reviewed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters */}
          {(sentimentFilter || statusFilter) && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {sentimentFilter && (
                <Badge variant="secondary" className="gap-2">
                  {sentimentFilter}
                  <button onClick={() => setSentimentFilter(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="gap-2">
                  {statusFilter}
                  <button onClick={() => setStatusFilter(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedback.map((feedback) => (
          <Card
            key={feedback.id}
            className="border-border bg-card/50 backdrop-blur-sm p-4 hover:bg-card/70 transition-colors cursor-pointer"
            onClick={() => setSelectedFeedback(feedback)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground mb-2">{feedback.content}</p>
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-muted-foreground">{feedback.customer}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{feedback.channel}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {feedback.date}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center flex-shrink-0">
                <Badge className={getSentimentColor(feedback.sentiment)} variant="secondary">
                  {feedback.sentiment}
                </Badge>
                <Badge className={getStatusColor(feedback.status)} variant="secondary">
                  {feedback.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                    <DropdownMenuItem>Edit Themes</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Feedback Detail
            </DialogTitle>
            <DialogDescription>
              {selectedFeedback?.customer} • {selectedFeedback?.date}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Feedback Content</label>
                  <p className="mt-2 p-3 bg-muted/50 rounded-lg text-foreground">
                    {selectedFeedback.content}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                    <p className="mt-1 text-foreground">{selectedFeedback.customer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel</label>
                    <p className="mt-1 text-foreground">{selectedFeedback.channel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sentiment</label>
                    <div className="mt-1">
                      <Badge className={getSentimentColor(selectedFeedback.sentiment)}>
                        {selectedFeedback.sentiment}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedFeedback.status)}>
                        {selectedFeedback.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Themes</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {selectedFeedback.themes.map((theme) => (
                      <Badge
                        key={theme}
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="actions" className="space-y-3">
                <Button className="w-full bg-primary">Mark as Reviewed</Button>
                <Button variant="outline" className="w-full">
                  Add to Report
                </Button>
                <Button variant="outline" className="w-full">
                  Share with Team
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
