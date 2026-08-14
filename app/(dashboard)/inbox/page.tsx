'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
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
  ChevronDown,
  CalendarDays,
  Tag,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSentimentColor(sentiment: string | null) {
  if (!sentiment) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  switch (sentiment.toUpperCase()) {
    case 'POSITIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'NEGATIVE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIONED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'REVIEWED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
}

const STATUS_TRANSITIONS: Record<string, string> = {
  NEW: 'REVIEWED',
  REVIEWED: 'ACTIONED',
  ACTIONED: 'NEW',
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Mark Reviewed',
  REVIEWED: 'Mark Actioned',
  ACTIONED: 'Reset to New',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Theme {
  id: string;
  name: string;
  color?: string | null;
}

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  customerLabel: string | null;
  sentiment: string | null;
  sentimentScore: number | null;
  status: string;
  themes: string[];
  createdAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function InboxContent() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string | undefined;
  const canEdit = userRole === 'ADMIN' || userRole === 'ANALYST';
  const canDelete = userRole === 'ADMIN';

  // List state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);

  // ── Read sessionStorage filter set by Trends page ──────────────────────────
  const getInitialThemeFilter = () => {
    try {
      const raw = sessionStorage.getItem('inbox_themeFilter');
      if (raw) {
        sessionStorage.removeItem('inbox_themeFilter');
        return JSON.parse(raw) as { id: string; name: string };
      }
    } catch {}
    return null;
  };
  const initialTheme = getInitialThemeFilter();

  // Filter state
  const [showFilters, setShowFilters] = useState(!!initialTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [themeFilter, setThemeFilter] = useState<string | null>(initialTheme?.id ?? null);
  const [themeFilterName, setThemeFilterName] = useState<string | null>(initialTheme?.name ?? null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);

  // Ingest dialog
  const [showIngestDialog, setShowIngestDialog] = useState(false);
  const [ingestMode, setIngestMode] = useState<'single' | 'csv' | 'simulate'>('single');
  const [singleContent, setSingleContent] = useState('');
  const [singleChannel, setSingleChannel] = useState('WEBSITE');
  const [singleCustomer, setSingleCustomer] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestStatusMessage, setIngestStatusMessage] = useState<{
    type: 'success' | 'error'; text: string;
  } | null>(null);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<FeedbackItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editChannel, setEditChannel] = useState('WEBSITE');
  const [editCustomer, setEditCustomer] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Per-row status update loading
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // ── Fetch themes ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/themes').then((r) => r.json()).then((res) => {
      const data = res.data || res;
      setThemes(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);


  // ── Fetch feedbacks ────────────────────────────────────────────────────────
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (searchQuery) params.append('search', searchQuery);
      if (sentimentFilter) params.append('sentiment', sentimentFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (channelFilter) params.append('channel', channelFilter);
      if (themeFilter) params.append('themeId', themeFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
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
  }, [page, searchQuery, sentimentFilter, statusFilter, channelFilter, themeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchFeedbacks(); };
  const handleClearSearch = () => { setSearchQuery(''); setPage(1); };
  const clearAllFilters = () => {
    setSentimentFilter(null); setStatusFilter(null); setChannelFilter(null);
    setThemeFilter(null); setThemeFilterName(null); setDateFrom(''); setDateTo(''); setPage(1);
  };
  const hasActiveFilters = sentimentFilter || statusFilter || channelFilter || themeFilter || dateFrom || dateTo;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateString; }
  };

  // ── Status advance ─────────────────────────────────────────────────────────
  const handleStatusAdvance = async (e: React.MouseEvent, feedback: FeedbackItem) => {
    e.stopPropagation();
    const nextStatus = STATUS_TRANSITIONS[feedback.status];
    if (!nextStatus) return;
    setUpdatingIds((prev) => new Set(prev).add(feedback.id));
    try {
      const res = await fetch(`/api/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        const patch = (f: FeedbackItem) =>
          f.id === feedback.id ? { ...f, status: nextStatus } : f;
        setFeedbacks((prev) => prev.map(patch));
        setSelectedFeedback((prev) => (prev?.id === feedback.id ? { ...prev, status: nextStatus } : prev));
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingIds((prev) => { const s = new Set(prev); s.delete(feedback.id); return s; });
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (e: React.MouseEvent, feedback: FeedbackItem) => {
    e.stopPropagation();
    setEditTarget(feedback);
    setEditContent(feedback.content);
    setEditChannel(feedback.channel);
    setEditCustomer(feedback.customerLabel ?? '');
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editContent.trim()) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/feedback/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent.trim(),
          channel: editChannel,
          customerLabel: editCustomer.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update feedback');

      // Apply update locally
      const updated: FeedbackItem = {
        ...editTarget,
        content: data.content,
        channel: data.channel,
        customerLabel: data.customerLabel ?? null,
        themes: data.themes ?? editTarget.themes,
      };
      setFeedbacks((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      if (selectedFeedback?.id === updated.id) setSelectedFeedback(updated);
      setEditTarget(null);
    } catch (err: any) {
      setEditError(err.message || 'Error updating feedback');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDelete = (e: React.MouseEvent, feedback: FeedbackItem) => {
    e.stopPropagation();
    setDeleteTarget(feedback);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/feedback/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete');
      }
      setFeedbacks((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      setTotalItems((n) => n - 1);
      if (selectedFeedback?.id === deleteTarget.id) setSelectedFeedback(null);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Ingest handlers ────────────────────────────────────────────────────────
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleContent.trim()) return;
    setIngestLoading(true); setIngestStatusMessage(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: singleContent.trim(), channel: singleChannel, customerLabel: singleCustomer.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');
      setIngestStatusMessage({ type: 'success', text: 'Feedback successfully submitted!' });
      setSingleContent(''); setSingleCustomer(''); setPage(1); fetchFeedbacks();
      setTimeout(() => { setShowIngestDialog(false); setIngestStatusMessage(null); }, 1200);
    } catch (err: any) {
      setIngestStatusMessage({ type: 'error', text: err.message || 'Error submitting feedback' });
    } finally { setIngestLoading(false); }
  };

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setIngestLoading(true); setIngestStatusMessage(null);
    try {
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lines.length === 0) throw new Error('CSV file is empty');
      const parsedItems = lines.slice(1).map((line) => {
        const parts = line.split(',');
        const content = parts[0]?.replace(/^"|"$/g, '').trim() || line;
        const channel = (parts[1]?.replace(/^"|"$/g, '').trim().toUpperCase() as any) || 'CSV';
        const customerLabel = parts[2]?.replace(/^"|"$/g, '').trim() || 'CSV Import';
        return { content, channel: ['WEBSITE', 'MOBILE_APP', 'EMAIL', 'API', 'CSV'].includes(channel) ? channel : 'CSV', customerLabel };
      }).filter((item) => item.content.length > 0);
      if (parsedItems.length === 0) throw new Error('No valid feedback items found in CSV');
      const res = await fetch('/api/feedback/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsedItems),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload CSV');
      setIngestStatusMessage({ type: 'success', text: `✓ ${data.importedCount} rows imported${data.failedCount > 0 ? `, ${data.failedCount} failed` : ''}.` });
      setCsvFile(null); setPage(1); fetchFeedbacks();
      setTimeout(() => { setShowIngestDialog(false); setIngestStatusMessage(null); }, 1500);
    } catch (err: any) {
      setIngestStatusMessage({ type: 'error', text: err.message || 'Error processing CSV' });
    } finally { setIngestLoading(false); }
  };

  const handleSimulateSubmit = async () => {
    setIngestLoading(true); setIngestStatusMessage(null);
    try {
      const res = await fetch('/api/feedback/simulate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to simulate feedback');
      setIngestStatusMessage({ type: 'success', text: `✓ ${data.importedCount} simulated channel items ingested!` });
      setPage(1); fetchFeedbacks();
      setTimeout(() => { setShowIngestDialog(false); setIngestStatusMessage(null); }, 1500);
    } catch (err: any) {
      setIngestStatusMessage({ type: 'error', text: err.message || 'Error simulating feedback' });
    } finally { setIngestLoading(false); }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feedback Inbox</h1>
          <p className="text-muted-foreground mt-1">Manage and review customer feedback ({totalItems} total)</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => { setIngestStatusMessage(null); setShowIngestDialog(true); }}>
          <Plus className="w-4 h-4" /> Ingest Feedback
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search feedback content..." className="pl-10 bg-muted/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary">Search</Button>
            <Button
              type="button"
              variant={showFilters || hasActiveFilters ? 'secondary' : 'outline'}
              onClick={() => setShowFilters((prev) => !prev)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <Badge variant="default" className="ml-0.5 px-1.5 py-0 text-[10px] leading-tight bg-primary text-primary-foreground">
                  Active
                </Badge>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </form>

          {showFilters && (
            <div className="pt-2 space-y-4 border-t border-border/50">
              <div className="flex gap-2 flex-wrap items-center">
                {/* Sentiment */}
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 h-9 text-sm"><Filter className="w-3.5 h-3.5" />{sentimentFilter ? `Sentiment: ${sentimentFilter}` : 'Sentiment'}<ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60" /></Button>} />
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => { setSentimentFilter(null); setPage(1); }}>All Sentiments</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSentimentFilter('POSITIVE'); setPage(1); }}>Positive</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSentimentFilter('NEUTRAL'); setPage(1); }}>Neutral</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSentimentFilter('NEGATIVE'); setPage(1); }}>Negative</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Status */}
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 h-9 text-sm"><Filter className="w-3.5 h-3.5" />{statusFilter ? `Status: ${statusFilter}` : 'Status'}<ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60" /></Button>} />
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => { setStatusFilter(null); setPage(1); }}>All Statuses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('NEW'); setPage(1); }}>New</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('REVIEWED'); setPage(1); }}>Reviewed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setStatusFilter('ACTIONED'); setPage(1); }}>Actioned</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Channel */}
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 h-9 text-sm"><Filter className="w-3.5 h-3.5" />{channelFilter ? `Channel: ${channelFilter}` : 'Channel'}<ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60" /></Button>} />
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => { setChannelFilter(null); setPage(1); }}>All Channels</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setChannelFilter('WEBSITE'); setPage(1); }}>Website</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setChannelFilter('MOBILE_APP'); setPage(1); }}>Mobile App</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setChannelFilter('EMAIL'); setPage(1); }}>Email</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setChannelFilter('API'); setPage(1); }}>API</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setChannelFilter('CSV'); setPage(1); }}>CSV</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme */}
                {themes.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 h-9 text-sm"><Tag className="w-3.5 h-3.5" />{themeFilterName ? `Theme: ${themeFilterName}` : 'Theme'}<ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60" /></Button>} />
                    <DropdownMenuContent align="start" className="max-h-52 overflow-y-auto">
                      <DropdownMenuItem onClick={() => { setThemeFilter(null); setThemeFilterName(null); setPage(1); }}>All Themes</DropdownMenuItem>
                      {themes.map((t) => (
                        <DropdownMenuItem key={t.id} onClick={() => { setThemeFilter(t.id); setThemeFilterName(t.name); setPage(1); }}>{t.name}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Date range */}
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-9 text-sm bg-muted/50 w-[140px]" title="From date" />
                  <span className="text-muted-foreground text-sm">–</span>
                  <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-9 text-sm bg-muted/50 w-[140px]" title="To date" />
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 text-muted-foreground hover:text-foreground gap-1">
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </Button>
                )}
              </div>

              {/* Active badges */}
              {hasActiveFilters && (
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs text-muted-foreground">Active:</span>
                  {sentimentFilter && <Badge variant="secondary" className="gap-1 text-xs">Sentiment: {sentimentFilter}<button onClick={() => { setSentimentFilter(null); setPage(1); }}><X className="w-3 h-3" /></button></Badge>}
                  {statusFilter && <Badge variant="secondary" className="gap-1 text-xs">Status: {statusFilter}<button onClick={() => { setStatusFilter(null); setPage(1); }}><X className="w-3 h-3" /></button></Badge>}
                  {channelFilter && <Badge variant="secondary" className="gap-1 text-xs">Channel: {channelFilter}<button onClick={() => { setChannelFilter(null); setPage(1); }}><X className="w-3 h-3" /></button></Badge>}
                  {themeFilter && themeFilterName && <Badge variant="secondary" className="gap-1 text-xs">Theme: {themeFilterName}<button onClick={() => { setThemeFilter(null); setThemeFilterName(null); setPage(1); }}><X className="w-3 h-3" /></button></Badge>}
                  {dateFrom && <Badge variant="secondary" className="gap-1 text-xs">From: {dateFrom}<button onClick={() => { setDateFrom(''); setPage(1); }}><X className="w-3 h-3" /></button></Badge>}
                  {dateTo && <Badge variant="secondary" className="gap-1 text-xs">To: {dateTo}<button onClick={() => { setDateTo(''); setPage(1); }}><X className="w-3 h-3" /></button></Badge>}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading feedback...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No feedback found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              className="border-border bg-card/50 backdrop-blur-sm p-4 hover:bg-card/70 transition-colors cursor-pointer"
              onClick={() => setSelectedFeedback(feedback)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground mb-2 line-clamp-2">{feedback.content}</p>
                  <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="text-muted-foreground">{feedback.customerLabel || 'Anonymous'}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{feedback.channel}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(feedback.createdAt)}
                    </span>
                    {feedback.themes.length > 0 && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        {feedback.themes.slice(0, 2).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{t}</Badge>
                        ))}
                        {feedback.themes.length > 2 && <span className="text-xs text-muted-foreground">+{feedback.themes.length - 2}</span>}
                      </>
                    )}
                  </div>
                </div>

                {/* Right: badges + actions */}
                <div className="flex gap-2 items-center flex-shrink-0">
                  {feedback.sentiment && (
                    <Badge className={getSentimentColor(feedback.sentiment)} variant="secondary">{feedback.sentiment}</Badge>
                  )}
                  <Badge className={getStatusColor(feedback.status)} variant="secondary">{feedback.status}</Badge>

                  {/* Status advance */}
                  {canEdit && (
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2 whitespace-nowrap"
                      disabled={updatingIds.has(feedback.id)} onClick={(e) => handleStatusAdvance(e, feedback)}>
                      {updatingIds.has(feedback.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : STATUS_LABELS[feedback.status] ?? 'Update'}
                    </Button>
                  )}

                  {/* Edit */}
                  {canEdit && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Edit feedback" onClick={(e) => openEdit(e, feedback)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  {/* Delete */}
                  {canDelete && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete feedback" onClick={(e) => openDelete(e, feedback)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-xl p-6 sm:p-7 border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl">
          <DialogHeader className="space-y-1.5 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-sm">
                <Pencil className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">Edit Feedback</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update the content, channel, or customer label for this feedback item.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editError && (
            <div className="p-3 text-xs rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-medium">
              {editError}
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-5 pt-1">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-primary" /> Feedback Content <span className="text-red-400">*</span>
              </label>
              <Textarea
                rows={5}
                className="bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/80 focus:border-primary/80 rounded-xl p-3.5 text-sm text-foreground transition-all duration-150 resize-none shadow-sm focus:ring-2 focus:ring-primary/20"
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-primary" /> Channel <span className="text-red-400">*</span>
                </label>
                <Select value={editChannel} onValueChange={(v) => v && setEditChannel(v)}>
                  <SelectTrigger className="bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/80 rounded-xl h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border/80">
                    <SelectItem value="WEBSITE">Website</SelectItem>
                    <SelectItem value="MOBILE_APP">Mobile App</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" /> Customer / Label
                </label>
                <Input
                  className="bg-muted/30 hover:bg-muted/50 focus:bg-background border-border/80 focus:border-primary/80 rounded-xl h-10 text-sm"
                  placeholder="e.g. Alex (Enterprise)"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditTarget(null)}
                disabled={editLoading}
                className="rounded-xl px-5 h-10 text-muted-foreground hover:text-foreground font-medium"
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20 transition-all gap-2"
                type="submit"
                disabled={!editContent.trim() || editLoading}
              >
                {editLoading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />} Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete Feedback
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. The feedback item and all its associated themes and embeddings will be removed.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm text-foreground line-clamp-3">
              {deleteTarget.content}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Ingest Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={showIngestDialog} onOpenChange={setShowIngestDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Ingest Customer Feedback</DialogTitle>
            <DialogDescription>Add feedback manually, import a CSV, or trigger simulated channel ingestion.</DialogDescription>
          </DialogHeader>
          {ingestStatusMessage && (
            <div className={`p-3 text-sm rounded flex items-center gap-2 ${ingestStatusMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {ingestStatusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {ingestStatusMessage.text}
            </div>
          )}
          <Tabs value={ingestMode} onValueChange={(val: any) => setIngestMode(val)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Single Entry</TabsTrigger>
              <TabsTrigger value="csv">CSV Bulk</TabsTrigger>
              <TabsTrigger value="simulate">Simulate Channel</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 pt-3">
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Feedback Content *</label>
                  <Textarea placeholder="Enter customer feedback text..." rows={4} className="bg-muted/50 border-muted" value={singleContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSingleContent(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Channel *</label>
                    <Select value={singleChannel} onValueChange={(val) => val && setSingleChannel(val)}>
                      <SelectTrigger className="bg-muted/50 border-muted"><SelectValue /></SelectTrigger>
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
                    <label className="text-sm font-medium text-foreground block mb-1">Customer / Label</label>
                    <Input type="text" placeholder="e.g. Alex (Enterprise)" className="bg-muted/50 border-muted" value={singleCustomer} onChange={(e) => setSingleCustomer(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowIngestDialog(false)} disabled={ingestLoading}>Cancel</Button>
                  <Button className="bg-primary" type="submit" disabled={!singleContent.trim() || ingestLoading}>
                    {ingestLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Submit Feedback
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="csv" className="space-y-4 pt-3">
              <form onSubmit={handleCsvSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Select a .csv file to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Expected columns: <code>content, channel, customer_label</code></p>
                    <p className="text-xs text-muted-foreground">Valid channels: WEBSITE, MOBILE_APP, EMAIL, API, CSV</p>
                  </div>
                  <Input type="file" accept=".csv" className="max-w-xs mx-auto bg-muted/50 cursor-pointer text-sm" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                  {csvFile && <p className="text-xs text-muted-foreground">Selected: {csvFile.name}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowIngestDialog(false)} disabled={ingestLoading}>Cancel</Button>
                  <Button className="bg-primary" type="submit" disabled={!csvFile || ingestLoading}>
                    {ingestLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Upload & Import
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="simulate" className="space-y-4 pt-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                  <Radio className="w-4 h-4 text-primary animate-pulse" /> Simulate Multi-Channel Ingestion
                </div>
                <p className="text-xs text-muted-foreground">
                  Inserts 20 realistic feedback items across all channels with varied sentiments — simulating a real integration pull.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowIngestDialog(false)} disabled={ingestLoading}>Cancel</Button>
                <Button className="bg-primary gap-2" onClick={handleSimulateSubmit} disabled={ingestLoading}>
                  {ingestLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Run Channel Simulation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Feedback Detail
            </DialogTitle>
            <DialogDescription>
              From {selectedFeedback?.customerLabel || 'Anonymous'} on {selectedFeedback ? formatDate(selectedFeedback.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Feedback Content</label>
                <p className="mt-2 p-3 bg-muted/50 rounded-lg text-foreground leading-relaxed">{selectedFeedback.content}</p>
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
                    <Badge className={getSentimentColor(selectedFeedback.sentiment)}>{selectedFeedback.sentiment || 'Not classified'}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={getStatusColor(selectedFeedback.status)}>{selectedFeedback.status}</Badge>
                    {canEdit && (
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                        disabled={updatingIds.has(selectedFeedback.id)} onClick={(e) => handleStatusAdvance(e, selectedFeedback)}>
                        {updatingIds.has(selectedFeedback.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : STATUS_LABELS[selectedFeedback.status] ?? 'Update'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {selectedFeedback.themes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Themes</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {selectedFeedback.themes.map((theme) => (
                      <Badge key={theme} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{theme}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* Actions in detail view */}
              {(canEdit || canDelete) && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  {canEdit && (
                    <Button variant="outline" size="sm" className="gap-2"
                      onClick={(e) => { setSelectedFeedback(null); openEdit(e, selectedFeedback); }}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive hover:border-destructive"
                      onClick={(e) => { setSelectedFeedback(null); openDelete(e, selectedFeedback); }}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading inbox...</div>}>
      <InboxContent />
    </Suspense>
  );
}
