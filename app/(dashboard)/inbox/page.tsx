'use client';

import { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function getSentimentColor(sentiment: string | null) {
  if (!sentiment) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  switch (sentiment.toUpperCase()) {
    case 'POSITIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'NEGATIVE':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'ANALYZED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'PROCESSING':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'FAILED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: // NEW
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
}

export default function InboxPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchQuery) params.append('search', searchQuery);
      if (sentimentFilter) params.append('sentiment', sentimentFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page, sentimentFilter, statusFilter]);

  // Debounced/triggered search search execution
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFeedbacks();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    // Fetch immediately after clearing
    setTimeout(() => {
      fetchFeedbacks();
    }, 0);
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feedback Inbox</h1>
          <p className="text-muted-foreground mt-1">Manage and review customer feedback ({totalItems} total)</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback content..."
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary">Search</Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {sentimentFilter ? `Sentiment: ${sentimentFilter}` : 'Sentiment'}
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSentimentFilter(null); setPage(1); }}>
                  All Sentiments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSentimentFilter('POSITIVE'); setPage(1); }}>
                  Positive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSentimentFilter('NEUTRAL'); setPage(1); }}>
                  Neutral
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSentimentFilter('NEGATIVE'); setPage(1); }}>
                  Negative
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {statusFilter ? `Status: ${statusFilter}` : 'Status'}
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setStatusFilter(null); setPage(1); }}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('NEW'); setPage(1); }}>
                  New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('PROCESSING'); setPage(1); }}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('ANALYZED'); setPage(1); }}>
                  Analyzed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('FAILED'); setPage(1); }}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </form>

          {/* Active Filters */}
          {(sentimentFilter || statusFilter) && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {sentimentFilter && (
                <Badge variant="secondary" className="gap-2">
                  Sentiment: {sentimentFilter}
                  <button onClick={() => { setSentimentFilter(null); setPage(1); }}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="gap-2">
                  Status: {statusFilter}
                  <button onClick={() => { setStatusFilter(null); setPage(1); }}>
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
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No feedback found. Try adjusting filters or search.</div>
        ) : (
          feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              className="border-border bg-card/50 backdrop-blur-sm p-4 hover:bg-card/70 transition-colors cursor-pointer"
              onClick={() => setSelectedFeedback(feedback)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground mb-2">{feedback.content}</p>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="text-muted-foreground">{feedback.customerLabel || 'Anonymous'}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{feedback.channel}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  {feedback.sentiment && (
                    <Badge className={getSentimentColor(feedback.sentiment)} variant="secondary">
                      {feedback.sentiment}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(feedback.status)} variant="secondary">
                    {feedback.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Feedback Detail
            </DialogTitle>
            <DialogDescription>
              From {selectedFeedback?.customerLabel || 'Anonymous'} on {selectedFeedback ? formatDate(selectedFeedback.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="details">Details</TabsTrigger>
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
                    <p className="mt-1 text-foreground">{selectedFeedback.customerLabel || 'Anonymous'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel</label>
                    <p className="mt-1 text-foreground">{selectedFeedback.channel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sentiment</label>
                    <div className="mt-1">
                      <Badge className={getSentimentColor(selectedFeedback.sentiment)}>
                        {selectedFeedback.sentiment || 'None'}
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
                {selectedFeedback.themes && selectedFeedback.themes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Themes</label>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {selectedFeedback.themes.map((theme: string) => (
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
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
