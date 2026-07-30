export interface FeedbackResponse {
  id: string;
  content: string;
  channel: string;
  customerLabel: string | null;
  sourceRef: string | null;
  status: string;
  createdAt: Date;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedbackListResponse {
  data: FeedbackResponse[];
  pagination: PaginationResponse;
}

