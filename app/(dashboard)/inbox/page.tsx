'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  MessageCircle,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Radio,
  Loader2,
  CheckCircle2,
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

// Sample channel feedback items for simulation
const SIMULATED_FEEDBACKS = [
  {
    content: "App store review: The checkout flow crashes when I try to select Google Pay as payment option.",
    channel: "MOBILE_APP",
    customerLabel: "AppStore User #4891",
  },
  {
    content: "Support ticket: Dashboard analytics take more than 10 seconds to load during peak morning hours.",
    channel: "EMAIL",
    customerLabel: "TechCorp Customer Support",
  },
  {
    content: "Website feedback: Loving the clean dark mode theme update! Makes nighttime reviews so much easier.",
    channel: "WEBSITE",
    customerLabel: "Jessica M. (Power User)",
  },
  {
    content: "API feedback: Webhook delivery fails silently when payload exceeds 5MB size limit.",
    channel: "API",
    customerLabel: "Dev Team Partner Integration",
  },
  {
    content: "CSAT Survey: Filter options are super responsive, but would love to export custom filtered views to PDF.",
    channel: "WEBSITE",
    customerLabel: "Enterprise Account Lead",
  },
];

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

  // Ingest Dialog State
  const [showIngestDialog, setShowIngestDialog] = useState(false);
  const [ingestMode, setIngestMode] = useState<'single' | 'csv' | 'simulate'>('single');
  const [singleContent, setSingleContent] = useState('');
  const [singleChannel, setSingleChannel] = useState('WEBSITE');
  const [singleCustomer, setSingleCustomer] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestStatusMessage, setIngestStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFeedbacks();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    setTimeout(() => {
      fetchFeedbacks();
    }, 0);
  };

  // Submit Single Feedback
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleContent.trim()) return;

    setIngestLoading(true);
    setIngestStatusMessage(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: singleContent.trim(),
          channel: singleChannel,
          customerLabel: singleCustomer.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      setIngestStatusMessage({ type: 'success', text: 'Feedback successfully submitted!' });
      setSingleContent('');
      setSingleCustomer('');
      setPage(1);
      fetchFeedbacks();

      setTimeout(() => {
        setShowIngestDialog(false);
        setIngestStatusMessage(null);
      }, 1200);
    } catch (err: any) {
      setIngestStatusMessage({ type: 'error', text: err.message || 'Error submitting feedback' });
    } finally {
      setIngestLoading(false);
    }
  };

  // Parse and Submit CSV
  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIngestLoading(true);
    setIngestStatusMessage(null);

    try {
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');

      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Check header or parse lines (Content, Channel, Customer)
      const parsedItems = lines.slice(1).map((line) => {
        const parts = line.split(',');
        const content = parts[0]?.replace(/^"|"$/g, '').trim() || line;
        const channel = (parts[1]?.replace(/^"|"$/g, '').trim().toUpperCase() as any) || 'CSV';
        const customerLabel = parts[2]?.replace(/^"|"$/g, '').trim() || 'CSV Import';

        return { content, channel: ['WEBSITE', 'MOBILE_APP', 'EMAIL', 'API', 'CSV'].includes(channel) ? channel : 'CSV', customerLabel };
      }).filter((item) => item.content.length > 0);

      if (parsedItems.length === 0) {
        throw new Error('No valid feedback items found in CSV');
      }

      const res = await fetch('/api/feedback/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedItems),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload CSV');
      }

      setIngestStatusMessage({
        type: 'success',
        text: `CSV Imported: ${data.importedCount} items uploaded successfully!`,
      });
      setCsvFile(null);
      setPage(1);
      fetchFeedbacks();

      setTimeout(() => {
        setShowIngestDialog(false);
        setIngestStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setIngestStatusMessage({ type: 'error', text: err.message || 'Error processing CSV' });
    } finally {
      setIngestLoading(false);
    }
  };

  // Simulate Channel Ingestion
  const handleSimulateSubmit = async () => {
    setIngestLoading(true);
    setIngestStatusMessage(null);

    try {
      const res = await fetch('/api/feedback/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SIMULATED_FEEDBACKS),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to simulate feedback');
      }

      setIngestStatusMessage({
        type: 'success',
        text: `Successfully ingested 5 simulated channel feedback items!`,
      });
      setPage(1);
      fetchFeedbacks();

      setTimeout(() => {
        setShowIngestDialog(false);
        setIngestStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setIngestStatusMessage({ type: 'error', text: err.message || 'Error simulating feedback' });
    } finally {
      setIngestLoading(false);
    }
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
        <Button
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => {
            setIngestStatusMessage(null);
            setShowIngestDialog(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Ingest Feedback
        </Button>
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

      {/* Ingest Feedback Dialog */}
      <Dialog open={showIngestDialog} onOpenChange={setShowIngestDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Ingest Customer Feedback</DialogTitle>
            <DialogDescription>
              Add feedback manually, import CSV bulk records, or trigger simulated channel ingestion
            </DialogDescription>
          </DialogHeader>

          {ingestStatusMessage && (
            <div
              className={`p-3 text-sm rounded flex items-center gap-2 ${
                ingestStatusMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}
            >
              {ingestStatusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {ingestStatusMessage.text}
            </div>
          )}

          <Tabs value={ingestMode} onValueChange={(val: any) => setIngestMode(val)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Single Entry</TabsTrigger>
              <TabsTrigger value="csv">CSV Bulk Upload</TabsTrigger>
              <TabsTrigger value="simulate">Simulate Channel</TabsTrigger>
            </TabsList>

            {/* Single Entry Tab */}
            <TabsContent value="single" className="space-y-4 pt-3">
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    Feedback Content *
                  </label>
                  <Textarea
                    placeholder="Enter customer feedback text..."
                    rows={4}
                    className="bg-muted/50 border-muted"
                    value={singleContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSingleContent(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Channel *
                    </label>
                    <Select value={singleChannel} onValueChange={(val) => val && setSingleChannel(val)}>
                      <SelectTrigger className="bg-muted/50 border-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WEBSITE">Website</SelectItem>
                        <SelectItem value="MOBILE_APP">Mobile App</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="API">API</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Customer Name / Label
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Alex (Enterprise)"
                      className="bg-muted/50 border-muted"
                      value={singleCustomer}
                      onChange={(e) => setSingleCustomer(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowIngestDialog(false)} disabled={ingestLoading}>
                    Cancel
                  </Button>
                  <Button className="bg-primary" type="submit" disabled={!singleContent.trim() || ingestLoading}>
                    {ingestLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Feedback
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* CSV Upload Tab */}
            <TabsContent value="csv" className="space-y-4 pt-3">
              <form onSubmit={handleCsvSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Select a .csv file to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Expected columns: Content, Channel, CustomerLabel</p>
                  </div>
                  <Input
                    type="file"
                    accept=".csv"
                    className="max-w-xs mx-auto bg-muted/50 cursor-pointer text-sm"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowIngestDialog(false)} disabled={ingestLoading}>
                    Cancel
                  </Button>
                  <Button className="bg-primary" type="submit" disabled={!csvFile || ingestLoading}>
                    {ingestLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Upload & Import CSV
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Simulate Channel Tab */}
            <TabsContent value="simulate" className="space-y-4 pt-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                  <Radio className="w-4 h-4 text-primary animate-pulse" />
                  Simulate Channel Integration Ingestion
                </div>
                <p className="text-xs text-muted-foreground">
                  Triggers an automated simulation pull from channels (Mobile App Store reviews, Support Emails, API, Website Feedback) to ingest 5 realistic customer feedback entries.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowIngestDialog(false)} disabled={ingestLoading}>
                  Cancel
                </Button>
                <Button className="bg-primary gap-2" onClick={handleSimulateSubmit} disabled={ingestLoading}>
                  {ingestLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Run Channel Simulation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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
